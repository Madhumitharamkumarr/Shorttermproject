import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import './Profile.css';
import { Download, Edit2, Globe, Link, Code, Save, X } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { students, setStudents } = useContext(DataContext);

    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user?.role === 'student') {
            const studentData = students.find(s => s.id === user._id) || students[0];
            setProfile(studentData);
            setFormData(studentData);
        } else if (user?.role === 'admin') {
            setProfile({ name: 'Administrator', email: user.email });
        }
    }, [user, students]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = () => {
        const updated = students.map(s =>
            s.id === profile.id
                ? { ...formData, skills: Array.isArray(formData.skills) ? formData.skills : formData.skills.split(',').map(sk => sk.trim()) }
                : s
        );
        setStudents(updated);
        setProfile({ ...formData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({ ...profile });
        setIsEditing(false);
    };

    if (!profile) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading Profile…</div>
    );

    if (user?.role === 'admin') {
        return (
            <div className="glass-panel p-4" style={{ maxWidth: 480 }}>
                <h2 style={{ marginBottom: 8 }}>Admin Profile</h2>
                <p style={{ margin: 0 }}>{profile.email}</p>
            </div>
        );
    }

    const skillsArr = Array.isArray(profile.skills) ? profile.skills : [];

    return (
        <div className="profile-container">
            {/* Header row */}
            <div className="flex-between no-print">
                <div>
                    <h2 style={{ marginBottom: 4 }}>My Profile</h2>
                    <p style={{ margin: 0, fontSize: 13 }}>View and update your placement profile</p>
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button className="btn btn-glass" onClick={handleCancel}>
                                <X size={15} /> Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleSave}>
                                <Save size={15} /> Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-glass" onClick={() => setIsEditing(true)}>
                                <Edit2 size={15} /> Edit Profile
                            </button>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <Download size={15} /> Download PDF
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Card */}
            <div className="glass-panel profile-card">
                {/* Avatar + Name */}
                <div className="profile-header">
                    <div className="profile-avatar">{profile.name?.charAt(0) || 'S'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {isEditing ? (
                            <input
                                className="form-input"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                style={{ marginBottom: 6 }}
                            />
                        ) : (
                            <h3 style={{ marginBottom: 4 }}>{profile.name}</h3>
                        )}
                        <p style={{ margin: 0, fontSize: 13 }}>
                            {profile.dept || '—'}
                            {profile.cgpa ? ` · ${profile.cgpa} CGPA` : ''}
                        </p>
                    </div>
                </div>

                <hr className="section-divider" />

                {/* Info Grid */}
                <div className="profile-grid">
                    <div className="info-group">
                        <label>Email ID</label>
                        <p>{profile.email || formData.email || 'N/A'}</p>
                    </div>
                    <div className="info-group">
                        <label>Phone Number</label>
                        {isEditing
                            ? <input className="form-input" name="phone" value={formData.phone || ''} onChange={handleChange} />
                            : <p>{profile.phone || 'N/A'}</p>}
                    </div>
                    <div className="info-group">
                        <label>Department</label>
                        {isEditing
                            ? <input className="form-input" name="dept" value={formData.dept || ''} onChange={handleChange} />
                            : <p>{profile.dept || 'N/A'}</p>}
                    </div>
                    <div className="info-group">
                        <label>CGPA</label>
                        {isEditing
                            ? <input type="number" step="0.01" className="form-input" name="cgpa" value={formData.cgpa || ''} onChange={handleChange} />
                            : <p>{profile.cgpa || 'N/A'}</p>}
                    </div>
                </div>

                <hr className="section-divider" />

                {/* Skills */}
                <div className="info-group">
                    <label>Skills</label>
                    {isEditing ? (
                        <input
                            className="form-input"
                            name="skills"
                            placeholder="React, Node.js, Python, SQL…"
                            value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        />
                    ) : (
                        <div className="skills-list">
                            {skillsArr.length > 0
                                ? skillsArr.map((skill, idx) => <span key={idx} className="skill-tag">{skill}</span>)
                                : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills added yet.</span>}
                        </div>
                    )}
                </div>

                <hr className="section-divider" />

                {/* Professional Links */}
                <div className="info-group">
                    <label>Professional Links</label>
                    {isEditing ? (
                        <div className="profile-links-edit">
                            <input className="form-input" name="github" placeholder="GitHub URL" value={formData.github || ''} onChange={handleChange} />
                            <input className="form-input" name="linkedin" placeholder="LinkedIn URL" value={formData.linkedin || ''} onChange={handleChange} />
                            <input className="form-input" name="leetcode" placeholder="LeetCode URL" value={formData.leetcode || ''} onChange={handleChange} />
                        </div>
                    ) : (
                        <div className="profile-links">
                            {profile.github
                                ? <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="text-primary"><Globe size={16}/> GitHub</a>
                                : null}
                            {profile.linkedin
                                ? <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="text-info"><Link size={16}/> LinkedIn</a>
                                : null}
                            {profile.leetcode
                                ? <a href={profile.leetcode.startsWith('http') ? profile.leetcode : `https://${profile.leetcode}`} target="_blank" rel="noreferrer" className="text-warning"><Code size={16}/> LeetCode</a>
                                : null}
                            {!profile.github && !profile.linkedin && !profile.leetcode
                                ? <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No links added yet.</span>
                                : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
