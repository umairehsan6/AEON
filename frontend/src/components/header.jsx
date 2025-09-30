import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; 
function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="bg-white text-black p-4 md:py-6 md:px-12 flex justify-between items-center shadow-md z-50 relative">
        {/* Hamburger Icon for Mobile with animation */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 focus:outline-none transition-transform duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Top bar */}
            <path
              className={`transform transition duration-300 ease-in-out ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16"
            ></path>
            {/* Middle bar */}
            <path
              className={`transform transition duration-300 ease-in-out ${isSidebarOpen ? 'opacity-0' : ''}`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 12h16"
            ></path>
            {/* Bottom bar */}
            <path
              className={`transform transition duration-300 ease-in-out ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 18h16"
            ></path>
          </svg>
        </button>

        {/* Logo/Brand Name */}
        <div className="text-center md:text-left flex-grow md:flex-grow-0">
          <h1 className="text-xl md:text-2xl font-light tracking-[0.4em] uppercase">
            AEON
          </h1>
        </div>

        {/* Desktop Navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className="font-light text-sm tracking-wide hover:underline hover:text-gray-900 transition-all duration-200">
            HOME
          </NavLink>
          {/* <NavLink to="/signup" className="font-light text-sm tracking-wide hover:underline hover:text-gray-900 transition-all duration-200">
            Sign Up
          </NavLink> */}
          <NavLink to="/contact" className="font-light text-sm tracking-wide hover:underline hover:text-gray-900 transition-all duration-200">
            CONTACT
          </NavLink>
          <NavLink to="#" className="font-light text-sm tracking-wide hover:underline hover:text-gray-900 transition-all duration-200">
            CART
          </NavLink>
          <NavLink to="/login" className="font-light text-sm tracking-wide hover:underline hover:text-gray-900 transition-all duration-200">
            LOGIN
          </NavLink>
        </nav>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex flex-col space-y-4 pt-16">
          <a href="#" className="font-light text-lg tracking-wide hover:underline transition-all duration-200">
            HOME
          </a>
          <a href="#" className="font-light text-lg tracking-wide hover:underline transition-all duration-200">
            SHOP
          </a>
          <a href="#" className="font-light text-lg tracking-wide hover:underline transition-all duration-200">
            ABOUT
          </a>
          <a href="#" className="font-light text-lg tracking-wide hover:underline transition-all duration-200">
            CONTACT
          </a>
          <a href="#" className="font-light text-lg tracking-wide hover:underline transition-all duration-200">
            LOG IN
          </a>
        </div>
      </div>

      {/* Backdrop to close sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default Header;
