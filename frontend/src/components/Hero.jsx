import React, { useState } from 'react';
import hero from '../assets/hero.jpg';

const Hero = () => {
  const [showWarning, setShowWarning] = useState(true);

  const dismissWarning = () => {
    setShowWarning(false);
  };

  return (
    <div className="relative h-[90vh] flex items-center justify-center">
      <img
        src={hero}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Free Server Warning Banner */}
      {showWarning && (
        <div className="absolute top-4 right-4 z-20 bg-yellow-500/90 backdrop-blur-sm text-black p-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-2 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-sm">Free Server Notice</span>
              </div>
              <p className="text-xs text-yellow-900 leading-relaxed">
                This site uses free servers which may cause up to 1 minute delay when connecting to the backend. Please be patient while pages load.
              </p>
            </div>
            <button
              onClick={dismissWarning}
              className="ml-2 text-yellow-800 hover:text-yellow-900 transition-colors"
              aria-label="Dismiss warning"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="relative text-white text-center z-10 p-4">
        <h1 className="text-4xl md:text-6xl font-extralight tracking-widest uppercase mb-4">
          AEON Summer Vol 1
        </h1>
        <p className="text-sm md:text-base font-light tracking-wider uppercase mb-6">
          A new perspective on everyday style is live now.
        </p>
        <a href = "/products" className="border border-white text-white py-3 px-8 text-sm uppercase transition-colors duration-200 hover:bg-white hover:text-black">
          Shop Now
        </a>
      </div>
    </div>
  );
};

export default Hero;
