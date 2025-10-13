// frontend/src/pages/courses/CourseListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api'; // The configured Axios instance

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Backend endpoint: GET /courses (Public route)
                const response = await apiClient.get('/courses'); 
                
                // Ensure data structure is safe before setting state
                if (response.data && Array.isArray(response.data.courses)) {
                    setCourses(response.data.courses);
                } else {
                    setCourses([]); 
                }
                
                setError(null);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
                // Set courses to empty array to prevent TypeError crash
                setCourses([]); 
                setError('Failed to load courses. Please check the backend server and network connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                <p className="text-xl text-gray-600">Loading Course Catalog...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-[calc(100vh-80px)]">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-10 text-center border-b-2 pb-4">
                Explore Our Catalog
            </h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">{error}</div>
            )}

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                    <p className="text-2xl text-gray-600 font-medium">No courses are available right now. Check back soon!</p>
                    {/* <p className="text-sm text-gray-400 mt-2">Hint: Log in as Admin and add some courses via the /admin/course endpoint.</p> */}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {courses.map(course => (
                        <div 
                            key={course.id} 
                            className="bg-white rounded-xl shadow-xl overflow-hidden 
                                       transform hover:shadow-2xl hover:scale-[1.03] transition duration-300
                                       flex flex-col"
                        >
                            {/* Course Image Placeholder */}
                            <div className="h-48 bg-indigo-500/10 flex items-center justify-center text-indigo-800 font-bold text-lg p-4">
                                <span className="p-2 border-2 border-indigo-500 rounded-lg">{course.category}</span>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-gray-600 mb-4 text-sm flex-grow line-clamp-3">{course.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-2xl font-extrabold text-green-600">
                                        ${parseFloat(course.price).toFixed(2)}
                                    </span>
                                    <Link 
                                        to={`/courses/${course.id}`} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-150 shadow-md"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseListPage;