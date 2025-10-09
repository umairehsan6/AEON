from django.urls import path
from .views import CheckoutCreateView, MyOrdersView, AdminOrdersView, OrderStatusUpdateView, UserCheckoutDataView, TestStockUpdateView

urlpatterns = [
    path('checkout/', CheckoutCreateView.as_view(), name='orders-checkout'),
    path('checkout-data/', UserCheckoutDataView.as_view(), name='orders-checkout-data'),
    path('mine/', MyOrdersView.as_view(), name='orders-mine'),
    path('admin-list/', AdminOrdersView.as_view(), name='orders-admin-list'),
    path('<int:order_id>/status/', OrderStatusUpdateView.as_view(), name='orders-status-update'),
    path('test-stock/', TestStockUpdateView.as_view(), name='test-stock-update'),
]

