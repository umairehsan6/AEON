# Render Deployment Guide for E-commerce with Image Upload

## Overview
This guide will help you deploy your e-commerce application to Render with full image upload functionality.

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- Basic understanding of Django and React

## Step 1: Prepare Your Repository

### 1.1 File Structure
Ensure your repository has this structure:
```
your-repo/
├── ecommerece/           # Django backend
│   ├── ecommerece/
│   ├── inventory/
│   ├── user/
│   ├── cart/
│   ├── orders/
│   └── manage.py
├── frontend/             # React frontend
├── requirements.txt      # Python dependencies
├── render.yaml          # Render configuration
└── README.md
```

### 1.2 Environment Variables
Create a `.env` file for local development (don't commit this):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=mysql://user:password@localhost:3306/dbname
```

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `ecommerce-backend`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `ecommerece`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r ../requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
  ```
- **Start Command**: 
  ```bash
  gunicorn ecommerece.wsgi:application
  ```

### 2.2 Environment Variables
Add these environment variables in Render dashboard:

**Required:**
- `SECRET_KEY`: Generate a secure secret key
- `DEBUG`: `False`
- `ALLOWED_HOSTS`: `your-app-name.onrender.com`
- `RENDER`: `True`

**Database (if using Render PostgreSQL):**
- `DATABASE_URL`: Will be auto-provided if you create a PostgreSQL database

**CORS (for frontend):**
- `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.com`

### 2.3 Create Database (Optional)
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name it `ecommerce-db`
3. Connect it to your web service
4. The `DATABASE_URL` will be automatically provided

## Step 3: Deploy Frontend to Render

### 3.1 Create Static Site
1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:

**Basic Settings:**
- **Name**: `ecommerce-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 3.2 Environment Variables
Add these environment variables:
- `VITE_API_URL`: `https://your-backend-name.onrender.com/api`

## Step 4: Configure Image Storage

### 4.1 Render Disk Storage
Your `render.yaml` includes disk storage for images:
```yaml
disk:
  name: media-storage
  mountPath: /opt/render/project/src/media
  sizeGB: 1
```

### 4.2 Image Upload Flow
1. **Upload**: Images are uploaded to `/media/products/{product_id}/`
2. **Processing**: Images are automatically resized and optimized
3. **Storage**: Files are stored on Render's disk storage
4. **URLs**: Generated URLs point to your Render domain

## Step 5: Test Your Deployment

### 5.1 Backend Testing
Test your API endpoints:
```bash
# Test image upload
curl -X POST https://your-backend.onrender.com/api/inventory/products/1/upload-images/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@test-image.jpg"

# Test product retrieval
curl https://your-backend.onrender.com/api/inventory/products/1/
```

### 5.2 Frontend Testing
1. Visit your frontend URL
2. Try uploading images in the admin interface
3. Verify images display correctly on product pages

## Step 6: Production Optimizations

### 6.1 Security
- Use strong `SECRET_KEY`
- Set `DEBUG=False`
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS (automatic on Render)

### 6.2 Performance
- Images are automatically optimized (max 2048px, 85% quality)
- Static files are served efficiently
- Database queries are optimized

### 6.3 Monitoring
- Monitor your Render dashboard for:
  - CPU and memory usage
  - Disk space usage
  - Request logs
  - Error logs

## Troubleshooting

### Common Issues

**1. Build Failures**
- Check your `requirements.txt` includes all dependencies
- Ensure Python version compatibility
- Verify build commands are correct

**2. Database Connection Issues**
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Ensure migrations are applied

**3. Image Upload Issues**
- Check disk storage is mounted correctly
- Verify file permissions
- Check image processing dependencies (Pillow)

**4. CORS Issues**
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Check frontend API URL configuration

### Debug Commands
```bash
# Check logs
render logs --service your-service-name

# SSH into service (if available)
render ssh --service your-service-name

# Check environment variables
render env --service your-service-name
```

## Cost Considerations

### Free Tier Limits
- **Web Service**: 750 hours/month
- **Database**: 1GB storage
- **Disk Storage**: 1GB
- **Bandwidth**: 100GB/month

### Scaling Options
- Upgrade to paid plans for more resources
- Use external image storage (AWS S3, Cloudinary) for large volumes
- Implement CDN for better performance

## Maintenance

### Regular Tasks
1. **Monitor disk usage** - Clean up old images if needed
2. **Update dependencies** - Keep packages current
3. **Backup database** - Regular backups recommended
4. **Monitor performance** - Watch for slow queries

### Image Management
- Images are stored in `/media/products/{product_id}/`
- Automatic cleanup when images are deleted via API
- Consider implementing image compression for large catalogs

## Support Resources
- [Render Documentation](https://render.com/docs)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [React Build Guide](https://create-react-app.dev/docs/production-build/)

Your e-commerce application is now ready for production with full image upload capabilities on Render!
