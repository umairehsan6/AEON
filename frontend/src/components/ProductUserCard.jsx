import React, { useState } from 'react';

const ProductUserCard = ({ product }) => {
    const [selectedSize, setSelectedSize] = useState(product.sizes_available?.[0] || 'ONE');
    const imageSize = 400;
    const bgColor = (product.color || '').toUpperCase().includes('BLACK') ? '000' : 'EBEBEB';
    const textColor = (product.color || '').toUpperCase().includes('BLACK') ? 'FFF' : '000';
    const placeholderText = (product.name || 'PRODUCT').split(' ').slice(0, 2).join(' ');
    const imageUrl = `https://placehold.co/${imageSize}x${imageSize}/${bgColor}/${textColor}?text=${placeholderText}`;

    return (
        <div className="product-card group cursor-pointer">
            <div className="relative w-full aspect-square bg-gray-50 mb-3 overflow-hidden shadow-sm">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => e.target.src = `https://placehold.co/${imageSize}x${imageSize}/FFF/000?text=NO+IMAGE`}
                />
                <div className="absolute inset-x-0 bottom-0 py-1.5 text-center bg-white/80 backdrop-blur-sm text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details
                </div>
            </div>
            <div className="text-left py-1">
                <p className="text-sm uppercase font-normal tracking-wide">{product.name}</p>
                <p className="text-sm font-bold mt-0.5 mb-2">${Number(product.price).toFixed(2)}</p>

                {Array.isArray(product.sizes_available) && product.sizes_available.length > 0 && (
                    <div className="mb-3">
                        <select 
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full border border-black text-black text-xs py-2 px-2 uppercase appearance-none bg-white focus:ring-1 focus:ring-black focus:border-black transition duration-200"
                            style={{
                                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.7rem center',
                                backgroundSize: '0.8em',
                            }}
                        >
                            {product.sizes_available.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button 
                    className={`w-full border text-xs py-2 tracking-widest uppercase transition duration-200 rounded-none bg-white text-black border-black hover:bg-black hover:text-white`}
                >
                    QUICK ADD
                </button>
            </div>
        </div>
    );
};

export default ProductUserCard;


