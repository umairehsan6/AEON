import axios from './axios';

// Image management API calls
export const uploadProductImages = async (productId, images) => {
  try {
    const response = await axios.post(`/inventory/products/${productId}/images/`, {
      images: images
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw error;
  }
};

export const deleteProductImage = async (productId, imageId) => {
  try {
    const response = await axios.delete(`/inventory/products/${productId}/images/${imageId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};

export const reorderProductImages = async (productId, imageOrder) => {
  try {
    const response = await axios.put(`/inventory/products/${productId}/images/reorder/`, {
      image_order: imageOrder
    });
    return response.data;
  } catch (error) {
    console.error('Error reordering product images:', error);
    throw error;
  }
};

export const setPrimaryProductImage = async (productId, imageId) => {
  try {
    const response = await axios.put(`/inventory/products/${productId}/images/${imageId}/set-primary/`);
    return response.data;
  } catch (error) {
    console.error('Error setting primary product image:', error);
    throw error;
  }
};

// Helper function to create image object
export const createImageObject = (url, alt = '', isPrimary = false, order = 1) => {
  return {
    url: url,
    alt: alt,
    is_primary: isPrimary,
    order: order
  };
};

// Helper function to validate image URL
export const isValidImageUrl = (url) => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  } catch {
    return false;
  }
};

// File Upload Functions for Render
export const uploadProductImageFiles = async (productId, files) => {
  try {
    const formData = new FormData();
    
    // Add all files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    const response = await axios.post(`/inventory/products/${productId}/upload-images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading product image files:', error);
    throw error;
  }
};

export const deleteProductImageFile = async (productId, imageId) => {
  try {
    const response = await axios.delete(`/inventory/products/${productId}/delete-image-file/${imageId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product image file:', error);
    throw error;
  }
};

// Helper function to validate file before upload
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
  
  return true;
};

// Helper function to create file input element
export const createFileInput = (onChange, multiple = true) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = multiple;
  input.onchange = onChange;
  return input;
};
