import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { 
  deleteProductImageFile, 
  setPrimaryProductImage, 
  reorderProductImages 
} from '../services/images';

const ProductImageManager = ({ product, onUpdate }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUploadSuccess = (result) => {
    setMessage(`Successfully uploaded ${result.uploaded_images.length} images`);
    setError('');
    onUpdate?.(result.product);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setMessage('');
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await deleteProductImageFile(product.id, imageId);
      setMessage('Image deleted successfully');
      setError('');
      onUpdate?.(result.product);
    } catch (error) {
      setError('Failed to delete image');
      setMessage('');
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      const result = await setPrimaryProductImage(product.id, imageId);
      setMessage('Primary image updated');
      setError('');
      onUpdate?.(result);
    } catch (error) {
      setError('Failed to set primary image');
      setMessage('');
    }
  };

  const handleReorder = async (newOrder) => {
    try {
      const result = await reorderProductImages(product.id, newOrder);
      setMessage('Images reordered successfully');
      setError('');
      onUpdate?.(result);
    } catch (error) {
      setError('Failed to reorder images');
      setMessage('');
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const images = [...product.images];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    
    const newOrder = images.map(img => img.id);
    handleReorder(newOrder);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Manage Product Images
        </h2>
        
        {/* Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Images</h3>
        <ImageUpload
          productId={product.id}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Current Images */}
      {product.images && product.images.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Images ({product.images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/EBEBEB/000?text=NO+IMAGE';
                    }}
                  />
                </div>
                
                {/* Image Info */}
                <div className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {image.is_primary ? 'Primary' : `Image ${index + 1}`}
                    </span>
                    {image.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Primary
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {image.alt}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Set Primary
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Reorder Controls */}
                  <div className="mt-2 flex gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    
                    {index < product.images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Images Message */}
      {(!product.images || product.images.length === 0) && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500">No images uploaded yet. Use the upload section above to add images.</p>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
