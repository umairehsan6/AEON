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

    def _check_and_reserve_stock(self, product, size, quantity):
        """Check if there's enough stock and reserve it by decrementing"""
        if not product.total_stock_by_sizes:
            return False
        
        # Handle different stock formats
        stock_data = product.total_stock_by_sizes
        
        if isinstance(stock_data, list):
            # Format: [{"size": "S", "quantity": 10}, {"size": "M", "quantity": 5}]
            for stock_item in stock_data:
                if isinstance(stock_item, dict) and stock_item.get('size') == size:
                    current_stock = int(stock_item.get('quantity', 0))
                    if current_stock >= quantity:
                        # Decrement the stock
                        stock_item['quantity'] = current_stock - quantity
                        product.save()
                        return True
                    return False
        elif isinstance(stock_data, dict):
            # Format: {"S": 10, "M": 5}
            if size in stock_data:
                current_stock = int(stock_data[size])
                if current_stock >= quantity:
                    # Decrement the stock
                    stock_data[size] = current_stock - quantity
                    product.save()
                    return True
                return False
        
        return False

    def _release_stock(self, product, size, quantity):
        """Release stock back to inventory (when removing from cart)"""
        if not product.total_stock_by_sizes:
            return
        
        stock_data = product.total_stock_by_sizes
        
        if isinstance(stock_data, list):
            # Format: [{"size": "S", "quantity": 10}, {"size": "M", "quantity": 5}]
            for stock_item in stock_data:
                if isinstance(stock_item, dict) and stock_item.get('size') == size:
                    current_stock = int(stock_item.get('quantity', 0))
                    stock_item['quantity'] = current_stock + quantity
                    product.save()
                    return
        elif isinstance(stock_data, dict):
            # Format: {"S": 10, "M": 5}
            if size in stock_data:
                current_stock = int(stock_data[size])
                stock_data[size] = current_stock + quantity
                product.save()

    def get(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        product_id = request.data.get('product')
        size = request.data.get('size')
        quantity = int(request.data.get('quantity', 1))
        product = get_object_or_404(Product, pk=product_id)

        # Check if there's enough stock available
        if not self._check_and_reserve_stock(product, size, quantity):
            return Response(
                {'error': f'Not enough stock available for size {size}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, size=size,
            defaults={'quantity': quantity, 'price_at_add': product.price}
        )
        if not created:
            # Check if adding more quantity would exceed available stock
            total_quantity = item.quantity + quantity
            if not self._check_and_reserve_stock(product, size, total_quantity):
                return Response(
                    {'error': f'Not enough stock available for size {size}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity += quantity
            item.save(update_fields=['quantity'])

        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _check_and_reserve_stock(self, product, size, quantity):
        """Check if there's enough stock and reserve it by decrementing"""
        if not product.total_stock_by_sizes:
            return False
        
        # Handle different stock formats
        stock_data = product.total_stock_by_sizes
        
        if isinstance(stock_data, list):
            # Format: [{"size": "S", "quantity": 10}, {"size": "M", "quantity": 5}]
            for stock_item in stock_data:
                if isinstance(stock_item, dict) and stock_item.get('size') == size:
                    current_stock = int(stock_item.get('quantity', 0))
                    if current_stock >= quantity:
                        # Decrement the stock
                        stock_item['quantity'] = current_stock - quantity
                        product.save()
                        return True
                    return False
        elif isinstance(stock_data, dict):
            # Format: {"S": 10, "M": 5}
            if size in stock_data:
                current_stock = int(stock_data[size])
                if current_stock >= quantity:
                    # Decrement the stock
                    stock_data[size] = current_stock - quantity
                    product.save()
                    return True
                return False
        
        return False

    def _release_stock(self, product, size, quantity):
        """Release stock back to inventory (when removing from cart)"""
        if not product.total_stock_by_sizes:
            return
        
        stock_data = product.total_stock_by_sizes
        
        if isinstance(stock_data, list):
            # Format: [{"size": "S", "quantity": 10}, {"size": "M", "quantity": 5}]
            for stock_item in stock_data:
                if isinstance(stock_item, dict) and stock_item.get('size') == size:
                    current_stock = int(stock_item.get('quantity', 0))
                    stock_item['quantity'] = current_stock + quantity
                    product.save()
                    return
        elif isinstance(stock_data, dict):
            # Format: {"S": 10, "M": 5}
            if size in stock_data:
                current_stock = int(stock_data[size])
                stock_data[size] = current_stock + quantity
                product.save()

    def patch(self, request, item_id, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is not None:
            quantity = int(quantity)
            if quantity < 1:
                # Release stock before deleting
                self._release_stock(item.product, item.size, item.quantity)
                item.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            # Calculate the difference in quantity
            old_quantity = item.quantity
            quantity_diff = quantity - old_quantity
            
            if quantity_diff > 0:
                # Adding more items - check and reserve stock
                if not self._check_and_reserve_stock(item.product, item.size, quantity_diff):
                    return Response(
                        {'error': f'Not enough stock available for size {item.size}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif quantity_diff < 0:
                # Removing items - release stock
                self._release_stock(item.product, item.size, abs(quantity_diff))
            
            item.quantity = quantity
            item.save(update_fields=['quantity'])
        return Response(CartItemSerializer(item).data, status=status.HTTP_200_OK)

    def delete(self, request, item_id, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        # Release stock before deleting
        self._release_stock(item.product, item.size, item.quantity)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_cart(request.user)
        # For simplicity, assume payment succeeds, then clear selected items or full cart
        # Note: Stock remains decremented after checkout (items are sold)
        item_ids = request.data.get('item_ids')
        if isinstance(item_ids, list) and item_ids:
            CartItem.objects.filter(cart=cart, id__in=item_ids).delete()
        else:
            cart.items.all().delete()
        return Response({'detail': 'Checkout complete'}, status=status.HTTP_200_OK)

