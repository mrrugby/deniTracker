from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, ItemViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'items', ItemViewSet)
router.register(r'transactions', TransactionViewSet)



urlpatterns = [
    path('', include(router.urls)),
]
