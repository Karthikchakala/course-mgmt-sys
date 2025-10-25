// frontend/src/pages/student/StudentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                // Backend endpoint: GET /orders (Fetches all transactions for the logged-in user)
                const response = await apiClient.get('/orders');
                
                // Filter orders to only show successful, unique course enrollments
                const successfulCourses = response.data.orders
                    .filter(order => order.txn_status === 'TXN_SUCCESS');

                setEnrolledCourses(successfulCourses);
                setError(null);

            } catch (err) {
                console.error("Failed to fetch enrolled courses:", err);
                setError(err.response?.data?.message || 'Failed to load your enrolled courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, []);

    if (loading) {
        return <div className="text-center p-12">Loading Your Learning Dashboard...</div>;
    }

    return (
        <div className="container mx-auto p-8 min-h-[calc(100vh-80px)] bg-gray-50">
            <header className="mb-10 border-b pb-4">
                <h1 className="text-4xl font-bold text-gray-900">Welcome Back, {user.name.split(' ')[0]}</h1>
                <p className="text-gray-600">Your current enrolled courses and learning status.</p>
            </header>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Enrolled Courses ({enrolledCourses.length})</h2>
                
                {enrolledCourses.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow-lg text-center">
                        <p className="text-xl text-gray-600 mb-4">You are not currently enrolled in any courses.</p>
                        <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition">
                            Browse the Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map(course => (
                            <Link to={`/courses/${course.course_id}`} key={course.order_id} className="block">
                                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 transition duration-200 hover:shadow-xl transform hover:scale-[1.02] h-full">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.course_title}</h3>
                                    <p className="text-gray-500 text-sm">Purchased: {new Date(course.created_at).toLocaleDateString()}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        {/* This link will take the user directly to the lesson player view */}
                                        <span className="text-sm text-green-600 font-semibold">
                                            Continue Learning &rarr;
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">Progress: 0%</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentDashboard;