from .models import Category, SubCategory, Product
from rest_framework import serializers
from .models import Collection , CollectionProducts
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
    primary_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'gender', 'color', 'price', 'image_url', 
            'total_stock_by_sizes', 'description', 'is_live', 'sizes',
            'category', 'subcategory', 'category_name', 'subcategory_name',
            'created_at', 'primary_image', 'images'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_primary_image(self, obj):
        """Get the primary image URL for backward compatibility"""
        if obj.image_url and isinstance(obj.image_url, list) and len(obj.image_url) > 0:
            # Find primary image or return first image
            primary_img = next((img for img in obj.image_url if img.get('is_primary', False)), None)
            if primary_img:
                return primary_img.get('url')
            return obj.image_url[0].get('url') if obj.image_url[0] else None
        return None
    
    def get_images(self, obj):
        """Get all images with proper structure"""
        if obj.image_url and isinstance(obj.image_url, list):
            # Sort by order field, then by array index
            sorted_images = sorted(obj.image_url, key=lambda x: (x.get('order', 999), obj.image_url.index(x)))
            return sorted_images
        return []
    
    def validate_image_url(self, value):
        """Validate image_url structure"""
        if value is None:
            return []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("image_url must be a list of image objects")
        
        for i, img in enumerate(value):
            if not isinstance(img, dict):
                raise serializers.ValidationError(f"Image at index {i} must be an object")
            
            required_fields = ['url']
            for field in required_fields:
                if field not in img:
                    raise serializers.ValidationError(f"Image at index {i} must have '{field}' field")
            
            # Set default values
            if 'id' not in img:
                img['id'] = f"img_{i+1}"
            if 'alt' not in img:
                img['alt'] = f"Product image {i+1}"
            if 'is_primary' not in img:
                img['is_primary'] = i == 0  # First image is primary by default
            if 'order' not in img:
                img['order'] = i + 1
        
        # Ensure only one primary image
        primary_count = sum(1 for img in value if img.get('is_primary', False))
        if primary_count > 1:
            raise serializers.ValidationError("Only one image can be marked as primary")
        elif primary_count == 0 and len(value) > 0:
            # If no primary image is set, make the first one primary
            value[0]['is_primary'] = True
        
        return value
    
    def validate(self, attrs):
        # Validate that subcategory belongs to the selected category
        category = attrs.get('category')
        subcategory = attrs.get('subcategory')
        
        if subcategory and category and subcategory.category != category:
            raise serializers.ValidationError("SubCategory must belong to the selected Category")
        
        return attrs
    

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'name', 'is_live', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    def validate(self, attrs):
        name = attrs.get('name')
        if name:
            # Check if a collection with this name already exists (excluding current instance for updates)
            existing_collections = Collection.objects.filter(name=name)
            if self.instance:
                # For updates, exclude the current instance
                existing_collections = existing_collections.exclude(pk=self.instance.pk)
            
            if existing_collections.exists():
                raise serializers.ValidationError("Collection with this name already exists")
        return attrs


class CollectionProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionProducts
        fields = ['id', 'collection', 'product', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']