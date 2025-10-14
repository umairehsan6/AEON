# Firebase Storage Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `aeon-ecommerce`
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Storage

1. In your Firebase project, go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select a location for your storage bucket
5. Click "Done"

## 3. Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Enter app nickname: `aeon-frontend`
5. Click "Register app"
6. Copy the configuration object

## 4. Environment Variables

Add these to your `.env` file in the frontend directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 5. Storage Rules (Security)

Update your Firebase Storage rules in the Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all images
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

## 6. Vercel Environment Variables

Add the same Firebase environment variables to your Vercel project:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each Firebase variable for Production, Preview, and Development

## 7. Test the Setup

1. Start your development server
2. Try uploading an image in the admin panel
3. Check Firebase Storage console to see uploaded files

## File Structure in Firebase Storage

```
products/
├── 1/
│   ├── product_1_1234567890_abc123.jpg
│   └── product_1_1234567891_def456.jpg
├── 2/
│   └── product_2_1234567892_ghi789.jpg
└── ...
```

## Benefits of Firebase Storage

- ✅ **Scalable**: Handles large files and high traffic
- ✅ **CDN**: Fast global delivery
- ✅ **Security**: Built-in authentication and rules
- ✅ **Real-time**: Progress tracking and real-time updates
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Integration**: Easy integration with other Firebase services
