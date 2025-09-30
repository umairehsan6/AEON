import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      <Hero />
      <Categories />
    </div>
  );
};

export default HomePage;
