import React from 'react';
import hero from '../assets/hero.jpg';

const Hero = () => {
  return (
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
        <a href = "/products" className="border border-white text-white py-3 px-8 text-sm uppercase transition-colors duration-200 hover:bg-white hover:text-black">
          Shop Now
        </a>
      </div>
    </div>
  );
};

export default Hero;
