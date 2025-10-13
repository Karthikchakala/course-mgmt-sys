// frontend/src/components/Shared/Navbar.jsx (Final Version)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Determine the base dashboard and profile links based on role
    const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    const profileLink = user?.role === 'admin' ? '/admin/profile' : '/student/profile'; 

    // Extract the first name for display, safely defaulting if user or name is missing
    const firstName = user?.name?.split(' ')[0] || 'User';

    return (
        <nav className="bg-gray-900 p-4 shadow-xl sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                
                {/* Logo / Home Link */}
                <Link to="/" className="text-white text-2xl font-extrabold tracking-wider hover:text-blue-400 transition duration-200">
                    CMS Learning
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center space-x-4">
                    
                    {/* Public Link */}
                    <Link to="/courses" className="text-gray-300 hover:text-white transition duration-200 text-base">
                        Courses
                    </Link>

                    {isAuthenticated ? (
                        /* Authenticated Links */
                        <div className="flex items-center space-x-4">
                            
                            {/* Dashboard Link */}
                            <Link to={dashboardLink} className="text-gray-300 hover:text-white transition duration-200 text-base">
                                Dashboard
                            </Link>
                            
                            {/* Profile Link */}
                            <Link to={profileLink} className="text-gray-300 hover:text-white transition duration-200 text-base">
                                Profile
                            </Link>
                            {/* Display the user's first name clearly */}
                                <span className="font-bold text-white">{firstName}</span> 
                            {/* User Name and Logout Button */}
                            <button
                                onClick={handleLogout}
                                // Display name and logout in one visually unified element
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition duration-200 shadow-md flex items-center space-x-2"
                            >
                                
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        /* Unauthenticated Links */
                        <>
                            <Link to="/login" className="text-green-400 hover:text-green-300 transition duration-200 text-base">
                                Login
                            </Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition duration-200 shadow-md">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;