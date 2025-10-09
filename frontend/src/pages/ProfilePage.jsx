import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getUserInfo, getUserRole } from '../services/authutils';
import { logout } from '../services/auth';
import { getMyOrders } from '../services/orders';

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
const LinkItem = ({ name, icon: Icon, description, onClick }) => (
  <button
    onClick={onClick}
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
const ProfileHeader = ({ userInfo, onEditProfile }) => (
  <div className="text-center mb-10 pt-4">
    {/* Avatar Placeholder */}
    <div className="relative mx-auto w-24 h-24 rounded-full bg-neutral-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden mb-3">
      {/* Placeholder Icon or Image goes here */}
      <User className="w-10 h-10 text-gray-500" />
      {/* Subtle Edit Icon */}
      <button
        onClick={onEditProfile}
        className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
      >
        <Pencil className="w-3 h-3 text-gray-600" />
      </button>
    </div>

    <h1 className="text-xl font-light text-gray-900 tracking-wider">
      HELLO, <span className="font-semibold">
        {userInfo?.first_name ? userInfo.first_name.toUpperCase() : 'USER'}
      </span>
    </h1>

    <div className="text-sm text-gray-600 mt-1">
      {userInfo?.email && (
        <div className="text-xs text-gray-500">{userInfo.email}</div>
      )}
    </div>

    <button
      onClick={onEditProfile}
      className="mt-2 text-xs text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-transparent hover:border-gray-400 px-3 py-1 rounded-full"
    >
      [ EDIT PROFILE ]
    </button>
  </div>
);

/**
 * Renders the section dedicated to the most recent order and history.
 */
const OrdersSection = ({ recentOrder, onViewOrders }) => (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <h2 className="text-lg font-light tracking-widest text-gray-900 mb-4 pl-2">MY ORDERS</h2>

    {recentOrder ? (
      <>
        {/* Recent Order Status Card */}
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center">
              <Package className="w-4 h-4 mr-2 text-black" />
              RECENT ORDER STATUS
            </h3>
            <span className="text-xs text-gray-400">#{recentOrder.id}</span>
          </div>

          {/* Order Items Preview */}
          {recentOrder.items && recentOrder.items.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-600 mb-2">Items:</h4>
              <div className="space-y-1">
                {recentOrder.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600">
                    <span>{item.product_detail?.name} ({item.size})</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                ))}
                {recentOrder.items.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{recentOrder.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="py-3 px-4 bg-gray-50 border border-gray-100 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-black tracking-wider">{recentOrder.status.toUpperCase()}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                recentOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                recentOrder.status === 'packaging' ? 'bg-blue-100 text-blue-800' :
                recentOrder.status === 'on_the_way' ? 'bg-purple-100 text-purple-800' :
                recentOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                recentOrder.status === 'returned' ? 'bg-red-100 text-red-800' :
                recentOrder.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {recentOrder.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Order Date: <span className="font-medium text-gray-700">
                {new Date(recentOrder.created_at).toLocaleDateString()}
              </span>
            </div>
            {recentOrder.expected_delivery && (
              <div className="text-xs text-gray-500 mt-1">
                Expected Delivery: <span className="font-medium text-gray-700">
                  {new Date(recentOrder.expected_delivery).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => onViewOrders()}
            className="mt-4 text-xs font-medium text-black underline hover:text-gray-600 transition-colors duration-200"
          >
            VIEW DETAILS & TRACK
          </button>
        </div>
      </>
    ) : (
      <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm mb-6 text-center">
        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No orders yet</p>
        <p className="text-gray-400 text-xs mt-1">Start shopping to see your orders here</p>
      </div>
    )}

    {/* Order History Link */}
    <button
      onClick={onViewOrders}
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
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [recentOrder, setRecentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user info from token
        const user = getUserInfo();
        if (!user) {
          navigate('/login');
          return;
        }
        setUserInfo(user);

        // Fetch user's orders
        try {
          const ordersResponse = await getMyOrders();
          if (ordersResponse.data && ordersResponse.data.length > 0) {
            // Get the most recent order
            const mostRecentOrder = ordersResponse.data[0];
            setRecentOrder(mostRecentOrder);
          }
        } catch (orderError) {
          console.error('Error fetching orders:', orderError);
          // Don't set error for orders, just show no orders
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to home even if logout fails
      navigate('/');
    }
  };

  const handleEditProfile = () => {
    // For now, just show an alert. In the future, this could open a modal or navigate to an edit page
    alert('Profile editing feature coming soon!');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleLinkClick = (linkName) => {
    switch (linkName) {
      case 'My Details':
        handleEditProfile();
        break;
      case 'My Addresses':
        alert('Address management coming soon!');
        break;
      case 'Payment Methods':
        alert('Payment methods coming soon!');
        break;
      case 'Wishlist / Favorites':
        alert('Wishlist coming soon!');
        break;
      case 'Notifications':
        alert('Notification settings coming soon!');
        break;
      case 'Help & Contact':
        alert('Help & Contact coming soon!');
        break;
      default:
        console.log(`Navigating to ${linkName}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* --- Header Section --- */}
        <ProfileHeader userInfo={userInfo} onEditProfile={handleEditProfile} />

        {/* --- Settings Menu Section --- */}
        <div className="bg-white border-t border-b border-gray-200 divide-y divide-gray-100">
          {profileLinks.map((link, index) => (
            <LinkItem
              key={index}
              name={link.name}
              icon={link.icon}
              description={link.description}
              onClick={() => handleLinkClick(link.name)}
            />
          ))}
        </div>

        {/* --- Orders Section --- */}
        <OrdersSection recentOrder={recentOrder} onViewOrders={handleViewOrders} />

        {/* --- Footer Links (Log Out & Policy) --- */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          {/* Log Out Button */}
          <button
            onClick={handleLogout}
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
