from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin superuser for deployment (Render)'

    def add_arguments(self, parser):
        pass  # No arguments needed - everything is hardcoded

    def handle(self, *args, **options):
        username = 'root'  # Hardcoded username
        email = 'root'  # Hardcoded email
        password = 'root'  # Hardcoded password
        
        first_name = 'Admin'
        last_name = 'User'
        
        try:
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f'User with username "{username}" already exists.')
                )
                # Update existing user to ensure they have admin privileges
                user = User.objects.get(username=username)
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.role = 'admin'
                user.is_verified = True
                user.is_active = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated existing user "{username}" with admin privileges!')
                )
            else:
                # Create new superuser
                user = User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    role='admin',
                    is_verified=True,
                    is_active=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created admin superuser "{username}"!')
                )
            
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Role: admin')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            self.stdout.write(f'Is Superuser: {user.is_superuser}')
            self.stdout.write(
                self.style.SUCCESS('Admin user is ready for deployment!')
            )
            
        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {e}')
            )
