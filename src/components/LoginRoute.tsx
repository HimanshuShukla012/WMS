import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';

const LoginRoute: React.FC = () => {
  const { token, role, isLoading, getDashboardRoute } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate dashboard
  if (token && role) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  // Not authenticated, show login page
  return <Login />;
};

export default LoginRoute;