import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="navbar glass-panel">
            <div className="navbar-left">
                <h3>Welcome back, {user?.role === 'admin' ? 'Admin' : 'Student'}!</h3>
            </div>
            <div className="navbar-right">
                <div className="user-profile">
                    <User size={20} />
                    <span>{user?.email}</span>
                </div>
                <button className="btn btn-glass btn-logout" onClick={logout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
