import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Companies from './pages/Companies';
import Notifications from './pages/Notifications';
import Preparation from './pages/Preparation';
import Forum from './pages/Forum';
import MockTestManager from './pages/MockTestManager';
import { useContext } from 'react';

// Wrapper for role-based dashboard
const DashboardRouter = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes Wrapper */}
          <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"    element={<DashboardRouter />} />
              <Route path="profile"      element={<Profile />} />
              <Route path="companies"    element={<Companies />} />
              <Route path="applications" element={<Notifications />} />
              <Route path="preparation"  element={<Preparation />} />
              <Route path="mock-tests"   element={<MockTestManager />} />
              <Route path="forum"        element={<Forum />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

