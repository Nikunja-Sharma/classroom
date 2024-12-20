// src/components/FileUploadModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const FileUploadModal = ({ isOpen, onClose, onSubmit, assignmentId }) => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = Cookies.get('token');
      
      const formData = new FormData();
      formData.append('submission', file);

      await axios.post(`/assignment/${assignmentId}/submit`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      onSubmit(file);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Upload Assignment</h2>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="mb-4"
          disabled={isSubmitting}
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;