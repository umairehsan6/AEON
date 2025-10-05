from .models import Category, SubCategory, Product
from rest_framework import serializers

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        if Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("Category with this name already exists")
        return value

class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'category', 'category_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        category = attrs.get('category')
        name = attrs.get('name')
        
        if SubCategory.objects.filter(category=category, name=name).exists():
            raise serializers.ValidationError("SubCategory with this name already exists in this category")
        return attrs

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'gender', 'color', 'price', 'image_url', 
            'total_stock_by_sizes', 'description', 'is_live', 'sizes',
            'category', 'subcategory', 'category_name', 'subcategory_name',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        # Validate that subcategory belongs to the selected category
        category = attrs.get('category')
        subcategory = attrs.get('subcategory')
        
        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError("SubCategory must belong to the selected Category")
        
        return attrs

