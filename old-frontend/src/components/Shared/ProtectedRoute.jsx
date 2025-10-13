// frontend/src/components/Shared/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ roles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="text-center p-12 text-lg">Loading session...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(user?.role)) {
        // Unauthorized user—redirect to their authorized dashboard
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    // Authenticated and authorized: render the child routes
    return <Outlet />;
};

export default ProtectedRoute;