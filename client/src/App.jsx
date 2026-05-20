import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/authSlice';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestCreatePage from './pages/RequestCreatePage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  // Restore user session if token exists in localStorage
  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  // Root redirect helper based on role
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    
    // Redirect to default dashboard
    if (user.role === 'Admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user.role === 'Manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else {
      return <Navigate to="/dashboard/user" replace />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Routes with Role-Based Protection */}
        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Request Management Routes */}
        <Route
          path="/request/create"
          element={
            <ProtectedRoute allowedRoles={['User']}>
              <RequestCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/details/:id"
          element={
            <ProtectedRoute allowedRoles={['User', 'Manager', 'Admin']}>
              <RequestDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Root Route Redirect */}
        <Route path="/" element={getRootRedirect()} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
