import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Building2, BookOpen, MessageSquare, User, Bell, ClipboardList } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const role = user?.role || 'student';

    const studentMenu = [
        { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
        { path: '/companies',   label: 'Companies',   icon: Building2 },
        { path: '/applications',label: 'Applications',icon: Bell },
        { path: '/preparation', label: 'Preparation', icon: BookOpen },
        { path: '/forum',       label: 'Forum',       icon: MessageSquare },
        { path: '/profile',     label: 'Profile',     icon: User },
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

    return (
        <div className="sidebar glass-panel">
            <div className="sidebar-brand text-center mb-4 mt-4">
                <h2 style={{ background: 'none', WebkitTextFillColor: 'white' }}>PrepNPlace</h2>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
