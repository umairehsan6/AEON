import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload a single image file to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} productId - The product ID
 * @param {function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadImageToFirebase = async (file, productId, onProgress = null) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `product_${productId}_${timestamp}_${randomString}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `products/${productId}/${fileName}`);
    
    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Get file metadata
            const metadata = await getMetadata(uploadTask.snapshot.ref);
            
            resolve({
              url: downloadURL,
              fileName: fileName,
              originalName: file.name,
              size: file.size,
              type: file.type,
              metadata: metadata
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {File[]} files - Array of image files
 * @param {string} productId - The product ID
 * @param {function} onProgress - Progress callback function
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleImagesToFirebase = async (files, productId, onProgress = null) => {
  try {
    const uploadPromises = files.map((file, index) => 
      uploadImageToFirebase(file, productId, (progress) => {
        if (onProgress) {
          // Calculate overall progress
          const overallProgress = ((index * 100) + progress) / files.length;
          onProgress(overallProgress);
        }
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param {string} imageUrl - The image URL to delete
 * @returns {Promise<void>}
 */
export const deleteImageFromFirebase = async (imageUrl) => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL');
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage, filePath);
    
    await deleteObject(imageRef);
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of 10MB`);
  }
  
  return true;
};
