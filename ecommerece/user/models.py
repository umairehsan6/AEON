from django.db import models
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):
    countrychoices = [
        ('USA', 'United States'),
        ('CAN', 'Canada'),
        ('UK', 'United Kingdom'),
        ('AUS', 'Australia'),
        ('IND', 'India'),
        ('GER', 'Germany'),
        ('FRA', 'France'),
        ('JPN', 'Japan'),
        ('CHN', 'China'),
        ('BRA', 'Brazil'),
        ('Pakistan', 'Pakistan'),
    ]
    name = models.CharField(max_length=100 , blank=True , null=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    phone = models.CharField(max_length=15 , blank=True , null=True)
    country = models.CharField(max_length=50 , blank=True , null=True)
    profile_image = models.JSONField(blank=True , null=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    role = models.CharField(max_length=50 , default='user', choices = [('user', 'User'), ('admin', 'Admin'), ('manager', 'Manager') , ('staff', 'Staff')])
    username = models.CharField(max_length=150, unique=True)
    date_of_birth = models.DateField(blank=True , null=True)
    last_login = models.DateTimeField(blank=True , null=True)
    last_device = models.CharField(max_length=200 , blank=True , null=True)
    last_ip = models.GenericIPAddressField(blank=True , null=True)



class UserShippingAddress(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    address_type = models.CharField(max_length=50, choices=[('home', 'Home'), ('work', 'Work'), ('other', 'Other')])
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
