from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Customer, Item, Transaction, TransactionItem
from .serializers import (CustomerSerializer, ItemSerializer, TransactionSerializer, )

# Create your views here.
class ItemViewSet(viewsets.ModelViewSet):
    """
    list, create, update, delete items. 
    shop owner uses this to manage the pre-loaded price list
    """
    queryset = Item.objects.filter(is_active=True).order_by("name")
    serializer_class = ItemSerializer
    
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().select_related("customer").prefetch_related("items__item")
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        items_data = data.pop("items", [])

        # Create the transaction
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()

        # Only create TransactionItem objects for debt
        if transaction.transaction_type == "debt":
            for item in items_data:
                TransactionItem.objects.create(
                    transaction=transaction,
                    item_id=item["item"],
                    quantity=item.get("quantity", 1),
                    unit_price=Item.objects.get(id=item["item"]).price
                )

        headers = self.get_success_headers(serializer.data)
        return Response(self.get_serializer(transaction).data, status=status.HTTP_201_CREATED, headers=headers)
    
@action(detail=False, methods=["get"])
def by_customer(self, request):
    """
    optional endpoint: api/transactions/by_customer/?customer_id=1
    returns all transactions for a customer with id 1
    """
    customer_id = request.query_params.get("customer_id")
    if not customer_id:
        return Response({"detail": "customer_id is required"}, status=400)
    qs = self.queryset.filter(customer_id=customer_id)
    return Response(self.get_serializer(qs, many=True).data)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD + summary for customers.
    Includes computed totals and transactions.
    """
    queryset = Customer.objects.all().prefetch_related("transactions__items__item")
    serializer_class = CustomerSerializer

    @action(detail=True, methods=["get"])
    def transactions(self, request, pk=None):
        """
        GET /api/customers/<id>/transactions/
        """
        customer = self.get_object()
        transactions = customer.transactions.all()
        data = TransactionSerializer(transactions, many=True).data
        return Response(data)