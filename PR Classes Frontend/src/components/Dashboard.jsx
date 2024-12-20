import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const upcomingClasses = [
        {
            id: 1,
            subject: 'Mathematics',
            topic: 'Calculus',
            time: '10:00 AM',
            teacher: 'Dr. Smith',
        },
        {
            id: 2,
            subject: 'Physics',
            topic: 'Quantum Mechanics',
            time: '2:00 PM',
            teacher: 'Prof. Johnson',
        },
    ];

    const assignments = [
        {
            id: 1,
            title: 'Linear Algebra Assignment',
            dueDate: '2024-10-28',
            status: 'pending',
        },
        {
            id: 2,
            title: 'Physics Lab Report',
            dueDate: '2024-10-30',
            status: 'submitted',
        },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Total Classes', value: '12', color: 'bg-blue-500' },
                    { label: 'Assignments', value: '5', color: 'bg-green-500' },
                    { label: 'Quizzes', value: '3', color: 'bg-purple-500' },
                    { label: 'Average Score', value: '85%', color: 'bg-yellow-500' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className={`${stat.color} rounded-lg p-6 text-white`}
                    >
                        <h3 className="text-lg font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
                <div className="space-y-4">
                    {upcomingClasses.map((cls) => (
                        <div
                            key={cls.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                            <div>
                                <h3 className="font-medium">{cls.subject}</h3>
                                <p className="text-sm text-gray-600">{cls.topic}</p>
                                <p className="text-sm text-gray-500">by {cls.teacher}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">{cls.time}</p>
                                <Link
                                    to={`/classroom/${cls.id}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Join Class
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Assignments */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Assignments</h2>
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                            <div>
                                <h3 className="font-medium">{assignment.title}</h3>
                                <p className="text-sm text-gray-600">
                                    Due: {assignment.dueDate}
                                </p>
                            </div>
                            <div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm ${assignment.status === 'submitted'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {assignment.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;