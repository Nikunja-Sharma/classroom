import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { profile } = response.data;
        setProfileData({
          name: profile.fullName || '',
          email: profile.email || '',
          role: profile.roleInfo?.type || profile.role || '',
          department: profile.department ? profile.department.replace('_', ' ') : '',
          year: profile.roleInfo?.type === 'Student' ? `${profile.yearOfStudy || ''} Year` : '',
          photo: profile.photo === 'no-photo.png' 
            ? 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg?semt=ais_hybrid'
            : profile.photo,
          ...(profile.roleInfo?.type === 'Student' 
            ? { studentId: profile.studentId || '' }
            : { teacherId: profile.teacherId || '' })
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      
      // Common fields
      formData.append('fullName', profileData.name);
      formData.append('department', profileData.department.replace(' ', '_')); // Convert back to underscore format
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Role-specific fields
      if (profileData.role === 'Student') {
        formData.append('studentId', profileData.studentId);
        // Extract just the number from "X Year" format
        const yearNumber = profileData.year.split(' ')[0];
        formData.append('yearOfStudy', yearNumber);
      } else if (profileData.role === 'Teacher') {
        formData.append('teacherId', profileData.teacherId);
      }

      const response = await axios.put('/auth/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setProfileData({ ...profileData, photo: URL.createObjectURL(file) });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="flex items-center space-x-8 mb-8">
          <div className="relative">
            <img
              src={profileData?.photo || 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg?semt=ais_hybrid'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Label
                  htmlFor="photo-upload"
                  className="bg-indigo-500 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-600"
                >
                  📷
                </Label>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profileData?.name || ''}</h2>
            <p className="text-gray-600">{profileData?.role || ''}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(profileData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setProfileData({ ...profileData, [key]: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{value}</p>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;