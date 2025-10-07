import React from 'react';

const ProductAdminCard = ({ product, onToggleLive, onEdit, onDelete, selectable, selected, onSelectChange }) => {
    const imageSize = 300;
    const bgColor = (product.color || '').toUpperCase().includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = (product.color || '').toUpperCase().includes('BLACK') ? 'FFF' : '000';
    const placeholderText = (product.name || 'PRODUCT').split(' ').slice(0, 2).join(' ');
    const imageUrl = `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;

    return (
        <div className="border p-3">
            <div className="relative w-full aspect-square bg-gray-50 mb-3 overflow-hidden">
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                {selectable && (
                    <div className="absolute top-2 left-2">
                        <input type="checkbox" checked={!!selected} onChange={(e) => onSelectChange?.(product.id, e.target.checked)} />
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-sm uppercase">{product.name}</p>
                    <p className="text-xs text-gray-600">${Number(product.price).toFixed(2)}</p>
                </div>
                <button
                    onClick={() => onToggleLive?.(product.id, product.is_live)}
                    className={`text-xs px-2 py-1 border ${product.is_live ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                >
                    {product.is_live ? 'LIVE' : 'DRAFT'}
                </button>
            </div>
            <div className="flex gap-2">
                <button className="text-xs px-2 py-1 border border-black" onClick={() => onEdit?.(product)}>
                    Edit
                </button>
                <button className="text-xs px-2 py-1 border border-black" onClick={() => onDelete?.(product.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ProductAdminCard;


