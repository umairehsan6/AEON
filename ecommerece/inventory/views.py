from django.shortcuts import render, get_object_or_404
from .models import Category, SubCategory, Product, Collection , CollectionProducts
from .serializer import CategorySerializer, SubCategorySerializer, ProductSerializer , CollectionSerializer, CollectionProductsSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.permissions import BasePermission


# Custom permission class for admin-only write operations
class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed for any request
        if request.method in ['GET']:
            return True
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_staff

# Create your views here.
# GET requests are public, POST/PUT/DELETE require admin authentication

# Category Views
class CategoryListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get_object(self, pk):
        return get_object_or_404(Category, pk=pk)
    
    def get(self, request, pk, *args, **kwargs):
        category = self.get_object(pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk, *args, **kwargs):
        category = self.get_object(pk)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, *args, **kwargs):
        category = self.get_object(pk)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# SubCategory Views
class SubCategoryListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        subcategories = SubCategory.objects.all()
        serializer = SubCategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = SubCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubCategoryDetailAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get_object(self, pk):
        return get_object_or_404(SubCategory, pk=pk)
    
    def get(self, request, pk, *args, **kwargs):
        subcategory = self.get_object(pk)
        serializer = SubCategorySerializer(subcategory)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk, *args, **kwargs):
        subcategory = self.get_object(pk)
        serializer = SubCategorySerializer(subcategory, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, *args, **kwargs):
        subcategory = self.get_object(pk)
        subcategory.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Product Views
class ProductListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)
    
    def get(self, request, pk, *args, **kwargs):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk, *args, **kwargs):
        product = self.get_object(pk)
        
        # Check if we need to add new inventory instead of replacing
        new_inventory_to_add = request.data.get('new_inventory_to_add', [])
        
        if new_inventory_to_add:
            print(f"Adding new inventory to product {product.name}: {new_inventory_to_add}")
            
            # Handle adding new inventory to existing stock
            if isinstance(product.total_stock_by_sizes, list):
                # Handle list format: [{"size": "XS", "quantity": 10}, {"size": "S", "quantity": 10}]
                updated_stock_list = list(product.total_stock_by_sizes)
                
                for new_item in new_inventory_to_add:
                    size = new_item.get('size')
                    quantity_to_add = int(new_item.get('quantity', 0))
                    
                    if size and quantity_to_add > 0:
                        # Find existing size in the list
                        size_found = False
                        for i, stock_item in enumerate(updated_stock_list):
                            if isinstance(stock_item, dict) and stock_item.get('size') == size:
                                # Add to existing quantity
                                current_qty = int(stock_item.get('quantity', 0))
                                updated_stock_list[i] = {'size': size, 'quantity': current_qty + quantity_to_add}
                                print(f"Added {quantity_to_add} to {size}: {current_qty} -> {current_qty + quantity_to_add}")
                                size_found = True
                                break
                        
                        if not size_found:
                            # Add new size to the list
                            updated_stock_list.append({'size': size, 'quantity': quantity_to_add})
                            print(f"Added new size {size} with quantity {quantity_to_add}")
                
                # Update the product with new stock
                product.total_stock_by_sizes = updated_stock_list
                product.save()
                
                print(f"Updated product stock: {product.total_stock_by_sizes}")
                
                # Remove the new_inventory_to_add from request data before serializing
                request_data = request.data.copy()
                request_data.pop('new_inventory_to_add', None)
                request_data['total_stock_by_sizes'] = updated_stock_list
                
                serializer = ProductSerializer(product, data=request_data)
            else:
                # Handle dict format or fallback to normal update
                serializer = ProductSerializer(product, data=request.data)
        else:
            # Normal update without adding inventory
            serializer = ProductSerializer(product, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, *args, **kwargs):
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Additional utility views
class SubCategoryByCategoryAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category_id, *args, **kwargs):
        subcategories = SubCategory.objects.filter(category_id=category_id)
        serializer = SubCategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductByCategoryAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category_id, *args, **kwargs):
        products = Product.objects.filter(category_id=category_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductBySubCategoryAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, subcategory_id, *args, **kwargs):
        products = Product.objects.filter(subcategory_id=subcategory_id)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Collection Views
class CollectionListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def get(self, request, *args, **kwargs):
        collections = Collection.objects.all()
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = CollectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CollectionDetailAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self, pk):
        return get_object_or_404(Collection, pk=pk)

    def get(self, request, pk, *args, **kwargs):
        collection = self.get_object(pk)
        serializer = CollectionSerializer(collection)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):
        collection = self.get_object(pk)
        serializer = CollectionSerializer(collection, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        collection = self.get_object(pk)
        serializer = CollectionSerializer(collection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        collection = self.get_object(pk)
        collection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CollectionProductsListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request, collection_id, *args, **kwargs):
        links = CollectionProducts.objects.filter(collection_id=collection_id)
        serializer = CollectionProductsSerializer(links, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, collection_id, *args, **kwargs):
        # Accepts list of product IDs or single mapping; avoid duplicates
        data = request.data
        created = []
        from django.db import IntegrityError

        def link_product(pid):
            try:
                link, was_created = CollectionProducts.objects.get_or_create(
                    collection_id=collection_id, product_id=pid
                )
                if was_created:
                    created.append(CollectionProductsSerializer(link).data)
            except IntegrityError:
                pass

        if isinstance(data, dict) and 'product' in data:
            link_product(data['product'])
        elif isinstance(data, dict) and 'products' in data and isinstance(data['products'], list):
            for pid in data['products']:
                link_product(pid)
        else:
            return Response({'detail': 'Provide product or products list.'}, status=status.HTTP_400_BAD_REQUEST)

        # If collection is live, mark linked products live as well
        collection = Collection.objects.get(pk=collection_id)
        if collection.is_live:
            Product.objects.filter(id__in=[item['product'] for item in created]).update(is_live=True)

        return Response(created, status=status.HTTP_201_CREATED)


class CollectionProductsDeleteAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def delete(self, request, collection_id, product_id, *args, **kwargs):
        link = get_object_or_404(CollectionProducts, collection_id=collection_id, product_id=product_id)
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)