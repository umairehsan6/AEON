from django.urls import path
from .views import (
    CategoryListCreateAPIView, CategoryDetailAPIView, CollectionListCreateAPIView, CollectionDetailAPIView,
    SubCategoryListCreateAPIView, SubCategoryDetailAPIView,
    ProductListCreateAPIView, ProductDetailAPIView,
    SubCategoryByCategoryAPIView, ProductByCategoryAPIView, ProductBySubCategoryAPIView,
    CollectionProductsListCreateAPIView, CollectionProductsDeleteAPIView
)

urlpatterns = [
    # Category endpoints
    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),
    
    # SubCategory endpoints
    path('subcategories/', SubCategoryListCreateAPIView.as_view(), name='subcategory-list-create'),
    path('subcategories/<int:pk>/', SubCategoryDetailAPIView.as_view(), name='subcategory-detail'),
    path('categories/<int:category_id>/subcategories/', SubCategoryByCategoryAPIView.as_view(), name='subcategory-by-category'),
    
    # Product endpoints
    path('products/', ProductListCreateAPIView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('categories/<int:category_id>/products/', ProductByCategoryAPIView.as_view(), name='product-by-category'),
    path('subcategories/<int:subcategory_id>/products/', ProductBySubCategoryAPIView.as_view(), name='product-by-subcategory'),

    # Collection endpoints
    path('collections/', CollectionListCreateAPIView.as_view(), name='collection-list-create'),
    path('collections/<int:pk>/', CollectionDetailAPIView.as_view(), name='collection-detail'),
    path('collections/<int:collection_id>/products/', CollectionProductsListCreateAPIView.as_view(), name='collection-products-list-create'),
    path('collections/<int:collection_id>/products/<int:product_id>/', CollectionProductsDeleteAPIView.as_view(), name='collection-products-delete'),
]
