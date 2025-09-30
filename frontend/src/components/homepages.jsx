import React from 'react';
import hero from '../assets/hero.jpg';

const Home = () => {
  const categories = [
    { name: 'Outerwear', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Outerwear' },
    { name: 'Dresses', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Dresses' },
    { name: 'Tops', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Tops' },
    { name: 'Bottoms', imageUrl: 'https://placehold.co/600x800/EEE/333?text=Bottoms' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center justify-center">
        <img
          src={hero}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative text-white text-center z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-widest uppercase mb-4">
            AEON Collection
          </h1>
          <p className="text-sm md:text-base font-light tracking-wider uppercase mb-6">
            A new perspective on everyday style.
          </p>
          <button className="border border-white text-white py-3 px-8 text-sm uppercase transition-colors duration-200 hover:bg-white hover:text-black">
            Shop Now
          </button>
        </div>
      </div>

      {/* Categories Section */}
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
    </div>
  );
};

export default Home;
