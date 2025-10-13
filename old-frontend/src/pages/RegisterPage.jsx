// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (user) {
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        navigate(redirectPath, { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/student/dashboard', { replace: true }); // Redirect upon successful registration
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-100 p-4"> {/* Adjust min-height for Navbar */}
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md transform hover:scale-[1.01] transition duration-300">
                <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Become a Student</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm font-medium" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 shadow-md"
                    >
                        Register
                    </button>
                </form>
                <p className="text-center text-gray-500 text-sm mt-6">
                    Already registered? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;