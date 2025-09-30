import React from 'react';

const Categories = () => {
  const categories = [
    { name: 'Outerwear', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Outerwear' },
    { name: 'Dresses', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Dresses' },
    { name: 'Tops', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Tops' },
    { name: 'Bottoms', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Bottoms' },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-extralight tracking-widest text-center uppercase mb-12">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div key={category.name} className="relative group overflow-hidden cursor-pointer">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-50">
              <p className="text-white text-xl font-light tracking-wider uppercase">
                {category.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
