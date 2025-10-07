import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  CreditCard,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  Package,
  ChevronRight,
  Pencil,
} from 'lucide-react';

// --- Icon Data for Navigation ---
const profileLinks = [
  { name: 'My Details', icon: User, description: 'Update profile information' },
  { name: 'My Addresses', icon: MapPin, description: 'Manage shipping and billing locations' },
  { name: 'Payment Methods', icon: CreditCard, description: 'Saved cards and payment options' },
  { name: 'Wishlist / Favorites', icon: Heart, description: 'View saved items' },
  { name: 'Notifications', icon: Bell, description: 'Adjust email and app alerts' },
  { name: 'Help & Contact', icon: HelpCircle, description: 'Customer service and FAQs' },
];

// --- Sub-Components ---

/**
 * A reusable component for rendering navigation links in the settings menu.
 */
const LinkItem = ({ name, icon: Icon, description }) => (
  <button
    onClick={() => console.log(`Navigating to ${name}`)}
    className="flex justify-between items-center w-full py-4 px-2 hover:bg-neutral-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-sm"
  >
    <div className="flex items-center space-x-4 text-left">
      <Icon className="w-5 h-5 text-gray-500" />
      <div>
        <div className="font-medium text-gray-900 tracking-wide text-sm">{name.toUpperCase()}</div>
        <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{description}</div>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </button>
);

/**
 * Renders the main user information section.
 */
const ProfileHeader = ({ userName }) => (
  <div className="text-center mb-10 pt-4">
    {/* Avatar Placeholder */}
    <div className="relative mx-auto w-24 h-24 rounded-full bg-neutral-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden mb-3">
      {/* Placeholder Icon or Image goes here */}
      <User className="w-10 h-10 text-gray-500" />
      {/* Subtle Edit Icon */}
      <button
        onClick={() => console.log('Edit Avatar')}
        className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
      >
        <Pencil className="w-3 h-3 text-gray-600" />
      </button>
    </div>

    <h1 className="text-xl font-light text-gray-900 tracking-wider">
      HELLO, <span className="font-semibold">{userName.toUpperCase()}</span>
    </h1>

    <button
      onClick={() => console.log('Editing Profile Details')}
      className="mt-2 text-xs text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-transparent hover:border-gray-400 px-3 py-1 rounded-full"
    >
      [ EDIT PROFILE ]
    </button>
  </div>
);

/**
 * Renders the section dedicated to the most recent order and history.
 */
const OrdersSection = ({ recentOrder }) => (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <h2 className="text-lg font-light tracking-widest text-gray-900 mb-4 pl-2">MY ORDERS</h2>

    {/* Recent Order Status Card */}
    <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center">
          <Package className="w-4 h-4 mr-2 text-black" />
          RECENT ORDER STATUS
        </h3>
        <span className="text-xs text-gray-400">#ZARA-12345677</span>
      </div>

      <div className="py-3 px-4 bg-gray-50 border border-gray-100 rounded-md">
        <div className="text-lg font-bold text-black tracking-wider">{recentOrder.status.toUpperCase()}</div>
        <div className="text-xs text-gray-500 mt-1">
          Expected Delivery: <span className="font-medium text-gray-700">{recentOrder.deliveryDate}</span>
        </div>
      </div>

      <button
        onClick={() => console.log('View Recent Order')}
        className="mt-4 text-xs font-medium text-black underline hover:text-gray-600 transition-colors duration-200"
      >
        VIEW DETAILS & TRACK
      </button>
    </div>

    {/* Order History Link */}
    <button
      onClick={() => console.log('Navigating to full order history')}
      className="w-full text-center py-3 bg-neutral-100 text-gray-800 text-sm font-medium tracking-wider rounded-md hover:bg-neutral-200 transition-colors duration-200 border border-gray-200"
    >
      VIEW ALL ORDER HISTORY
    </button>
  </div>
);

/**
 * Main application component.
 */
const App = () => {
  const [userName] = useState('Sarah J.');
  const [recentOrder] = useState({
    id: '12345677',
    status: 'Processing Shipment',
    deliveryDate: 'Thursday, Oct 5th',
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* --- Header Section --- */}
        <ProfileHeader userName={userName} />

        {/* --- Settings Menu Section --- */}
        <div className="bg-white border-t border-b border-gray-200 divide-y divide-gray-100">
          {profileLinks.map((link, index) => (
            <LinkItem
              key={index}
              name={link.name}
              icon={link.icon}
              description={link.description}
            />
          ))}
        </div>

        {/* --- Orders Section --- */}
        <OrdersSection recentOrder={recentOrder} />

        {/* --- Footer Links (Log Out & Policy) --- */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          {/* Log Out Button */}
          <button
            onClick={() => console.log('Logging out user')}
            className="flex items-center justify-center mx-auto text-sm font-medium text-gray-900 hover:text-black hover:bg-neutral-100 transition-colors duration-200 py-2 px-4 rounded-full tracking-wider"
          >
            <LogOut className="w-4 h-4 mr-2" />
            LOG OUT
          </button>

          {/* Policy Links */}
          <div className="mt-6 space-x-4 text-xs text-gray-400 font-light">
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Terms & Conditions</a>
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Store Finder</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
