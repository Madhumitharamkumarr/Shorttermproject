import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '', password: '', name: '', registerNumber: '',
        department: '', phone: '', dob: '', address: '', cgpa: '', skills: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const { students, setStudents } = useContext(DataContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const payload = {
            ...formData,
            role: 'student',
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
        };
        const res = await register(payload);
        setLoading(false);
        if (res.success) {
            const newStudent = {
                id: res.newId,
                name: payload.name,
                email: payload.email,
                dept: payload.department,
                section: '',
                phone: payload.phone || '',
                dob: payload.dob || '',
                address: payload.address || '',
                cgpa: payload.cgpa || '',
                skills: payload.skills || [],
                github: '',
                linkedin: '',
                leetcode: '',
                resumeUrl: ''
            };
            setStudents([...students, newStudent]);
            navigate('/dashboard');
        } else {
            setError(res.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card wide">
                <div className="auth-brand">
                    <div className="auth-brand-icon">🎓</div>
                    <h1>Smart Campus</h1>
                    <p>Student Registration — Create your placement profile</p>
                </div>

                <hr className="auth-divider" />

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSignup}>
                    <p className="auth-form-title">Account Details</p>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input className="auth-input" name="name" placeholder="e.g. Priya Sharma" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" className="auth-input" name="email" placeholder="your@email.com" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" className="auth-input" name="password" placeholder="Min. 8 characters" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Register Number</label>
                            <input className="auth-input" name="registerNumber" placeholder="e.g. 25MCR001" onChange={handleChange} required />
                        </div>
                    </div>

                    <hr className="auth-divider" />
                    <p className="auth-form-title">Academic Details</p>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Department</label>
                            <input className="auth-input" name="department" placeholder="e.g. MCA, CSE, IT" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" className="auth-input" name="phone" placeholder="10-digit number" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" className="auth-input" name="dob" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" className="auth-input" name="cgpa" placeholder="e.g. 8.5" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Home Address</label>
                        <textarea className="auth-input" name="address" rows="2" placeholder="City, State" onChange={handleChange} required style={{ resize: 'none' }} />
                    </div>
                    <div className="form-group">
                        <label>Skills (comma separated)</label>
                        <input className="auth-input" name="skills" placeholder="React, Node.js, Python, SQL…" onChange={handleChange} />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating Account…' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
