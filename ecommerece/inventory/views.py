from django.shortcuts import render, get_object_or_404
from .models import Category, SubCategory, Product
from .serializer import CategorySerializer, SubCategorySerializer, ProductSerializer
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
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
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