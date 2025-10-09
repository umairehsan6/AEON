from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializer import CartSerializer, CartItemSerializer
from inventory.models import Product


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        product_id = request.data.get('product')
        size = request.data.get('size')
        quantity = int(request.data.get('quantity', 1))
        product = get_object_or_404(Product, pk=product_id)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, size=size,
            defaults={'quantity': quantity, 'price_at_add': product.price}
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=['quantity'])

        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is not None:
            quantity = int(quantity)
            if quantity < 1:
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            item.quantity = quantity
            item.save(update_fields=['quantity'])
        return Response(CartItemSerializer(item).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        # For simplicity, assume payment succeeds, then clear selected items or full cart
        item_ids = request.data.get('item_ids')
        if isinstance(item_ids, list) and item_ids:
            CartItem.objects.filter(cart=cart, id__in=item_ids).delete()
        else:
            cart.items.all().delete()
        return Response({'detail': 'Checkout complete'}, status=status.HTTP_200_OK)

