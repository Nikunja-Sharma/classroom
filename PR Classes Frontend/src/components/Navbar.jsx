import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data.profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-md">
            <span className='font-bold text-3xl'>PR Classes </span>
            for Students
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-indigo-500 text-white placeholder-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="rounded-full w-8 h-8 bg-indigo-500 flex items-center justify-center"
              >
                <span className="text-xl">🔔</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link to="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    Notification 1
                  </Link>
                  <Link to="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    Notification 2
                  </Link>
                  <Link to="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    Notification 3
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/profile">
                <img
                  src={profileData?.photo === 'no-photo.png' 
                    ? "https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg?semt=ais_hybrid"
                    : profileData?.photo}
                  alt="Profile"
                  className="rounded-full w-8 h-8 object-cover"
                />
              </Link>
              <span>{profileData?.fullName || 'Loading...'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;