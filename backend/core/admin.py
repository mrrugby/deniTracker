from django.contrib import admin
from .models import *
from django.utils.html import format_html

# Register your models here.
class PriceHistoryInLine(admin.TabularInline):
    model =PriceHistory
    extra = 0
    readonly_fields = ("old_price", "new_price", "changed_at")
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False
    
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ("item", "old_price", "new_price", "changed_at")
    list_filter = ("changed_at",)
    search_fields = ("item_name",)
    readonly_fields = ("item", "old_price", "new_price", "changed_at")
    
    
    
class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 1
    
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("customer","transaction_type", "date", "total_amount")
    list_filter = ("transaction_type", "date")
    search_fields = ("customer_name",)
    inlines = [TransactionItemInline]
    
    def get_inlines(self, request, obj=None):
        """only show items inline for 'debt' transactions"""
        if obj and obj.transaction_type == "payment":
            return []
        return [TransactionItemInline]
    
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "display_balance", "created_at")
    search_fields = ("name", "phone",)
    readonly_fields = ("balance_summary",)

    fieldsets = (
        (None, {
            "fields": ("name", "phone", "balance_summary"),
        }),
    )
    


    def display_balance(self, obj):
        color = "red" if obj.total_balance > 0 else "green"
        # Pre-format before passing to format_html
        balance = f"{float(obj.total_balance or 0):.2f}"
        return format_html(
            "<b><span style='color:{};'>KSH {}</span></b>",
            color,
            balance
        )
    display_balance.short_description = "Current Debt"

    def balance_summary(self, obj):
        color = "red" if obj.total_balance > 0 else "green"
        debt = f"{float(obj.total_debt or 0):.2f}"
        paid = f"{float(obj.total_payments or 0):.2f}"
        balance = f"{float(obj.total_balance or 0):.2f}"

        return format_html(
            """
            <div style='padding:10px; background:#f9f9f9; border-radius:6px;'>
                <p><b>Total Debt:</b> KSH {}</p>
                <p><b>Total Payments:</b> KSH {}</p>
                <hr>
                <p><b>Outstanding Balance:</b>
                <span style='color:{};'>KSH {}</span></p>
            </div>
            """,
            debt,
            paid,
            color,
            balance
        )
    balance_summary.short_description = "Balance Summary"

            
    

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "is_active")
    search_fields = ("name",)
