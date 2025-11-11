from rest_framework import serializers
from .models import Customer, Item, Transaction, TransactionItem


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "price", "is_active"]


class TransactionItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, source="total_price", read_only=True
    )
    class Meta:
        model = TransactionItem
        fields = ["id", "item", "item_name", "unit_price", "quantity", "subtotal"]


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    total_amount = serializers.DecimalField(
    max_digits=10, decimal_places=2, read_only=True
    )
    

    class Meta:
        model = Transaction
        fields = [
            "id",
            "customer",
            "customer_name",
            "transaction_type",
            "total_amount",
            "amount",
            "items",
            "date",
        ]



class CustomerSerializer(serializers.ModelSerializer):
    total_debt = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_payments = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    last_transaction_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "last_transaction_date",
            "total_debt",
            "transactions",
            "total_payments",
        ]
        
    def to_representation(self, instance):
        """add computed values dynamically"""
        data = super().to_representation(instance)
        transactions = instance.transactions.all()
        
        total_debt = sum(
            t.total_amount for t in transactions if t.transaction_type == "debt"
        )
        total_payments = sum(
            t.total_amount for t in transactions if t.transaction_type == "payment"
        )
        
        
        data.update(
            {
                "total_debt": total_debt,
                "total_payments": total_payments,
                "balance": total_debt - total_payments,
            }
        )
        return data
