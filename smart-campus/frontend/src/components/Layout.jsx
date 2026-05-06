import React, { useContext, useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const { user, loading } = useContext(AuthContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            fontSize: 15,
            color: 'var(--text-muted)',
            gap: 10,
        }}>
            <span style={{ fontSize: 24 }}>⏳</span> Loading...
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="app-container">
            {/* Mobile overlay — closes sidebar when tapping outside */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <div className="main-content">
                <Navbar onMenuToggle={openSidebar} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
