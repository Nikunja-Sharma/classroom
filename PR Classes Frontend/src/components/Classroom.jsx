import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  BookOpen,
  ChevronRight,
  School,
  GraduationCap
} from 'lucide-react';

const Classroom = () => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/class/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassData(response.data);
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleClassClick = (classId) => {
    navigate(`/classroom/${classId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Enrolled Classes</p>
            <p className="text-2xl font-bold text-blue-800">
              {classData?.summary?.totalEnrolled || 0}
            </p>
          </div>
          <GraduationCap className="h-8 w-8 text-blue-500" />
        </div>
        <div className="bg-green-50 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Available Classes</p>
            <p className="text-2xl font-bold text-green-800">
              {classData?.summary?.totalAvailable || 0}
            </p>
          </div>
          <School className="h-8 w-8 text-green-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`${
              activeTab === 'enrolled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Enrolled Classes
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Available Classes
          </button>
        </nav>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'enrolled' ? classData?.enrolled : classData?.available)?.map((classItem) => (
          <div
            key={classItem._id}
            onClick={() => handleClassClick(classItem._id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.className}
                  </h3>
                  <p className="text-sm text-gray-500">{classItem.courseCode}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Teacher: {classItem.teacher.fullName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Department: {classItem.department || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{classItem.semester} - {classItem.academicYear}</span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-700">Schedule:</p>
                {classItem.schedule.map((sch, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {sch.day} • {sch.startTime} - {sch.endTime} • Room {sch.room}
                    </span>
                  </div>
                ))}
              </div>

              {classItem.description && (
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                  {classItem.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Students: {classItem.students.length}/{classItem.maxStudents}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  classItem.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {classItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {((activeTab === 'enrolled' ? classData?.enrolled : classData?.available) || []).length === 0 && (
        <div className="text-center py-12">
          <School className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'enrolled' 
              ? "You haven't enrolled in any classes yet." 
              : "No available classes at the moment."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Classroom;
