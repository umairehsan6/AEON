from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@test.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_active': True,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Admin user created: admin/admin123'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))

        # Create regular user
        regular_user, created = User.objects.get_or_create(
            username='user',
            defaults={
                'email': 'user@test.com',
                'first_name': 'Regular',
                'last_name': 'User',
                'role': 'user',
                'is_active': True
            }
        )
        if created:
            regular_user.set_password('user123')
            regular_user.save()
            self.stdout.write(self.style.SUCCESS('Regular user created: user/user123'))
        else:
            self.stdout.write(self.style.WARNING('Regular user already exists'))

