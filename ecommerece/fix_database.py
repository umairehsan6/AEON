#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerece.settings')
django.setup()

from inventory.models import Product, Category, SubCategory, Collection

def fix_database():
    print("Fixing database...")
    
    # Fix gender values
    man_products = Product.objects.filter(gender='man')
    man_count = man_products.count()
    man_products.update(gender='men')
    print(f"Updated {man_count} products: 'man' -> 'men'")
    
    woman_products = Product.objects.filter(gender='woman')
    woman_count = woman_products.count()
    woman_products.update(gender='women')
    print(f"Updated {woman_count} products: 'woman' -> 'women'")
    
    kid_products = Product.objects.filter(gender='kid')
    kid_count = kid_products.count()
    kid_products.update(gender='kids')
    print(f"Updated {kid_count} products: 'kid' -> 'kids'")
    
    print("Database fix complete!")

if __name__ == "__main__":
    fix_database()
