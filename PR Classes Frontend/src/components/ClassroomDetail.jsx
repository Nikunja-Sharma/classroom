import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  Users, 
  Calendar, 
  Clock, 
  Mail,
  Building,
  GraduationCap,
  BookOpen,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ClassroomDetail = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get(`/class/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassData(response.data);
      } catch (error) {
        console.error('Error fetching class data:', error);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">{error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classData.className}
            </h1>
            <p className="text-gray-500 mt-1">{classData.courseCode}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            classData.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {classData.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <InfoCard
            icon={<Users className="h-5 w-5 text-blue-500" />}
            title="Class Capacity"
            value={`${classData.students.length} / ${classData.maxStudents} Students`}
          />
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-green-500" />}
            title="Academic Year"
            value={`${classData.semester} - ${classData.academicYear}`}
          />
          <InfoCard
            icon={<Building className="h-5 w-5 text-purple-500" />}
            title="Department"
            value={classData.department}
          />
        </div>
      </div>

      {/* Teacher Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Teacher Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{classData.teacher.fullName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{classData.teacher.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Class Schedule
        </h2>
        <div className="space-y-4">
          {classData.schedule.map((sch, index) => (
            <div 
              key={index}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{sch.day}</p>
                <p className="text-sm text-gray-600">
                  {sch.startTime} - {sch.endTime}
                </p>
                <p className="text-sm text-gray-500">Room: {sch.room}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {classData.description && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Description
          </h2>
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-gray-400 mt-1" />
            <p className="text-gray-600">{classData.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component
const InfoCard = ({ icon, title, value }) => (
  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
    {icon}
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default ClassroomDetail; 