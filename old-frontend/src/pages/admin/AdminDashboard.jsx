// frontend/src/pages/admin/AdminDashboard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import apiClient from '../../services/api'; // Used later for summary counts

const AdminDashboard = () => {
    const [showCourseForm, setShowCourseForm] = useState(false);
    
    // Placeholder data for demonstration (fetch real data in a production environment)
    const placeholderSummary = {
        courses: 7,
        students: 135,
        sales: '$18,900',
    };

    // Placeholder function to simulate refreshing data after a quick add
    const refreshData = () => {
        console.log("Dashboard data refreshed.");
    };

    const dashboardItems = [
        { 
            title: "Manage Content", 
            description: "Add, edit, and delete courses and their associated lessons.", 
            link: "/admin/courses", 
            icon: "📚" 
        },
        { 
            title: "Manage Students", 
            description: "View and manage student accounts and enrollments.", 
            link: "/admin/students", 
            icon: "🧑‍🎓" 
        },
        { 
            title: "Payment Reports", 
            description: "View transaction history and total revenue.", 
            link: "/admin/payments", 
            icon: "💳" 
        },
    ];

    // NOTE: The CourseForm and DashboardCard components would be imported from a separate file 
    // (e.g., ../../components/Admin/) in a modular project. They are defined here for simplicity.

    return (
        <div className="container mx-auto p-8 min-h-[calc(100vh-80px)] bg-gray-50">
            <header className="mb-10 border-b pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Welcome to the control center for your Course Management System.</p>
                </div>
                
                {/* Quick Add Course Button (Opens the form/modal) */}
                {!showCourseForm && (
                    <button
                        onClick={() => setShowCourseForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg text-lg"
                    >
                        + Quick Add Course
                    </button>
                )}
            </header>
            
            {/* Quick Add Form Area */}
            {showCourseForm && (
                <div className="mb-8">
                    {/* Placeholder for actual CourseForm component */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
                         <h2 className="text-2xl font-bold text-indigo-700 mb-4">Quick Add Course Form</h2>
                         <p className='text-gray-600'>Form logic will be implemented here, reusing the **CourseForm** component from the management page.</p>
                          <button 
                            onClick={() => setShowCourseForm(false)}
                            className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                        >
                            Close Form
                        </button>
                    </div>
                </div>
            )}


            {/* Quick Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <DashboardCard title="Total Courses" value={placeholderSummary.courses} color="bg-blue-500" />
                <DashboardCard title="Total Students" value={placeholderSummary.students} color="bg-green-500" />
                <DashboardCard title="Total Sales" value={placeholderSummary.sales} color="bg-indigo-500" />
            </section>

            {/* Navigation Cards */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Management Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardItems.map((item) => (
                        <Link to={item.link} key={item.title} className="block">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition duration-200 hover:shadow-xl hover:border-blue-400 h-full">
                                <div className="text-3xl mb-3">{item.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Reusable Summary Card Component
const DashboardCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transform hover:scale-[1.02] transition duration-200">
        <div className={`p-3 rounded-xl w-fit mb-3 ${color}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{value}</h2>
    </div>
);

export default AdminDashboard;