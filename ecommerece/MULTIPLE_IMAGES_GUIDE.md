# Multiple Images System Guide

## Overview
This system allows you to store and manage multiple images for each product using a JSON field in the database. The system is backward compatible with existing single image setups.

## Database Structure

### Product Model
The `image_url` field in the Product model stores an array of image objects:

```json
[
  {
    "id": "img_1",
    "url": "https://example.com/images/product1_main.jpg",
    "alt": "Product main view",
    "is_primary": true,
    "order": 1
  },
  {
    "id": "img_2", 
    "url": "https://example.com/images/product1_side.jpg",
    "alt": "Product side view",
    "is_primary": false,
    "order": 2
  },
  {
    "id": "img_3",
    "url": "https://example.com/images/product1_detail.jpg", 
    "alt": "Product detail view",
    "is_primary": false,
    "order": 3
  }
]
```

### Image Object Properties
- `id`: Unique identifier for the image (auto-generated if not provided)
- `url`: The image URL (required)
- `alt`: Alt text for accessibility (auto-generated if not provided)
- `is_primary`: Boolean indicating if this is the primary image (only one can be primary)
- `order`: Display order (1-based, auto-assigned if not provided)

## API Endpoints

### 1. Get Product with Images
```
GET /inventory/products/{id}/
```
Returns product data with:
- `images`: Array of all images sorted by order
- `primary_image`: URL of the primary image (for backward compatibility)

### 2. Upload New Images
```
POST /inventory/products/{product_id}/images/
```
Request body:
```json
{
  "images": [
    {
      "url": "https://example.com/new_image.jpg",
      "alt": "New product view",
      "is_primary": false,
      "order": 4
    }
  ]
}
```

### 3. Delete Specific Image
```
DELETE /inventory/products/{product_id}/images/{image_id}/
```

### 4. Reorder Images
```
PUT /inventory/products/{product_id}/images/reorder/
```
Request body:
```json
{
  "image_order": ["img_2", "img_1", "img_3"]
}
```

### 5. Set Primary Image
```
PUT /inventory/products/{product_id}/images/{image_id}/set-primary/
```

## Frontend Usage

### ProductUserCard Component
The component automatically displays the primary image or first image from the `images` array:

```jsx
// The component handles multiple images automatically
<ProductUserCard product={product} />
```

### ProductPage Component
The product page now includes:
- Main image display with navigation arrows
- Thumbnail grid for image selection
- Automatic fallback to placeholder images

### Using Image Services
```javascript
import { 
  uploadProductImages, 
  deleteProductImage, 
  reorderProductImages, 
  setPrimaryProductImage 
} from '../services/images';

// Upload new images
const newImages = [
  {
    url: 'https://example.com/image1.jpg',
    alt: 'Front view',
    is_primary: false,
    order: 1
  }
];
await uploadProductImages(productId, newImages);

// Delete an image
await deleteProductImage(productId, 'img_2');

// Reorder images
await reorderProductImages(productId, ['img_2', 'img_1', 'img_3']);

// Set primary image
await setPrimaryProductImage(productId, 'img_2');
```

## Migration from Single Images

### Existing Products
Products with single image URLs will continue to work. The system provides:
- `primary_image` field for backward compatibility
- Automatic fallback to `image_url` if it's a string
- Placeholder image generation for products without images

### Updating Existing Products
To convert a single image product to multiple images:

```javascript
// Example: Convert single image to multiple images format
const product = {
  id: 1,
  image_url: "https://example.com/single_image.jpg"
};

// Update to multiple images format
const updatedProduct = {
  ...product,
  image_url: [
    {
      id: "img_1",
      url: product.image_url,
      alt: product.name,
      is_primary: true,
      order: 1
    }
  ]
};
```

## Best Practices

### Image URLs
- Use HTTPS URLs for better security
- Ensure images are optimized for web (WebP, JPEG, PNG)
- Provide meaningful alt text for accessibility
- Use consistent image dimensions for better UX

### Image Management
- Always have at least one primary image
- Use logical ordering (main view first, then details)
- Provide multiple angles/views for better product presentation
- Consider mobile vs desktop image sizes

### Performance
- Images are loaded on-demand
- Thumbnail grid only shows when multiple images exist
- Navigation arrows only appear when needed
- Fallback to placeholder images for missing/broken URLs

## Example Implementation

### Creating a Product with Multiple Images
```javascript
const productData = {
  name: "Premium T-Shirt",
  price: 29.99,
  color: "Black",
  image_url: [
    {
      url: "https://example.com/tshirt_front.jpg",
      alt: "T-shirt front view",
      is_primary: true,
      order: 1
    },
    {
      url: "https://example.com/tshirt_back.jpg", 
      alt: "T-shirt back view",
      is_primary: false,
      order: 2
    },
    {
      url: "https://example.com/tshirt_detail.jpg",
      alt: "T-shirt fabric detail",
      is_primary: false, 
      order: 3
    }
  ],
  // ... other product fields
};
```

### Admin Interface Integration
For admin interfaces, you can use the image management APIs to:
- Upload multiple images at once
- Drag and drop to reorder images
- Set primary image with a single click
- Delete unwanted images
- Preview all images before saving

This system provides a robust foundation for managing multiple product images while maintaining backward compatibility with existing implementations.
