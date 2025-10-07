from os import name
from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Product(models.Model):
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=255)
    color = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.JSONField()
    total_stock_by_sizes = models.JSONField()
    description = models.TextField()
    is_live = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sizes = models.JSONField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE)

class Collection(models.Model):
    name = models.CharField(max_length=255)
    is_live = models.BooleanField(default = False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CollectionProducts(models.Model):
    collection = models.ForeignKey(Collection, related_name="collection_name", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='collection_products', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)