import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
