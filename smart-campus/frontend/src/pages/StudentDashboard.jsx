import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Target, CheckCircle, Activity, Briefcase, BookOpen, Code2 } from 'lucide-react';
import './Dashboard.css';

const statusColor = (status) => {
    if (status === 'Selected' || status === 'Cleared') return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
    if (status === 'Rejected') return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
    return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
};

const scoreColor = (pct) => {
    if (pct >= 80) return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
    if (pct >= 60) return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
    return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
};

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const { applications, companies, testResults } = useContext(DataContext);
    const myApps    = applications.filter(a => a.studentId === user?._id);
    const myResults = (testResults || []).filter(r => r.studentId === user?._id);

    const stats = [
        { icon: <Target size={22} />, value: myApps.length, label: 'Applications', color: '#2563EB', bg: '#EFF6FF' },
        { icon: <CheckCircle size={22} />, value: myApps.filter(a => a.finalStatus === 'Selected').length, label: 'Offers Received', color: '#10B981', bg: '#ECFDF5' },
        { icon: <Activity size={22} />, value: myApps.filter(a => ['In Progress', 'Applied'].includes(a.finalStatus)).length, label: 'In Progress', color: '#F59E0B', bg: '#FFFBEB' },
        { icon: <Briefcase size={22} />, value: companies.length, label: 'Active Drives', color: '#0EA5E9', bg: '#F0F9FF' },
    ];

    const badges = [];
    const firstTest  = myResults[0];
    const topScore   = myResults.find(r => r.pct === 100);
    const highScores = myResults.filter(r => r.pct >= 80);
    const codingDone = myResults.filter(r => r.type === 'coding');
    if (firstTest)            badges.push({ icon: '🎯', label: 'First Test!',    sub: firstTest.title });
    if (topScore)             badges.push({ icon: '💯', label: 'Perfect Score!', sub: topScore.title });
    if (highScores.length>=3) badges.push({ icon: '🏆', label: 'Quiz Champion',  sub: `${highScores.length} high scores` });
    if (codingDone.length>=1) badges.push({ icon: '👨‍💻', label: 'Coder',         sub: `${codingDone.length} problem${codingDone.length>1?'s':''} solved` });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h2 style={{ marginBottom: 4, color: '#0F172A', fontSize: '1.5rem', fontWeight: 800 }}>Student Dashboard</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Track your placement journey and upcoming opportunities.</p>
            </div>

            {/* Stat Cards */}
            <div className="dashboard-stats">
                {stats.map((c, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Test Scores */}
            <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div className="section-header">
                    <div>
                        <h3>📊 Test Scores</h3>
                        <p>{myResults.length} attempt{myResults.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="section-body">
                    {myResults.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <p>No test attempts yet.</p>
                            <span>Go to <strong style={{ color: '#2563EB' }}>Preparation</strong> to take MCQ quizzes or code.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...myResults].reverse().map((r) => {
                                const sc = scoreColor(r.pct);
                                return (
                                    <div key={r.id} className="score-row">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                            <div style={{
                                                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: r.type === 'coding' ? '#ECFDF5' : '#EFF6FF'
                                            }}>
                                                {r.type === 'coding'
                                                    ? <Code2 size={17} style={{ color: '#10B981' }} />
                                                    : <BookOpen size={17} style={{ color: '#2563EB' }} />}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                                                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                                    🏢 {r.companyName} · {new Date(r.date).toLocaleDateString()}{r.language && ` · ${r.language}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            {r.type === 'mcq' && <span style={{ fontSize: 13, color: '#64748B' }}>{r.score}/{r.total}</span>}
                                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                                                {r.type === 'coding' ? '✓ Solved' : `${r.pct}%`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Accomplishments */}
            {badges.length > 0 && (
                <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
                    <div className="section-header">
                        <div>
                            <h3>🏅 Accomplishments</h3>
                            <p>{badges.length} badge{badges.length !== 1 ? 's' : ''} earned</p>
                        </div>
                    </div>
                    <div className="section-body">
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            {badges.map((b, i) => (
                                <div key={i} className="badge-card">
                                    <div className="badge-card-icon">{b.icon}</div>
                                    <div className="badge-card-label">{b.label}</div>
                                    <div className="badge-card-sub">{b.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Placement Tracker */}
            <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div className="section-header">
                    <div>
                        <h3>📋 Placement Tracker</h3>
                        <p>{myApps.length} application{myApps.length !== 1 ? 's' : ''} tracked</p>
                    </div>
                </div>
                <div className="section-body">
                    {myApps.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <p>You haven't applied to any companies yet.</p>
                            <span>Go to <strong style={{ color: '#2563EB' }}>Companies</strong> to explore drives.</span>
                        </div>
                    ) : (
                        myApps.map((app) => {
                            const comp = companies.find(c => c.id === app.companyId);
                            const sc = statusColor(app.finalStatus);
                            return (
                                <div key={app.id} className="tracker-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{comp?.name || 'Company'}</div>
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{comp?.role || '—'}</div>
                                        </div>
                                        <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                                            {app.finalStatus}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {app.rounds.map((r, idx) => {
                                            const rs = statusColor(r.status);
                                            return (
                                                <div key={idx} className="round-pill" style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                                                    <span>●</span> {r.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
