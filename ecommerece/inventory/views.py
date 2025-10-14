from django.shortcuts import render, get_object_or_404
from django.db import models
from .models import Category, SubCategory, Product, Collection , CollectionProducts
from .serializer import CategorySerializer, SubCategorySerializer, ProductSerializer , CollectionSerializer, CollectionProductsSerializer
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.permissions import BasePermission
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
import uuid
from PIL import Image
import io


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
        
        print(f"PUT request for product {pk}: {product.name}")
        print(f"Request data: {request.data}")
        print(f"Request user: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        
        # Check if we need to add new inventory instead of replacing
        new_inventory_to_add = request.data.get('new_inventory_to_add', [])
        print(f"New inventory to add: {new_inventory_to_add}")
        
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
            print(f"Product {pk} updated successfully")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print(f"Serializer validation failed for product {pk}: {serializer.errors}")
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
        print(f"POST request for collection creation: {request.data}")
        print(f"Request user: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        
        serializer = CollectionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print(f"Collection created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(f"Collection creation validation failed: {serializer.errors}")
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
        print(f"PUT request for collection {pk}: {request.data}")
        print(f"Request user: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        
        serializer = CollectionSerializer(collection, data=request.data)
        if serializer.is_valid():
            serializer.save()
            print(f"Collection {pk} updated successfully via PUT")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print(f"Collection {pk} PUT validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        collection = self.get_object(pk)
        print(f"PATCH request for collection {pk}: {request.data}")
        print(f"Request user: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        print(f"Current collection data: name={collection.name}, is_live={collection.is_live}")
        
        serializer = CollectionSerializer(collection, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print(f"Collection {pk} updated successfully via PATCH")
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print(f"Collection {pk} PATCH validation failed: {serializer.errors}")
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
        print(f"POST request for collection {collection_id} products: {request.data}")
        print(f"Request user: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        
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

        print(f"Collection products added successfully: {len(created)} products linked")
        return Response(created, status=status.HTTP_201_CREATED)


class CollectionProductsDeleteAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def delete(self, request, collection_id, product_id, *args, **kwargs):
        link = get_object_or_404(CollectionProducts, collection_id=collection_id, product_id=product_id)
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Image Management Views
class ProductImageUploadAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def post(self, request, product_id, *args, **kwargs):
        """Add new images to a product"""
        product = get_object_or_404(Product, pk=product_id)
        
        # Get images from request
        images_data = request.data.get('images', [])
        if not images_data:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize image_url if it doesn't exist
        if not product.image_url:
            product.image_url = []
        
        # Add new images
        for img_data in images_data:
            if not isinstance(img_data, dict) or 'url' not in img_data:
                continue
                
            # Generate unique ID for the image
            img_id = img_data.get('id', f"img_{len(product.image_url) + 1}")
            
            # Check if ID already exists
            existing_ids = [img.get('id') for img in product.image_url if img.get('id')]
            counter = 1
            while img_id in existing_ids:
                img_id = f"img_{len(product.image_url) + counter}"
                counter += 1
            
            new_image = {
                'id': img_id,
                'url': img_data['url'],
                'alt': img_data.get('alt', f'Product image {len(product.image_url) + 1}'),
                'is_primary': img_data.get('is_primary', False),
                'order': img_data.get('order', len(product.image_url) + 1)
            }
            
            product.image_url.append(new_image)
        
        # Ensure only one primary image
        primary_count = sum(1 for img in product.image_url if img.get('is_primary', False))
        if primary_count > 1:
            # Keep only the first primary image, remove primary flag from others
            found_primary = False
            for img in product.image_url:
                if img.get('is_primary', False):
                    if found_primary:
                        img['is_primary'] = False
                    else:
                        found_primary = True
        elif primary_count == 0 and len(product.image_url) > 0:
            # Make the first image primary
            product.image_url[0]['is_primary'] = True
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductImageDeleteAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def delete(self, request, product_id, image_id, *args, **kwargs):
        """Delete a specific image from a product"""
        product = get_object_or_404(Product, pk=product_id)
        
        if not product.image_url or not isinstance(product.image_url, list):
            return Response({'error': 'No images found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find and remove the image
        original_length = len(product.image_url)
        product.image_url = [img for img in product.image_url if img.get('id') != image_id]
        
        if len(product.image_url) == original_length:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # If we deleted the primary image, make the first remaining image primary
        primary_count = sum(1 for img in product.image_url if img.get('is_primary', False))
        if primary_count == 0 and len(product.image_url) > 0:
            product.image_url[0]['is_primary'] = True
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductImageReorderAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def put(self, request, product_id, *args, **kwargs):
        """Reorder images for a product"""
        product = get_object_or_404(Product, pk=product_id)
        
        if not product.image_url or not isinstance(product.image_url, list):
            return Response({'error': 'No images found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get new order from request
        new_order = request.data.get('image_order', [])
        if not isinstance(new_order, list):
            return Response({'error': 'image_order must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a mapping of image_id to new order
        order_mapping = {img_id: i + 1 for i, img_id in enumerate(new_order)}
        
        # Update the order of images
        for img in product.image_url:
            img_id = img.get('id')
            if img_id in order_mapping:
                img['order'] = order_mapping[img_id]
        
        # Sort images by new order
        product.image_url.sort(key=lambda x: x.get('order', 999))
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductSetPrimaryImageAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def put(self, request, product_id, image_id, *args, **kwargs):
        """Set a specific image as primary"""
        product = get_object_or_404(Product, pk=product_id)
        
        if not product.image_url or not isinstance(product.image_url, list):
            return Response({'error': 'No images found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find the target image
        target_image = None
        for img in product.image_url:
            if img.get('id') == image_id:
                target_image = img
                break
        
        if not target_image:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Remove primary flag from all images
        for img in product.image_url:
            img['is_primary'] = False
        
        # Set the target image as primary
        target_image['is_primary'] = True
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


# File Upload Views for Render
class ProductImageFileUploadAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    
    def post(self, request, product_id, *args, **kwargs):
        """Upload image files directly to the server"""
        product = get_object_or_404(Product, pk=product_id)
        
        # Check if files are provided
        if 'images' not in request.FILES:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_files = request.FILES.getlist('images')
        if not uploaded_files:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize image_url if it doesn't exist
        if not product.image_url:
            product.image_url = []
        
        uploaded_images = []
        
        for file in uploaded_files:
            # Validate file type
            if not file.content_type.startswith('image/'):
                continue
            
            # Generate unique filename
            file_extension = os.path.splitext(file.name)[1]
            unique_filename = f"product_{product_id}_{uuid.uuid4().hex}{file_extension}"
            
            # Create directory structure
            upload_path = f"products/{product_id}/{unique_filename}"
            
            try:
                # Process and save the image
                processed_file = self.process_image(file)
                
                # Save to media storage
                saved_path = default_storage.save(upload_path, processed_file)
                
                # Generate URL for the saved file
                if settings.DEBUG:
                    # Development: use local media URL
                    image_url = f"{settings.MEDIA_URL}{saved_path}"
                else:
                    # Production: use full domain URL
                    image_url = f"{request.build_absolute_uri('/')[:-1]}{settings.MEDIA_URL}{saved_path}"
                
                # Create image object
                img_id = f"img_{len(product.image_url) + 1}"
                new_image = {
                    'id': img_id,
                    'url': image_url,
                    'alt': f"{product.name} image {len(product.image_url) + 1}",
                    'is_primary': len(product.image_url) == 0,  # First image is primary
                    'order': len(product.image_url) + 1,
                    'filename': unique_filename,
                    'original_name': file.name
                }
                
                product.image_url.append(new_image)
                uploaded_images.append(new_image)
                
            except Exception as e:
                print(f"Error processing image {file.name}: {str(e)}")
                continue
        
        if not uploaded_images:
            return Response({'error': 'No valid images were uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure only one primary image
        primary_count = sum(1 for img in product.image_url if img.get('is_primary', False))
        if primary_count > 1:
            # Keep only the first primary image
            found_primary = False
            for img in product.image_url:
                if img.get('is_primary', False):
                    if found_primary:
                        img['is_primary'] = False
                    else:
                        found_primary = True
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response({
            'message': f'Successfully uploaded {len(uploaded_images)} images',
            'uploaded_images': uploaded_images,
            'product': serializer.data
        }, status=status.HTTP_200_OK)
    
    def process_image(self, file):
        """Process and optimize the uploaded image"""
        try:
            # Open image with PIL
            image = Image.open(file)
            
            # Convert to RGB if necessary (for JPEG)
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large (max 2048px on longest side)
            max_size = 2048
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to BytesIO
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85, optimize=True)
            output.seek(0)
            
            return ContentFile(output.getvalue(), name=file.name)
            
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            # Return original file if processing fails
            return file


class ProductImageFileDeleteAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]

# Master API for all product filtering
class MasterProductFilterAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        """
        Master API that handles all product filtering based on:
        - gender (women, men, kids)
        - category (tops, bottoms, shoes, etc.)
        - subcategory (t-shirts, jeans, sneakers, etc.)
        - collection (live collections)
        - search query
        """
        print(f"Master API request: {request.GET}")
        
        # Get query parameters
        gender = request.GET.get('gender', '').lower()
        category = request.GET.get('category', '').lower()
        subcategory = request.GET.get('subcategory', '').lower()
        collection = request.GET.get('collection', '').lower()
        search = request.GET.get('search', '').strip()
        is_live = request.GET.get('is_live', 'true').lower() == 'true'
        
        # Start with all products
        products = Product.objects.all()
        
        # Filter by live status
        if is_live:
            products = products.filter(is_live=True)
        
        # Filter by gender
        if gender:
            products = products.filter(gender__iexact=gender)
        
        # Filter by category
        if category:
            products = products.filter(category__name__iexact=category)
        
        # Filter by subcategory
        if subcategory:
            products = products.filter(subcategory__name__iexact=subcategory)
        
        # Filter by collection
        if collection:
            # Get collection by name
            try:
                collection_obj = Collection.objects.get(name__iexact=collection, is_live=True)
                # Get products in this collection
                collection_products = CollectionProducts.objects.filter(collection=collection_obj)
                product_ids = [cp.product.id for cp in collection_products]
                products = products.filter(id__in=product_ids)
            except Collection.DoesNotExist:
                products = products.none()
        
        # Filter by search query
        if search:
            products = products.filter(
                models.Q(name__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(color__icontains=search)
            )
        
        # Serialize and return
        serializer = ProductSerializer(products, many=True)
        
        print(f"Filtered products count: {products.count()}")
        print(f"Filters applied: gender={gender}, category={category}, subcategory={subcategory}, collection={collection}, search={search}")
        
        return Response({
            'products': serializer.data,
            'filters': {
                'gender': gender,
                'category': category,
                'subcategory': subcategory,
                'collection': collection,
                'search': search,
                'is_live': is_live
            },
            'count': products.count(),
            'meta': {
                'total_products': products.count(),
                'filters_applied': {
                    'gender': bool(gender),
                    'category': bool(category),
                    'subcategory': bool(subcategory),
                    'collection': bool(collection),
                    'search': bool(search),
                    'is_live': is_live
                }
            }
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, product_id, image_id, *args, **kwargs):
        """Delete a specific image file from the server"""
        product = get_object_or_404(Product, pk=product_id)
        
        if not product.image_url or not isinstance(product.image_url, list):
            return Response({'error': 'No images found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find the image to delete
        image_to_delete = None
        for img in product.image_url:
            if img.get('id') == image_id:
                image_to_delete = img
                break
        
        if not image_to_delete:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete the file from storage
        try:
            if 'filename' in image_to_delete:
                file_path = f"products/{product_id}/{image_to_delete['filename']}"
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
        except Exception as e:
            print(f"Error deleting file: {str(e)}")
        
        # Remove from product's image_url
        product.image_url = [img for img in product.image_url if img.get('id') != image_id]
        
        # If we deleted the primary image, make the first remaining image primary
        primary_count = sum(1 for img in product.image_url if img.get('is_primary', False))
        if primary_count == 0 and len(product.image_url) > 0:
            product.image_url[0]['is_primary'] = True
        
        product.save()
        
        serializer = ProductSerializer(product)
        return Response({
            'message': 'Image deleted successfully',
            'product': serializer.data
        }, status=status.HTTP_200_OK)