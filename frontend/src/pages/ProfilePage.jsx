import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { logout } from '../services/auth';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  if (!userInfo) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Personal Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Username:</span> {userInfo.username || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {userInfo.email || 'N/A'}</p>
                <p><span className="font-medium">First Name:</span> {userInfo.first_name || 'N/A'}</p>
                <p><span className="font-medium">Last Name:</span> {userInfo.last_name || 'N/A'}</p>
                <p><span className="font-medium">User ID:</span> {userInfo.user_id || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-4">Account Status</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Role:</span> <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-bold">{userInfo.role || 'user'}</span></p>
                <p><span className="font-medium">Is Active:</span> {userInfo.is_active ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Member Since:</span> {userInfo.iat ? new Date(userInfo.iat * 1000).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">Account Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  Edit Profile
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                  Change Password
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                  Order History
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">Navigation</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Home Page
                </button>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  Login Page
                </button>
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                >
                  Signup Page
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
