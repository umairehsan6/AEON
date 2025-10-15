from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Order, OrderItem
from .serializer import OrderSerializer, CheckoutSerializer
from cart.models import Cart, CartItem
from inventory.models import Product


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CheckoutCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        print("=== CHECKOUT STARTED ===")
        print(f"User: {request.user}")
        print(f"Request data: {request.data}")
        
        ser = CheckoutSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        cart = get_or_create_cart(request.user)
        items_qs = cart.items.all()
        if data.get('item_ids'):
            items_qs = items_qs.filter(id__in=data['item_ids'])

        print(f"Cart items count: {items_qs.count()}")
        for item in items_qs:
            print(f"Cart item: {item.product.name}, size: {item.size}, qty: {item.quantity}")

        if not items_qs.exists():
            print("No items to checkout!")
            return Response({'detail': 'No items to checkout'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate subtotal from cart items
        subtotal = sum(float(item.price_at_add) * item.quantity for item in items_qs)
        
        # Calculate shipping charges (you can customize this logic)
        # For now, using a simple flat rate of $5.99
        shipping_charges = 5.99
        
        # Calculate total amount
        total_amount = subtotal + shipping_charges
        
        print(f"Order calculation: Subtotal=${subtotal:.2f}, Shipping=${shipping_charges:.2f}, Total=${total_amount:.2f}")
        
        # Update user's phone number if provided
        if data.get('phone'):
            request.user.phone = data['phone']
            request.user.save(update_fields=['phone'])
            print(f"Updated user phone number to: {data['phone']}")

        # Create order
        order = Order.objects.create(
            user=request.user,
            first_address=data['first_address'],
            second_address=data.get('second_address'),
            is_office_address=data.get('is_office_address', False),
            ip_address=request.META.get('REMOTE_ADDR'),
            subtotal=subtotal,
            shipping_charges=shipping_charges,
            total_amount=total_amount,
        )

        # Move items to order + decrement stock
        for item in items_qs.select_related('product'):
            product = item.product
            
            print(f"Processing item: {product.name}, size: {item.size}, quantity: {item.quantity}")
            print(f"Product ID: {product.id}")
            print(f"Product total_stock_by_sizes: {product.total_stock_by_sizes}")
            print(f"Type of total_stock_by_sizes: {type(product.total_stock_by_sizes)}")
            print(f"Product sizes field: {product.sizes}")
            print(f"Type of sizes field: {type(product.sizes)}")
            
            # Check and decrement stock - handle both dict and list formats
            current_stock = 0
            stock_updated = False
            
            if isinstance(product.total_stock_by_sizes, dict) and item.size:
                # Handle dict format: {"XS": 10, "S": 10}
                current_stock = int(product.total_stock_by_sizes.get(item.size, 0))
                print(f"Current stock for size {item.size} (dict format): {current_stock}")
                
                # Check if enough stock is available
                if current_stock < item.quantity:
                    transaction.set_rollback(True)
                    return Response({
                        'detail': f'Not enough stock for {product.name} in size {item.size}. Available: {current_stock}, Requested: {item.quantity}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Decrement stock
                new_stock = current_stock - item.quantity
                
                # Create a new dict to ensure Django detects the change
                updated_stock = dict(product.total_stock_by_sizes)
                updated_stock[item.size] = new_stock
                product.total_stock_by_sizes = updated_stock
                stock_updated = True
                
            elif isinstance(product.total_stock_by_sizes, list) and item.size:
                # Handle list format: [{"size": "XS", "quantity": 10}, {"size": "S", "quantity": 10}]
                print(f"Processing list format stock data")
                
                # Find the size in the list
                size_found = False
                updated_stock_list = []
                
                for stock_item in product.total_stock_by_sizes:
                    if isinstance(stock_item, dict) and stock_item.get('size') == item.size:
                        current_stock = int(stock_item.get('quantity', 0))
                        print(f"Current stock for size {item.size} (list format): {current_stock}")
                        
                        # Check if enough stock is available
                        if current_stock < item.quantity:
                            transaction.set_rollback(True)
                            return Response({
                                'detail': f'Not enough stock for {product.name} in size {item.size}. Available: {current_stock}, Requested: {item.quantity}'
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Decrement stock
                        new_stock = current_stock - item.quantity
                        updated_stock_list.append({'size': item.size, 'quantity': new_stock})
                        print(f"Stock updated for {product.name} size {item.size}: {current_stock} -> {new_stock}")
                        size_found = True
                    else:
                        updated_stock_list.append(stock_item)
                
                if size_found:
                    product.total_stock_by_sizes = updated_stock_list
                    stock_updated = True
                else:
                    print(f"Size {item.size} not found in stock list")
            
            if stock_updated:
                # Force save without update_fields to ensure JSONField is saved
                product.save()
                
                print(f"Stock data saved successfully")
                
                # Verify the save worked by fetching fresh from DB
                product.refresh_from_db()
                
                # Check the updated stock based on format
                if isinstance(product.total_stock_by_sizes, dict):
                    print(f"Verified stock after save (dict): {product.total_stock_by_sizes[item.size]}")
                elif isinstance(product.total_stock_by_sizes, list):
                    for stock_item in product.total_stock_by_sizes:
                        if isinstance(stock_item, dict) and stock_item.get('size') == item.size:
                            print(f"Verified stock after save (list): {stock_item.get('quantity')}")
                            break
                
                # Double check with a direct DB query
                from inventory.models import Product
                fresh_product = Product.objects.get(id=product.id)
                if isinstance(fresh_product.total_stock_by_sizes, dict):
                    print(f"Direct DB query stock (dict): {fresh_product.total_stock_by_sizes[item.size]}")
                elif isinstance(fresh_product.total_stock_by_sizes, list):
                    for stock_item in fresh_product.total_stock_by_sizes:
                        if isinstance(stock_item, dict) and stock_item.get('size') == item.size:
                            print(f"Direct DB query stock (list): {stock_item.get('quantity')}")
                            break
                
                # Also check if the transaction is working
                print(f"Transaction is active: {transaction.get_connection().in_atomic_block}")
            else:
                # Handle case where stock format is not recognized
                print(f"Warning: Could not update stock for {product.name}")
                print(f"  - total_stock_by_sizes: {product.total_stock_by_sizes}")
                print(f"  - size: {item.size}")
                print(f"  - is dict: {isinstance(product.total_stock_by_sizes, dict)}")
                print(f"  - is list: {isinstance(product.total_stock_by_sizes, list)}")

            OrderItem.objects.create(
                order=order,
                product=product,
                size=item.size,
                quantity=item.quantity,
                price_at_purchase=item.price_at_add,
            )

        # Clear checked-out items from cart
        items_qs.delete()
        
        print("=== CHECKOUT COMPLETED SUCCESSFULLY ===")
        print(f"Order created: {order.id}")
        
        # Final verification - check stock after transaction
        print("=== FINAL STOCK VERIFICATION ===")
        for item in order.items.all():
            product = item.product
            if isinstance(product.total_stock_by_sizes, dict) and item.size:
                print(f"Final stock for {product.name} size {item.size}: {product.total_stock_by_sizes[item.size]}")
            elif isinstance(product.total_stock_by_sizes, list) and item.size:
                for stock_item in product.total_stock_by_sizes:
                    if isinstance(stock_item, dict) and stock_item.get('size') == item.size:
                        print(f"Final stock for {product.name} size {item.size}: {stock_item.get('quantity')}")
                        break

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


class UserCheckoutDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get user's latest order for address pre-filling
        latest_order = Order.objects.filter(user=request.user).order_by('-created_at').first()
        
        data = {
            'user': {
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'email': request.user.email,
                'phone': getattr(request.user, 'phone', ''),
            },
            'addresses': {
                'first_address': latest_order.first_address if latest_order else '',
                'second_address': latest_order.second_address if latest_order else '',
                'is_office_address': latest_order.is_office_address if latest_order else False,
            }
        }
        return Response(data, status=status.HTTP_200_OK)


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        orders = Order.objects.all().order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


class OrderStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, order_id, *args, **kwargs):
        order = get_object_or_404(Order, pk=order_id)
        status_val = request.data.get('status')
        return_reason = request.data.get('return_reason', '')
        valid = {c[0] for c in Order.STATUS_CHOICES}
        if status_val not in valid:
            return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If returning to returned status, restock items
        if status_val == 'returned':
            order.return_reason = return_reason
            for item in order.items.all():
                product = item.product
                
                if isinstance(product.total_stock_by_sizes, dict) and item.size:
                    # Handle dict format
                    current = int(product.total_stock_by_sizes.get(item.size, 0))
                    new_stock = current + item.quantity
                    
                    # Create new dict to ensure Django detects the change
                    updated_stock = dict(product.total_stock_by_sizes)
                    updated_stock[item.size] = new_stock
                    product.total_stock_by_sizes = updated_stock
                    product.save()
                    
                    print(f"Restocked {product.name} size {item.size}: {current} -> {new_stock}")
                    
                elif isinstance(product.total_stock_by_sizes, list) and item.size:
                    # Handle list format
                    updated_stock_list = []
                    size_found = False
                    
                    for stock_item in product.total_stock_by_sizes:
                        if isinstance(stock_item, dict) and stock_item.get('size') == item.size:
                            current = int(stock_item.get('quantity', 0))
                            new_stock = current + item.quantity
                            updated_stock_list.append({'size': item.size, 'quantity': new_stock})
                            print(f"Restocked {product.name} size {item.size}: {current} -> {new_stock}")
                            size_found = True
                        else:
                            updated_stock_list.append(stock_item)
                    
                    if size_found:
                        product.total_stock_by_sizes = updated_stock_list
                        product.save()
        
        order.status = status_val
        order.save(update_fields=['status', 'return_reason'])
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class TestStockUpdateView(APIView):
    """Test endpoint to debug stock update issues"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        size = request.data.get('size')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id)
            print(f"Testing stock update for product: {product.name}")
            print(f"Current stock: {product.total_stock_by_sizes}")
            
            if isinstance(product.total_stock_by_sizes, dict) and size:
                current_stock = int(product.total_stock_by_sizes.get(size, 0))
                new_stock = current_stock - quantity
                
                # Create new dict and save
                updated_stock = dict(product.total_stock_by_sizes)
                updated_stock[size] = new_stock
                product.total_stock_by_sizes = updated_stock
                product.save()
                
                # Verify
                product.refresh_from_db()
                fresh_product = Product.objects.get(id=product.id)
                
                return Response({
                    'success': True,
                    'product_name': product.name,
                    'size': size,
                    'old_stock': current_stock,
                    'new_stock': new_stock,
                    'verified_stock': fresh_product.total_stock_by_sizes[size],
                    'full_stock_dict': fresh_product.total_stock_by_sizes
                })
            else:
                return Response({
                    'error': 'Invalid product or size',
                    'product_stock': product.total_stock_by_sizes,
                    'size': size
                })
                
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)


class SalesStatisticsAPIView(APIView):
    """API for sales statistics with month filtering"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, *args, **kwargs):
        # Get filter parameters
        month = request.GET.get('month')  # Format: YYYY-MM
        year = request.GET.get('year')    # Format: YYYY
        period = request.GET.get('period', 'current')  # current, last, custom
        
        # Calculate date ranges
        now = timezone.now()
        
        if period == 'current':
            # Current month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == 'last':
            # Last month
            if now.month == 1:
                start_date = now.replace(year=now.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                start_date = now.replace(month=now.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date.replace(month=start_date.month+1) - timedelta(days=1)
        elif period == 'custom' and month and year:
            # Custom month/year
            try:
                start_date = datetime(int(year), int(month), 1, tzinfo=timezone.utc)
                if int(month) == 12:
                    end_date = datetime(int(year)+1, 1, 1, tzinfo=timezone.utc) - timedelta(days=1)
                else:
                    end_date = datetime(int(year), int(month)+1, 1, tzinfo=timezone.utc) - timedelta(days=1)
            except ValueError:
                return Response({'error': 'Invalid month/year format'}, status=400)
        else:
            # Default to current month
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        
        # Filter orders by date range
        orders = Order.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Calculate statistics
        total_orders = orders.count()
        total_revenue = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        total_shipping = orders.aggregate(total=Sum('shipping_charges'))['total'] or 0
        total_subtotal = orders.aggregate(total=Sum('subtotal'))['total'] or 0
        
        # Order status breakdown
        status_breakdown = orders.values('status').annotate(count=Count('id')).order_by('status')
        
        # Daily sales for the period
        daily_sales = orders.extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(
            daily_revenue=Sum('total_amount'),
            daily_orders=Count('id')
        ).order_by('day')
        
        # Top selling products (by quantity)
        top_products = OrderItem.objects.filter(
            order__created_at__gte=start_date,
            order__created_at__lte=end_date
        ).values(
            'product__name', 'product__id'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('price_at_purchase')
        ).order_by('-total_quantity')[:10]
        
        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Previous period comparison (for growth calculation)
        if period == 'current':
            # Compare with last month
            prev_start = start_date.replace(month=start_date.month-1) if start_date.month > 1 else start_date.replace(year=start_date.year-1, month=12)
            prev_end = start_date - timedelta(days=1)
        elif period == 'last':
            # Compare with month before last month
            if start_date.month <= 2:
                prev_start = start_date.replace(year=start_date.year-1, month=start_date.month+10)
            else:
                prev_start = start_date.replace(month=start_date.month-2)
            prev_end = start_date - timedelta(days=1)
        else:
            # For custom periods, compare with previous month
            prev_start = start_date - timedelta(days=30)
            prev_end = start_date - timedelta(days=1)
        
        prev_orders = Order.objects.filter(
            created_at__gte=prev_start,
            created_at__lte=prev_end
        )
        prev_revenue = prev_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        prev_count = prev_orders.count()
        
        # Calculate growth percentages
        revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        orders_growth = ((total_orders - prev_count) / prev_count * 100) if prev_count > 0 else 0
        
        return Response({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'period_type': period
            },
            'summary': {
                'total_orders': total_orders,
                'total_revenue': float(total_revenue),
                'total_shipping': float(total_shipping),
                'total_subtotal': float(total_subtotal),
                'average_order_value': float(avg_order_value),
                'revenue_growth': round(revenue_growth, 2),
                'orders_growth': round(orders_growth, 2)
            },
            'status_breakdown': list(status_breakdown),
            'daily_sales': list(daily_sales),
            'top_products': list(top_products),
            'comparison': {
                'previous_period_revenue': float(prev_revenue),
                'previous_period_orders': prev_count
            }
        }, status=status.HTTP_200_OK)
