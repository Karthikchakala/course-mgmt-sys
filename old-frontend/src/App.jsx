// frontend/src/App.jsx (FINAL ROUTING AND STRUCTURE)

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; 
import ProtectedRoute from './components/Shared/ProtectedRoute';
import Navbar from './components/Shared/Navbar'; 
import Footer from './components/Shared/Footer'; // 🛑 NEW IMPORT

// --- Page Imports ---
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailsPage from './pages/courses/CourseDetailsPage';
import AdminProfile from './pages/admin/AdminProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourseManagement from './pages/admin/AdminCourseManagement';
import AdminStudentManagement from './pages/admin/AdminStudentManagement';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentOrders from './pages/student/StudentOrders';


// -------------------------------------------------------------------
// 🏠 HOME COMPONENT (Styled Landing Page with new Sections)
// -------------------------------------------------------------------

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    let ctaButton;
    let welcomeMessage;

    if (isAuthenticated) {
        const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        welcomeMessage = `Welcome back, ${user.name.split(' ')[0]}! Ready for your next lesson?`;
        ctaButton = (
            <Link to={dashboardPath} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300 transform hover:scale-105">
                Go to Your Dashboard
            </Link>
        );
    } else {
        welcomeMessage = "Unlock your potential with expert-led, interactive courses. Start learning today!";
        ctaButton = (
            <>
                <Link to="/courses" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300 transform hover:scale-105 mr-4">
                    Explore Our Courses
                </Link>
                <Link to="/register" className="bg-white text-gray-800 font-bold py-3 px-8 rounded-full text-lg shadow-lg border border-gray-300 hover:bg-gray-100 transition duration-300 transform hover:scale-105">
                    Sign Up Now
                </Link>
            </>
        );
    }

    return (
        // Use min-h-screen for the whole view to ensure footer stays at the bottom
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6"> 
            {/* Header / Hero Section */}
            <header className="text-center max-w-5xl mb-12 pt-16">
                
                <h1 className="text-6xl md:text-7xl font-extrabold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                    The Future of Learning is Here
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 mb-10">
                    {welcomeMessage}
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    {ctaButton}
                </div>
            </header>

            {/* NEW: Offers Section */}
            <section className="w-full max-w-6xl mb-12">
                <div className="bg-yellow-400 p-6 md:p-8 rounded-2xl shadow-2xl text-gray-900 text-center">
                    <h2 className="text-3xl font-extrabold mb-2">🔥 Limited Time Offer!</h2>
                    <p className="text-lg">Get 30% OFF your first premium course when you sign up today!</p>
                    <Link to="/courses" className="text-sm font-semibold underline mt-2 inline-block hover:text-black transition">
                        View Offer Details
                    </Link>
                </div>
            </section>
            
            {/* Feature Cards Section */}
            <section className="w-full max-w-6xl p-8 bg-white rounded-2xl shadow-2xl mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Core Platform Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
                    
                    <div className="p-6 bg-blue-50 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-xl">
                        <h3 className="text-xl font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">📈</span> Track Progress</h3>
                        <p className="text-gray-600 text-sm">Monitor lesson completion and track your learning path from start to finish on your dedicated student dashboard.</p>
                    </div>

                    <div className="p-6 bg-green-50 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-xl">
                        <h3 className="text-xl font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">💳</span> Secure Payments</h3>
                        <p className="text-gray-600 text-sm">Integrates the Paytm Payment Gateway for smooth, secure, and instant course purchasing.</p>
                    </div>

                    <div className="p-6 bg-indigo-50 rounded-lg shadow-md border-t-4 border-indigo-500 hover:shadow-xl">
                        <h3 className="text-xl font-semibold mb-2 flex items-center"><span className="text-2xl mr-2">👑</span> Full Admin Control</h3>
                        <p className="text-gray-600 text-sm">A dedicated dashboard for administrators to manage all content, users, and financial transactions.</p>
                    </div>
                </div>
            </section>
            
            {/* NEW: Trust and Support Callout */}
            <div className="w-full max-w-6xl p-4 mb-16 bg-blue-700 rounded-lg text-center shadow-2xl">
                <p className="text-lg font-medium">Have questions about enrollment? Email our support team at <a href="mailto:support@cms.com" className="font-bold underline hover:text-blue-200">support@cms.com</a></p>
            </div>
        </div>
    );
};


// -------------------------------------------------------------------
// 🚀 MAIN APP COMPONENT
// -------------------------------------------------------------------

const App = () => {
    return (
        <div className="flex flex-col min-h-screen"> 
            <Navbar />
            
            {/* The main content area grows to push the footer down */}
            <main className="flex-grow"> 
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/courses" element={<CourseListPage />} />
                    <Route path="/courses/:id" element={<CourseDetailsPage />} />
                    
                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute roles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/courses" element={<AdminCourseManagement />} />
                        <Route path="/admin/students" element={<AdminStudentManagement />} />
                        <Route path="/admin/profile" element={<AdminProfile />} /> 
                    </Route>

                    {/* Student Protected Routes */}
                    <Route element={<ProtectedRoute roles={['student']} />}>
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                        <Route path="/student/orders" element={<StudentOrders />} />
                        <Route path="/student/profile" element={<AdminProfile />} /> 
                    </Route>

                    {/* Fallback Route */}
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                </Routes>
            </main>
            
            <Footer /> {/* 🛑 PLACE FOOTER OUTSIDE <main> and <Routes> */}
        </div>
    );
};

export default App;