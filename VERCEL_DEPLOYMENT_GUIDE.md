# Vercel Deployment Guide for E-commerce Frontend

## Overview
This guide will help you deploy your React frontend to Vercel with proper routing configuration for all your pages.

## Prerequisites
- GitHub repository with your frontend code
- Vercel account (free tier available)
- Backend API deployed (Render or other platform)

## Step 1: Prepare Your Frontend

### 1.1 File Structure
Ensure your frontend directory has this structure:
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── context/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
├── vercel.json          # Vercel configuration
├── vite.config.js
└── tailwind.config.js
```

### 1.2 Environment Variables
Create a `.env` file for local development:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=E-commerce Store
```

## Step 2: Configure Vercel

### 2.1 Update vercel.json
Copy the `vercel.json` file to your frontend directory and update the backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_ACTUAL_BACKEND_URL.onrender.com/api/:path*"
    }
  ]
}
```

### 2.2 Key Configuration Features

**Routes Configuration:**
- All React Router routes are configured to serve `index.html`
- Static assets are properly cached
- API routes are proxied to your backend

**Security Headers:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

**Caching Strategy:**
- Static assets: 1 year cache
- HTML files: No cache (for SPA routing)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### 3.2 Build Configuration
Vercel will auto-detect your Vite configuration:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Environment Variables
Add these environment variables in Vercel dashboard:

**Required:**
- `VITE_API_URL`: `https://your-backend.onrender.com/api`
- `VITE_APP_NAME`: `Your E-commerce Store`

**Optional:**
- `VITE_APP_VERSION`: `1.0.0`
- `VITE_APP_DESCRIPTION`: `Your store description`

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Domain
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 4.2 SSL Certificate
Vercel automatically provides SSL certificates for all domains.

## Step 5: Test Your Deployment

### 5.1 Test All Routes
Verify these routes work correctly:

**Public Routes:**
- `/` - Home page
- `/products` - Product listing
- `/product/1` - Product detail page
- `/login` - Login page
- `/signup` - Signup page

**Protected Routes:**
- `/cart` - Shopping cart
- `/profile` - User profile
- `/orders` - User orders
- `/checkout` - Checkout page

**Admin Routes:**
- `/admin` - Admin dashboard
- `/admin/dashboard` - Admin dashboard
- `/admin/orders` - Admin orders
- `/admin/product-management` - Product management
- `/admin/collection` - Collection management

### 5.2 Test API Integration
1. Try logging in/out
2. Add items to cart
3. Upload product images (if admin)
4. Test all CRUD operations

## Step 6: Production Optimizations

### 6.1 Performance
- Images are automatically optimized by Vercel
- Static assets are served from CDN
- Automatic code splitting
- Edge caching for better performance

### 6.2 Analytics
Enable Vercel Analytics:
1. Go to project settings
2. Enable "Vercel Analytics"
3. Monitor performance metrics

### 6.3 Monitoring
- View deployment logs
- Monitor build performance
- Check error rates
- Monitor Core Web Vitals

## Troubleshooting

### Common Issues

**1. Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors
- Ensure environment variables are set

**2. Routing Issues**
- Verify vercel.json routes configuration
- Check React Router setup
- Ensure all routes are included in vercel.json

**3. API Connection Issues**
- Verify VITE_API_URL is correct
- Check CORS configuration on backend
- Ensure backend is deployed and accessible

**4. Environment Variables**
- Check variables are prefixed with VITE_
- Verify values are correct
- Redeploy after changing variables

### Debug Commands
```bash
# Local development
npm run dev

# Build locally
npm run build

# Preview production build
npm run preview

# Check build output
ls -la dist/
```

## Advanced Configuration

### 6.1 Custom Headers
Add custom headers in vercel.json:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Custom-Header",
          "value": "Custom-Value"
        }
      ]
    }
  ]
}
```

### 6.2 Redirects
Add redirects in vercel.json:
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### 6.3 Rewrites
Proxy API requests:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/:path*"
    }
  ]
}
```

## Cost Considerations

### Free Tier Limits
- **Bandwidth**: 100GB/month
- **Build Time**: 6000 minutes/month
- **Function Executions**: 100GB-hours/month
- **Custom Domains**: Unlimited

### Scaling Options
- Pro plan for more resources
- Enterprise for advanced features
- Edge functions for better performance

## Maintenance

### Regular Tasks
1. **Monitor deployments** - Check for failed builds
2. **Update dependencies** - Keep packages current
3. **Monitor performance** - Use Vercel Analytics
4. **Check error logs** - Monitor for issues

### Updates
1. Push changes to GitHub
2. Vercel automatically deploys
3. Preview deployments for testing
4. Promote to production when ready

## Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Guide](https://reactrouter.com/en/main)

Your e-commerce frontend is now ready for production deployment on Vercel!
