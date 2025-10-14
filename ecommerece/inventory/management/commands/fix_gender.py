from django.core.management.base import BaseCommand
from inventory.models import Product

class Command(BaseCommand):
    help = 'Fix gender values in database'

    def handle(self, *args, **options):
        self.stdout.write('Fixing gender values...')
        
        # Update 'man' to 'men'
        man_products = Product.objects.filter(gender='man')
        man_count = man_products.count()
        man_products.update(gender='men')
        
        # Update 'woman' to 'women' if it exists
        woman_products = Product.objects.filter(gender='woman')
        woman_count = woman_products.count()
        woman_products.update(gender='women')
        
        # Update 'kid' to 'kids' if it exists
        kid_products = Product.objects.filter(gender='kid')
        kid_count = kid_products.count()
        kid_products.update(gender='kids')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Gender values fixed!\n'
                f'"man" -> "men": {man_count} products\n'
                f'"woman" -> "women": {woman_count} products\n'
                f'"kid" -> "kids": {kid_count} products'
            )
        )
