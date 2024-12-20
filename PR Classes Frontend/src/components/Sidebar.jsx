import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const token = Cookies.get('token');
    const decodedToken = jwtDecode(token);

    const studentMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/classroom', label: 'Classroom', icon: '👨‍🏫' },
        { path: '/assignments', label: 'Assignments', icon: '📝' },
        { path: '/quizzes', label: 'Quizzes', icon: '✍️' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    const teacherMenuItems = [
        { path: '/teacher-dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/teacher-classroom', label: 'Classroom', icon: '👨‍🏫' },
        { path: '/teacher-assignment', label: 'Assignments', icon: '' },
        { path: '/teacher-quizzes', label: 'Quizzes', icon: '✍️' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    const menuItems = decodedToken.role === 'student' ? studentMenuItems : teacherMenuItems;

    return (
        <div className="w-64 bg-white shadow-lg h-screen fixed">
            <div className="py-6 px-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${location.pathname === item.path
                            ? 'bg-indigo-500 text-white'
                            : 'hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;