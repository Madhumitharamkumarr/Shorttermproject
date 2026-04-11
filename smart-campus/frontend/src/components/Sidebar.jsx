import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Building2, BookOpen, MessageSquare, User, Bell, ClipboardList } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const role = user?.role || 'student';

    const studentMenu = [
        { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
        { path: '/companies',    label: 'Companies',    icon: Building2 },
        { path: '/applications', label: 'Applications', icon: Bell },
        { path: '/preparation',  label: 'Preparation',  icon: BookOpen },
        { path: '/forum',        label: 'Forum',        icon: MessageSquare },
        { path: '/profile',      label: 'Profile',      icon: User },
    ];

    const adminMenu = [
        { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
        { path: '/companies',    label: 'Companies',    icon: Building2 },
        { path: '/applications', label: 'Applications', icon: Bell },
        { path: '/mock-tests',   label: 'Mock Tests',   icon: ClipboardList },
        { path: '/forum',        label: 'Forum',        icon: MessageSquare },
        { path: '/profile',      label: 'Profile',      icon: User },
    ];

    const menuItems = role === 'admin' ? adminMenu : studentMenu;
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user?.email?.[0] || 'U').toUpperCase();

    return (
        <div className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-brand-logo">🎓</div>
                    <div>
                        <h2>PrepNPlace</h2>
                        <div className="sidebar-brand-tagline">Smart Placement Portal</div>
                    </div>
                </div>
            </div>

            {/* User badge */}
            <div className="sidebar-user">
                <div className="sidebar-user-avatar">{initials}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="sidebar-user-name">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
                    <div className="sidebar-user-role">{role === 'admin' ? '🛡️ Admin' : '🎓 Student'}</div>
                </div>
            </div>

            <div className="sidebar-section-label">Navigation</div>

            {/* Nav links */}
            <nav className="sidebar-nav">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
