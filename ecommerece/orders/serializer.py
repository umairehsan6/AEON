from rest_framework import serializers
from .models import Order, OrderItem
from inventory.serializer import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'size', 'quantity', 'price_at_purchase']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    # User details from User model
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'first_name', 'last_name', 'email', 'phone', 'first_address', 'second_address', 'is_office_address', 'return_reason', 'ip_address',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'ip_address', 'created_at', 'updated_at']


class CheckoutSerializer(serializers.Serializer):
    first_address = serializers.CharField(max_length=255)
    second_address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_office_address = serializers.BooleanField(default=False)
    item_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=True, required=False)

