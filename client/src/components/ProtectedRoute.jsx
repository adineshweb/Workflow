import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their default dashboard based on their actual role
    if (user?.role === 'Admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user?.role === 'Manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else {
      return <Navigate to="/dashboard/user" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
