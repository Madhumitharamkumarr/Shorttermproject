import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Target, CheckCircle, Activity, Briefcase, BookOpen, Code2 } from 'lucide-react';
import './Dashboard.css';

const statusColor = (status) => {
    if (status === 'Selected' || status === 'Cleared') return { bg: 'rgba(16,185,129,0.15)', color: '#34d399' };
    if (status === 'Rejected') return { bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
    return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
};

const scoreColor = (pct) => {
    if (pct >= 80) return { bg: 'rgba(16,185,129,0.15)', color: '#34d399' };
    if (pct >= 60) return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
    return { bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
};

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const { applications, companies, testResults } = useContext(DataContext);
    const myApps    = applications.filter(a => a.studentId === user?._id);
    const myResults = (testResults || []).filter(r => r.studentId === user?._id);

    const stats = [
        { icon: <Target size={20} />, value: myApps.length, label: 'Applications', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
        { icon: <CheckCircle size={20} />, value: myApps.filter(a => a.finalStatus === 'Selected').length, label: 'Offers Received', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
        { icon: <Activity size={20} />, value: myApps.filter(a => ['In Progress', 'Applied'].includes(a.finalStatus)).length, label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
        { icon: <Briefcase size={20} />, value: companies.length, label: 'Active Drives', color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)' },
    ];

    // Accomplishment badges
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
                <h2 style={{ marginBottom: 4 }}>Student Dashboard</h2>
                <p style={{ margin: 0, fontSize: 13 }}>Track your placement journey and upcoming opportunities.</p>
            </div>

            {/* Stat Cards */}
            <div className="dashboard-stats">
                {stats.map((c, i) => (
                    <div key={i} className="glass-card stat-card">
                        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                        <div className="stat-info">
                            <div className="stat-value">{c.value}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Test Scores */}
            <div className="glass-panel" style={{ borderRadius: 14, overflow: 'hidden' }}>
                <div className="section-header">
                    <div>
                        <h3>Test Scores</h3>
                        <p>{myResults.length} attempt{myResults.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="section-body">
                    {myResults.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <p>No test attempts yet.</p>
                            <span>Go to <strong style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>Preparation</strong> to take MCQ quizzes or code.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...myResults].reverse().map((r) => {
                                const sc = scoreColor(r.pct);
                                return (
                                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: r.type === 'coding' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)' }}>
                                                {r.type === 'coding' ? <Code2 size={16} style={{ color: '#34d399' }}/> : <BookOpen size={16} style={{ color: '#818cf8' }}/>}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 2 }}>
                                                    🏢 {r.companyName} · {new Date(r.date).toLocaleDateString()}{r.language && ` · ${r.language}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            {r.type === 'mcq' && <span style={{ fontSize: 13, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>{r.score}/{r.total}</span>}
                                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, WebkitTextFillColor: sc.color }}>
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
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {badges.map((b, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 20px', borderRadius: 12, textAlign: 'center', minWidth: 110,
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                    <div style={{ fontSize: 32 }}>{b.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#c7d2fe', WebkitTextFillColor: '#c7d2fe' }}>{b.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>{b.sub}</div>
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
                        <h3>Placement Tracker</h3>
                        <p>{myApps.length} application{myApps.length !== 1 ? 's' : ''} tracked</p>
                    </div>
                </div>
                <div className="section-body">
                    {myApps.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <p>You haven't applied to any companies yet.</p>
                            <span>Go to <strong style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>Companies</strong> to explore drives.</span>
                        </div>
                    ) : (
                        myApps.map((app) => {
                            const comp = companies.find(c => c.id === app.companyId);
                            const sc = statusColor(app.finalStatus);
                            return (
                                <div key={app.id} className="tracker-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{comp?.name || 'Company'}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 2 }}>{comp?.role || '—'}</div>
                                        </div>
                                        <span style={{ background: sc.bg, color: sc.color, WebkitTextFillColor: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                                            {app.finalStatus}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {app.rounds.map((r, idx) => {
                                            const rs = statusColor(r.status);
                                            return (
                                                <div key={idx} className="round-pill" style={{ background: rs.bg, color: rs.color, WebkitTextFillColor: rs.color }}>
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
