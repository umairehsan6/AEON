#!/bin/bash

# Render Deployment Script for Django E-commerce
# This script runs migrations and creates admin user on first deployment

echo "🚀 Starting Django deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create admin superuser (only if it doesn't exist)
echo "👤 Creating admin superuser..."
python manage.py create_admin_user --username root --email admin@example.com

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Deployment completed successfully!"
echo "🔑 Admin credentials:"
echo "   Username: root"
echo "   Password: Check your environment variable ADMIN_PASSWORD or use default"
echo "   Email: admin@example.com"
