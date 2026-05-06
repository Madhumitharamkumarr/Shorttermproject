import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuToggle }) => {
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

    const firstName = user?.name?.split(' ')[0] || 'User';

    return (
        <header className="navbar" role="banner">
            <div className="navbar-left">
                {/* Hamburger — only visible on mobile/tablet */}
                <button
                    className="hamburger-btn"
                    onClick={onMenuToggle}
                    aria-label="Open navigation menu"
                    aria-haspopup="true"
                >
                    <Menu size={22} />
                </button>

                <div className="navbar-greeting">
                    <h3>{greeting()}, {firstName}! 👋</h3>
                    <span className="navbar-date">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            <div className="navbar-right">
                <div className="user-profile">
                    <div className="user-avatar">{initials}</div>
                    {/* user-info hidden on mobile via CSS */}
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className="user-role-badge">{user?.role || 'student'}</span>
                    </div>
                </div>

                <div className="navbar-divider" />

                <button className="btn-logout" onClick={logout} aria-label="Log out">
                    <LogOut size={15} />
                    <span className="logout-label">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
