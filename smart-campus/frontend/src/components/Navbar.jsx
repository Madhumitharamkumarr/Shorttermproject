import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (user?.email?.[0] || 'U').toUpperCase();

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <h3>{greeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋</h3>
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="navbar-right">
                <div className="user-profile">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role-badge">{user?.role || 'student'}</span>
                    </div>
                </div>
                <div className="navbar-divider" />
                <button className="btn-logout" onClick={logout}>
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
