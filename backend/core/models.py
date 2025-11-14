from django.db import models
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP, localcontext
from django.core.exceptions import ValidationError

# Create your models here.

class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    @property
    def total_debt(self):
        """Sum of all debt transactions"""
        return sum(t.total_amount for t in self.transactions.filter(transaction_type="debt"))
    
    @property
    def total_payments(self):
        """sum of all payments"""
        return sum(t.total_amount for t in self.transactions.filter(transaction_type="payment"))
    
    @property
    def total_balance(self):
        """remaining debt to be paid"""
        return self.total_debt - self.total_payments
    
    
class Item(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.price} KSH)" 
    
    
    def save(self, *args, **kwargs):
        is_update = self.pk is not None
        if is_update:
            old_item = Item.objects.get(pk=self.pk)
            old_price = old_item.price
        else:
            old_price = None

        super().save(*args, **kwargs)

    # Create price history only if price changed
        if is_update and old_price != self.price:
            try:
                PriceHistory.objects.create(
                item=self,
                old_price=old_price,
                new_price=self.price
            )
            except Exception as e:
            # Log error but do not fail saving item
                print(f"Failed to create PriceHistory: {e}")    
    
class PriceHistory(models.Model):
    """track price changes for audit"""
    
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='price_history') 
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name_plural = 'price history' 
        
    def __str__(self):
        return f"{self.item.name}: {self.old_price} → {self.new_price} on {self.changed_at.date()}"
    
      
class Transaction(models.Model):
    TRANSACTION_TYPES = [
         ("debt", "Debt Added"),
        ("payment", "Payment Received"),
    ]
            
        
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="transactions"
        )
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateTimeField(default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="used for payments only")
    
    def clean(self):
        if self.transaction_type == "payment":
            if not self.amount or self.amount <= Decimal("0.00"):
                raise ValidationError({"amount": "Payments must have positive amount"})
            if self.pk and self.items.exists():
                raise ValidationError({"Payment transactions should not haveline items"})
        else:
            if self.amount not in (None, Decimal("0.00")):
                raise ValidationError({"amount": "Debt transactions should not set 'amount' directly; use items."})
            
    def __str__(self):
            return f"{self.customer.name} - {self.transaction_type} ({self.date.date()})"
    
    @property
    def total_amount(self):
        """if debt, sum items. if payments, return amount directly"""
        if self.transaction_type == "payment":
            return self.amount or Decimal("0.00")
        return sum(i.total_price for i in self.items.all())
    
class TransactionItem(models.Model):
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="items"
    )
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveBigIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    
    def save(self, *args, **kwargs):
        if not self.pk:
            self.unit_price = self.item.price
        self.unit_price = Decimal(self.unit_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        super().save(*args, **kwargs)

    
    def __str__(self):
        return f"{self.item.name} x{self.quantity} @ {self.unit_price} KSH"
    
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price