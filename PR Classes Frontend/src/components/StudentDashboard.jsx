import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/dashboard/student', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center">No dashboard data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          title="Total Classes"
          value={dashboardData.overview?.totalClasses || 0}
          color="text-blue-600"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          title="Total Teachers"
          value={dashboardData.overview?.totalTeachers || 0}
          color="text-green-600"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Assignments"
          value={dashboardData.overview?.totalAssignments || 0}
          color="text-purple-600"
        />
        <StatCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="Quizzes"
          value={dashboardData.overview?.totalQuizzes || 0}
          color="text-orange-600"
        />
      </div>

      {/* Academic Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Assignment Progress</h2>
          <div className="space-y-4">
            <ProgressCard
              total={dashboardData.academicProgress?.assignments?.total || 0}
              stats={[
                {
                  label: "Submitted",
                  value: dashboardData.academicProgress?.assignments?.submitted || 0,
                  icon: <CheckCircle className="h-4 w-4 text-green-500" />
                },
                {
                  label: "Pending",
                  value: dashboardData.academicProgress?.assignments?.pending || 0,
                  icon: <Clock className="h-4 w-4 text-yellow-500" />
                },
                {
                  label: "Overdue",
                  value: dashboardData.academicProgress?.assignments?.overdue || 0,
                  icon: <AlertTriangle className="h-4 w-4 text-red-500" />
                }
              ]}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quiz Progress</h2>
          <div className="space-y-4">
            <ProgressCard
              total={dashboardData.academicProgress?.quizzes?.total || 0}
              stats={[
                {
                  label: "Completed",
                  value: dashboardData.academicProgress?.quizzes?.completed || 0,
                  icon: <CheckCircle className="h-4 w-4 text-green-500" />
                },
                {
                  label: "Pending",
                  value: dashboardData.academicProgress?.quizzes?.pending || 0,
                  icon: <Clock className="h-4 w-4 text-yellow-500" />
                }
              ]}
              additionalInfo={`Average Score: ${dashboardData.academicProgress?.quizzes?.averageScore || 0}%`}
            />
          </div>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Enrolled Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(dashboardData.enrolledClasses || []).map((classItem) => (
            <div key={classItem._id} className="border rounded-lg p-4">
              <h3 className="font-medium">{classItem.className}</h3>
              <p className="text-sm text-gray-600">Course Code: {classItem.courseCode}</p>
              <p className="text-sm text-gray-600">Teacher: {classItem.teacher?.name}</p>
              <div className="mt-2">
                {classItem.schedule.map((sch, index) => (
                  <p key={index} className="text-sm text-gray-500">
                    {sch.day}: {sch.startTime} - {sch.endTime} (Room {sch.room})
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
        <div className="space-y-4">
          {(dashboardData.upcomingDeadlines || []).map((deadline, index) => (
            <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    deadline.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {deadline.type}
                  </span>
                  <h3 className="font-medium">{deadline.title}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Due: {format(new Date(deadline.dueDate), 'PPp')}
                </p>
                {deadline.teacher && (
                  <p className="text-sm text-gray-500">Teacher: {deadline.teacher}</p>
                )}
              </div>
              <div>
                {deadline.submitted ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
          {(dashboardData.upcomingDeadlines || []).length === 0 && (
            <p className="text-center text-gray-500">No upcoming deadlines</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </div>
      <div className={`${color}`}>{icon}</div>
    </div>
  </div>
);

const ProgressCard = ({ total, stats, additionalInfo }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Total: {total}</span>
      {additionalInfo && (
        <span className="text-sm font-medium text-blue-600">{additionalInfo}</span>
      )}
    </div>
    <div className="space-y-2">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stat.icon}
            <span className="text-sm text-gray-600">{stat.label}</span>
          </div>
          <span className="font-medium">{stat.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default StudentDashboard; 