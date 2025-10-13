// frontend/src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
    const { isAuthenticated, user } = useAuth();

    let ctaButton;
    let welcomeText;

    if (isAuthenticated) {
        const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        welcomeText = `Welcome back, ${user.name.split(' ')[0]}!`;
        ctaButton = (
            <Link to={dashboardPath} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                Go to Your Dashboard
            </Link>
        );
    } else {
        welcomeText = "Unlock Your Potential with Our Courses.";
        ctaButton = (
            <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 mr-4">
                Browse Courses
            </Link>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-4xl">
                
                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                    The Ultimate Course Management System
                </h1>
                
                {/* Dynamic Subheading */}
                <p className="text-2xl text-gray-600 mb-8">
                    {welcomeText}
                </p>

                {/* Call to Action Buttons */}
                <div className="flex justify-center">
                    {ctaButton}
                    
                    {!isAuthenticated && (
                         <Link to="/login" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            </div>

            {/* Optional: Simple feature highlight */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
                <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Admin Control</h3>
                    <p className="text-gray-500">Manage students, courses, and revenue reports with ease.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-semibold text-green-600 mb-3">Seamless Payments</h3>
                    <p className="text-gray-500">Secure course purchases via Paytm Payment Gateway integration.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                    <h3 className="text-xl font-semibold text-red-600 mb-3">Track Progress</h3>
                    <p className="text-gray-500">Students access dashboards and mark lessons as complete.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;