import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-icon">🎓</div>
                    <h1>PrepNPlace</h1>
                    <p>Placement Portal — Sign in to continue</p>
                </div>

                <hr className="auth-divider" />

                {/* Student login hint */}
                <div style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    marginBottom: 16,
                    fontSize: 13,
                    color: '#a5b4fc',
                    lineHeight: 1.5
                }}>
                    🎓 <strong>Students:</strong> Use your college email and <strong>Roll Number</strong> as password<br/>
                  
                </div>

                {error && <div className="auth-error">{error}</div>}


                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
