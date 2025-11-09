from rest_framework import serializers
from .models import Customer, Item, Transaction, TransactionItem


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "name", "price", "is_active"]


class TransactionItemSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField(source="item.name")
    item_price = serializers.ReadOnlyField(source="item.price")
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = TransactionItem
        fields = [
            "id",
            "item",
            "item_name",
            "item_price",
            "quantity",
            "unit_price",
            "total_price",
        ]
        read_only_fields = ("unit_price", "total_price")

    def create(self, validated_data):
        if not validated_data.get("unit_price"):
            validated_data["unit_price"] = validated_data["item"].price
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "customer",
            "customer_name",
            "transaction_type",
            "date",
            "amount",
            "items",
            "total_amount",
        ]

    def create(self, validated_data):
        """Handle nested creation for debts"""
        items_data = validated_data.pop("items", [])
        transaction = Transaction.objects.create(**validated_data)

        if transaction.transaction_type == "debt":
            for item_data in items_data:
                TransactionItem.objects.create(transaction=transaction, **item_data)
        return transaction


class CustomerSerializer(serializers.ModelSerializer):
    total_debt = serializers.ReadOnlyField()
    total_payments = serializers.ReadOnlyField()
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "created_at",
            "total_debt",
            "total_payments",
            "transactions",
        ]
