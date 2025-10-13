// frontend/src/pages/admin/AdminProfile.jsx

import React, { useState } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
    const { user, logout } = useAuth(); // Get current user data and logout
    
    // State for Profile Update Form
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
    });
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [profileSaving, setProfileSaving] = useState(false);

    // State for Password Update Form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);

    // --- Handlers ---

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };
    
    // PUT /auth/update-profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: '', text: '' });
        setProfileSaving(true);

        try {
            const response = await apiClient.put('/auth/update-profile', profileData); 
            
            // Success: Update the local user state in localStorage and reload/refresh Context
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
            window.location.reload(); 
            
            setProfileMessage({ type: 'success', text: 'Profile updated successfully! Refreshing session...' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile.';
            setProfileMessage({ type: 'error', text: msg });
        } finally {
            setProfileSaving(false);
        }
    };
    
    // PUT /auth/update-password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        setPasswordSaving(true);
        
        try {
            await apiClient.put('/auth/update-password', passwordData);
            
            setPasswordMessage({ type: 'success', text: 'Password changed successfully! Logging out for security.' });
            
            // Force logout after successful password change for security
            setTimeout(logout, 2000); 

        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.';
            setPasswordMessage({ type: 'error', text: msg });
        } finally {
            setPasswordSaving(false);
        }
    };


    // --- Render Helpers ---

    const renderMessage = (msgState) => {
        if (!msgState.text) return null;
        const classes = msgState.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700';
        return (
            <div className={`p-3 rounded border mb-4 text-sm ${classes}`} role="alert">
                {msgState.text}
            </div>
        );
    };


    return (
        <div className="container mx-auto p-8 min-h-[calc(100vh-80px)] bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">
                Profile Management ({user.role === 'admin' ? 'Administrator' : 'Student'})
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Profile Details Update */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Update Details</h2>
                    {renderMessage(profileMessage)}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Name</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
                            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} required 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button type="submit" disabled={profileSaving} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 disabled:opacity-50">
                                {profileSaving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* 2. Password Update */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-red-700 mb-4">Change Password</h2>
                    {renderMessage(passwordMessage)}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">Current Password</label>
                            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-1">New Password</label>
                            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <button type="submit" disabled={passwordSaving} 
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 disabled:opacity-50">
                                {passwordSaving ? 'Saving...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AdminProfile;