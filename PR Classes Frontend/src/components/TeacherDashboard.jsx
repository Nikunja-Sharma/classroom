import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('/dashboard/teacher', {
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
          title="Total Students"
          value={dashboardData.overview?.totalStudents || 0}
          color="text-green-600"
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          title="Total Assignments"
          value={dashboardData.overview?.totalAssignments || 0}
          color="text-purple-600"
        />
        <StatCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="Total Quizzes"
          value={dashboardData.overview?.totalQuizzes || 0}
          color="text-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Classes Overview</h2>
          <div className="space-y-4">
            {(dashboardData.classesOverview || []).map((classItem) => (
              <div key={classItem._id} className="border rounded-lg p-4">
                <h3 className="font-medium">{classItem.className}</h3>
                <p className="text-sm text-gray-600">Course Code: {classItem.courseCode}</p>
                <p className="text-sm text-gray-600">Students: {classItem.studentCount}</p>
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

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-6">
            <MetricCard
              title="Assignments"
              total={dashboardData.performanceMetrics?.assignments?.total || 0}
              metrics={[
                {
                  label: "Submission Rate",
                  value: `${dashboardData.performanceMetrics?.assignments?.submissionRate || 0}%`
                },
                {
                  label: "On-time Submissions",
                  value: `${dashboardData.performanceMetrics?.assignments?.onTimeSubmissionRate || 0}%`
                }
              ]}
            />
            <MetricCard
              title="Quizzes"
              total={dashboardData.performanceMetrics?.quizzes?.total || 0}
              metrics={[
                {
                  label: "Average Score",
                  value: `${dashboardData.performanceMetrics?.quizzes?.averageScore || 0}%`
                },
                {
                  label: "Participation Rate",
                  value: `${dashboardData.performanceMetrics?.quizzes?.participationRate || 0}%`
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSubmissions
          title="Recent Assignment Submissions"
          submissions={dashboardData.recentSubmissions?.assignments || []}
          type="assignment"
        />
        <RecentSubmissions
          title="Recent Quiz Submissions"
          submissions={dashboardData.recentSubmissions?.quizzes || []}
          type="quiz"
        />
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

const MetricCard = ({ title, total, metrics }) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-medium">{title}</h3>
      <span className="text-sm text-gray-500">Total: {total}</span>
    </div>
    <div className="space-y-2">
      {metrics.map((metric, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{metric.label}</span>
          <span className="font-medium">{metric.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const RecentSubmissions = ({ title, submissions, type }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="space-y-4">
      {submissions.map((submission, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {type === 'quiz' ? submission.quizTitle : submission.assignmentTitle}
              </h3>
              <p className="text-sm text-gray-600">{submission.studentName}</p>
              <p className="text-sm text-gray-500">{submission.studentId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {format(new Date(submission.submittedAt), 'PPp')}
              </p>
              {type === 'quiz' && (
                <p className="text-sm font-medium">Score: {submission.score}</p>
              )}
            </div>
          </div>
        </div>
      ))}
      {submissions.length === 0 && (
        <p className="text-center text-gray-500">No recent submissions</p>
      )}
    </div>
  </div>
);

export default TeacherDashboard;
