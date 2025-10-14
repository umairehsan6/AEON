from django.core.management.base import BaseCommand
from inventory.models import Category, SubCategory, Collection, Product

class Command(BaseCommand):
    help = 'Normalize all category, subcategory, and collection names to lowercase'

    def handle(self, *args, **options):
        self.stdout.write('Starting case normalization...')
        
        # Update Categories
        categories_updated = 0
        for category in Category.objects.all():
            if category.name != category.name.lower():
                old_name = category.name
                category.name = category.name.lower()
                category.save()
                categories_updated += 1
                self.stdout.write(f'Updated category: "{old_name}" -> "{category.name}"')
        
        # Update SubCategories
        subcategories_updated = 0
        for subcategory in SubCategory.objects.all():
            if subcategory.name != subcategory.name.lower():
                old_name = subcategory.name
                subcategory.name = subcategory.name.lower()
                subcategory.save()
                subcategories_updated += 1
                self.stdout.write(f'Updated subcategory: "{old_name}" -> "{subcategory.name}"')
        
        # Update Collections
        collections_updated = 0
        for collection in Collection.objects.all():
            if collection.name != collection.name.lower():
                old_name = collection.name
                collection.name = collection.name.lower()
                collection.save()
                collections_updated += 1
                self.stdout.write(f'Updated collection: "{old_name}" -> "{collection.name}"')
        
        # Update Product gender field
        products_updated = 0
        for product in Product.objects.all():
            if product.gender and product.gender != product.gender.lower():
                old_gender = product.gender
                product.gender = product.gender.lower()
                product.save()
                products_updated += 1
                self.stdout.write(f'Updated product gender: "{old_gender}" -> "{product.gender}"')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Case normalization complete!\n'
                f'Categories updated: {categories_updated}\n'
                f'Subcategories updated: {subcategories_updated}\n'
                f'Collections updated: {collections_updated}\n'
                f'Product genders updated: {products_updated}'
            )
        )
