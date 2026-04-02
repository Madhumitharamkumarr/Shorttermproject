import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import {
    Plus, Briefcase, IndianRupee, Calendar, Trash2, Users, X,
    ChevronRight, ChevronDown, CheckCircle, XCircle, Clock, Info,
    BarChart2, FileText, TrendingUp
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROUNDS = ['Aptitude', 'Technical', 'HR', 'Final'];

const roundStatusColor = (status) => {
    if (status === 'Cleared' || status === 'Selected') return { bg: 'rgba(16,185,129,0.15)', color: '#34d399' };
    if (status === 'Rejected') return { bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
    return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
};

// ── Admin: Company Pipeline Dashboard (modal/expandable) ─────────────────────
const PipelinePanel = ({ company, applications, students, setApplications, onClose }) => {
    const { pushNotification } = useContext(DataContext);
    const apps = applications.filter(a => a.companyId === company.id);
    const [expandedApp, setExpandedApp] = useState(null);

    // Compute round stats
    const roundStats = ROUNDS.map(round => {
        const inRound  = apps.filter(a => a.rounds.some(r => r.name === round));
        const cleared  = apps.filter(a => a.rounds.some(r => r.name === round && r.status === 'Cleared'));
        const rejected = apps.filter(a => a.rounds.some(r => r.name === round && r.status === 'Rejected'));
        const pending  = apps.filter(a => a.rounds.some(r => r.name === round && r.status === 'Pending'));
        return { round, total: inRound.length, cleared: cleared.length, rejected: rejected.length, pending: pending.length };
    }).filter(rs => rs.total > 0);

    const selected = apps.filter(a => a.finalStatus === 'Selected').length;

    // Update a student's round status
    const updateRound = (appId, roundName, newStatus) => {
        setApplications(applications.map(a => {
            if (a.id !== appId) return a;
            let rounds = a.rounds.map(r => r.name === roundName ? { ...r, status: newStatus } : r);
            // If cleared this round and next round doesn't exist, add it
            if (newStatus === 'Cleared') {
                const nextRound = ROUNDS[ROUNDS.indexOf(roundName) + 1];
                if (nextRound && !rounds.some(r => r.name === nextRound)) {
                    rounds = [...rounds, { name: nextRound, status: 'Pending', reason: '' }];
                }
            }
            // Compute final status
            const allRounds = rounds;
            const hasRejected = allRounds.some(r => r.status === 'Rejected');
            const lastRound = allRounds[allRounds.length - 1];
            let finalStatus = 'In Progress';
            if (hasRejected) finalStatus = 'Rejected';
            else if (lastRound?.name === 'Final' && lastRound?.status === 'Cleared') finalStatus = 'Selected';
            else if (lastRound?.name === 'HR' && lastRound?.status === 'Cleared') finalStatus = 'Selected';
            // Push individual notification to student
            if (newStatus === 'Cleared') {
                const updatedRounds = rounds; // already has next round if added
                const latestRound = updatedRounds[updatedRounds.length - 1];
                pushNotification(
                    `Round Update: ${company.name}`,
                    `Congratulations! You cleared ${roundName} and advanced to ${latestRound.name} at ${company.name}.`,
                    'Info',
                    a.studentId
                );
            } else if (newStatus === 'Rejected') {
                pushNotification(
                    `Application Update: ${company.name}`,
                    `We regret to inform you that you were not selected for the next round at ${company.name}. Keep practicing!`,
                    'Urgent',
                    a.studentId
                );
            }

            return { ...a, rounds, finalStatus };
        }));
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '32px 16px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: 780, borderRadius: 16, padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18 }}>{company.name} — Interview Pipeline</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                            {company.role} · {apps.length} applicant{apps.length !== 1 ? 's' : ''} · {selected} selected
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-glass" style={{ padding: '6px 10px' }}><X size={16}/></button>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Summary funnel */}
                    {roundStats.length > 0 && (
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BarChart2 size={13}/> Round-wise Funnel
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {/* Applied pill */}
                                <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', textAlign: 'center', minWidth: 100 }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>{apps.length}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 2 }}>Applied</div>
                                </div>
                                {roundStats.map((rs, i) => (
                                    <React.Fragment key={rs.round}>
                                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><ChevronRight size={16}/></div>
                                        <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', textAlign: 'center', minWidth: 100 }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{rs.cleared}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 2 }}>{rs.round} Cleared</div>
                                            <div style={{ fontSize: 10, display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4 }}>
                                                <span style={{ color: '#f87171', WebkitTextFillColor: '#f87171' }}>✗{rs.rejected}</span>
                                                <span style={{ color: '#fbbf24', WebkitTextFillColor: '#fbbf24' }}>⏳{rs.pending}</span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                {selected > 0 && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><ChevronRight size={16}/></div>
                                        <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center', minWidth: 100 }}>
                                            <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', WebkitTextFillColor: '#34d399' }}>{selected}</div>
                                            <div style={{ fontSize: 11, color: '#34d399', WebkitTextFillColor: '#34d399', marginTop: 2 }}>🎉 Selected</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Student list */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={13}/> Manage Applicants
                        </div>
                        {apps.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No students have applied yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {apps.map(app => {
                                    const s = students.find(st => st.id === app.studentId);
                                    const sc = roundStatusColor(app.finalStatus);
                                    const isExpanded = expandedApp === app.id;
                                    return (
                                        <div key={app.id} style={{ borderRadius: 10, border: '1px solid var(--glass-border)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                                            {/* Row */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }}
                                                onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                                                <div style={{ flex: 1, minWidth: 160 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>
                                                        {s?.name || app.studentId}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 2 }}>
                                                        {s?.id} · Sec {s?.section} · CGPA {s?.cgpa || '—'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, WebkitTextFillColor: sc.color }}>
                                                        {app.finalStatus}
                                                    </span>
                                                    {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                                </div>
                                            </div>

                                            {/* Expanded: round management */}
                                            {isExpanded && (
                                                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                                                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        {app.rounds.map((r, idx) => {
                                                            const rc = roundStatusColor(r.status);
                                                            return (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        {r.status === 'Cleared' ? <CheckCircle size={14} style={{ color: '#34d399' }}/> :
                                                                         r.status === 'Rejected' ? <XCircle size={14} style={{ color: '#f87171' }}/> :
                                                                         <Clock size={14} style={{ color: '#fbbf24' }}/>}
                                                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{r.name}</span>
                                                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: rc.bg, color: rc.color, WebkitTextFillColor: rc.color }}>{r.status}</span>
                                                                    </div>
                                                                    {r.status === 'Pending' && (
                                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                                            <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 11 }}
                                                                                onClick={() => updateRound(app.id, r.name, 'Cleared')}>
                                                                                ✓ Clear
                                                                            </button>
                                                                            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}
                                                                                onClick={() => updateRound(app.id, r.name, 'Rejected')}>
                                                                                ✗ Reject
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Companies = () => {
    const { user } = useContext(AuthContext);
    const { companies, setCompanies, applications, setApplications, students, pushNotification } = useContext(DataContext);

    const [showForm, setShowForm]           = useState(false);
    const [pipelineCompany, setPipeline]    = useState(null);
    const [expandedJob, setExpandedJob]     = useState(null);
    const [formData, setFormData]           = useState({
        name: '', role: '', eligibility: '', salary: '', driveDate: '',
        description: '', jobDescription: '', rounds: 'Aptitude,Technical,HR',
        applicationDeadline: ''
    });

    const isStudent = user?.role === 'student';
    const hasApplied = (companyId) => applications.some(a => a.studentId === user._id && a.companyId === companyId);

    const handleApply = (companyId) => {
        if (hasApplied(companyId)) return;
        const comp = companies.find(c => c.id === companyId);
        const rounds = (comp?.rounds || 'Aptitude,Technical,HR').split(',').map(r => ({ name: r.trim(), status: 'Pending', reason: '' }));
        setApplications([...applications, {
            id: Date.now(), studentId: user._id, companyId,
            rounds,
            finalStatus: 'Applied'
        }]);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this company?')) return;
        setCompanies(companies.filter(c => c.id !== id));
        setApplications(applications.filter(a => a.companyId !== id));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const newCompany = {
            id: Date.now(), ...formData,
            status: 'Active',
            driveDate: formData.driveDate || new Date().toISOString(),
            applicationDeadline: formData.applicationDeadline || new Date(Date.now() + 7*24*60*60*1000).toISOString()
        };
        setCompanies([...companies, newCompany]);
        
        // Push notification to ALL students
        const deadlineStr = new Date(newCompany.applicationDeadline).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        pushNotification(
            `New Placement Alert: ${formData.name}`,
            `${formData.name} is visiting for the ${formData.role} role. Apply before ${deadlineStr}! Eligibility: ${formData.eligibility}.`,
            'Action Required'
        );

        setFormData({ name: '', role: '', eligibility: '', salary: '', driveDate: '', description: '', jobDescription: '', rounds: 'Aptitude,Technical,HR', applicationDeadline: '' });
        setShowForm(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Visiting Companies</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>{companies.length} companies driving this season</p>
                </div>
                {!isStudent && (
                    <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn btn-glass' : 'btn btn-primary'}>
                        {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Add Company</>}
                    </button>
                )}
            </div>

            {/* Add Company Form */}
            {showForm && (
                <div className="glass-panel p-4">
                    <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '15px' }}>Add New Company</p>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                            {[['Company Name','name','e.g. Infosys'],['Role / Position','role','e.g. System Engineer'],
                              ['Eligibility %','eligibility','e.g. 60%'],['Salary Package','salary','e.g. 3.6 LPA']].map(([label,field,ph]) => (
                                <div key={field} className="form-group">
                                    <label>{label}</label>
                                    <input className="form-input" placeholder={ph} value={formData[field]}
                                        onChange={e => setFormData({...formData, [field]: e.target.value})} required />
                                </div>
                            ))}
                            <div className="form-group">
                                <label>Drive Date</label>
                                <input type="date" className="form-input" value={formData.driveDate?.substring(0,10) || ''}
                                    onChange={e => setFormData({...formData, driveDate: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Interview Rounds (comma separated)</label>
                                <input className="form-input" placeholder="Aptitude,Technical,HR" value={formData.rounds}
                                    onChange={e => setFormData({...formData, rounds: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Application Deadline</label>
                                <input type="datetime-local" className="form-input" value={formData.applicationDeadline}
                                    onChange={e => setFormData({...formData, applicationDeadline: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 10 }}>
                            <label>Short Description</label>
                            <textarea className="form-input" rows="2" placeholder="Brief tagline about the drive…"
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{ resize: 'none' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label>Full Job Description</label>
                            <textarea className="form-input" rows="4" placeholder="Roles & responsibilities, requirements, perks…"
                                value={formData.jobDescription} onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                                style={{ resize: 'vertical' }} />
                        </div>
                        <button type="submit" className="btn btn-success">Add Company</button>
                    </form>
                </div>
            )}

            {/* Company Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
                {companies.map(company => {
                    const applicantList = applications.filter(a => a.companyId === company.id);
                    const applied = hasApplied(company.id);
                    const myApp   = applications.find(a => a.companyId === company.id && a.studentId === user._id);
                    const selected = applicantList.filter(a => a.finalStatus === 'Selected').length;
                    const jobExpanded = expandedJob === company.id;
                    const isExpired = new Date() > new Date(company.applicationDeadline || '9999-12-31');

                    return (
                        <div key={company.id} className="glass-panel" style={{ borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                            {/* Card Header */}
                            <div style={{ padding: '20px 20px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700 }}>
                                        {company.name.charAt(0)}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                        <span style={{ background: company.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: company.status === 'Active' ? '#34d399' : '#fbbf24', WebkitTextFillColor: company.status === 'Active' ? '#34d399' : '#fbbf24', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                            {company.status}
                                        </span>
                                        {isExpired && (
                                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', WebkitTextFillColor: '#f87171', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                                Application Closed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 style={{ margin: '12px 0 4px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{company.name}</h3>
                                {company.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>{company.description}</p>}
                            </div>

                            {/* Details row */}
                            <div style={{ padding: '0 20px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                                {[
                                    { icon: <Briefcase size={14}/>,    text: company.role },
                                    { icon: <IndianRupee size={14}/>,  text: company.salary },
                                    { icon: <Calendar size={14}/>,     text: `Drive: ${new Date(company.driveDate || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}` },
                                    { icon: <Clock size={14}/>,        text: `Deadline: ${new Date(company.applicationDeadline || Date.now()).toLocaleTimeString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}`, color: isExpired ? '#f87171' : '#fbbf24' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: item.color || 'var(--text-muted)', WebkitTextFillColor: item.color || 'var(--text-muted)' }}>
                                        <span style={{ color: item.color || '#818cf8' }}>{item.icon}</span>
                                        {item.text}
                                    </div>
                                ))}
                                {/* Interview Rounds preview */}
                                {company.rounds && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                        {company.rounds.split(',').map((r, i, arr) => (
                                            <React.Fragment key={r.trim()}>
                                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', WebkitTextFillColor: '#a5b4fc', fontWeight: 600 }}>
                                                    {r.trim()}
                                                </span>
                                                {i < arr.length - 1 && <ChevronRight size={10} style={{ color: 'var(--text-muted)' }}/>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                                {/* Admin quick stats */}
                                {!isStudent && (
                                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 13 }}>
                                        <span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}><Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }}/> {applicantList.length} applied</span>
                                        <span style={{ color: '#34d399', WebkitTextFillColor: '#34d399' }}>🎉 {selected} selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Job Description toggle */}
                            {company.jobDescription && (
                                <div style={{ padding: '0 20px 12px' }}>
                                    <button onClick={() => setExpandedJob(jobExpanded ? null : company.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#818cf8', WebkitTextFillColor: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                                        <FileText size={13}/> {jobExpanded ? 'Hide' : 'View'} Job Description
                                        {jobExpanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                                    </button>
                                    {jobExpanded && (
                                        <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                                            {company.jobDescription}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Student: My Round Status ── */}
                            {isStudent && myApp && (
                                <div style={{ padding: '10px 20px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginBottom: 8 }}>Your Progress</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {myApp.rounds.map((r, idx) => {
                                            const rc = roundStatusColor(r.status);
                                            const isLatest = idx === myApp.rounds.length - 1;
                                            const isNextRound = r.status === 'Pending' && idx > 0 && myApp.rounds[idx-1]?.status === 'Cleared';
                                            return (
                                                <div key={idx}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {r.status === 'Cleared' ? <CheckCircle size={13} style={{ color: '#34d399' }} />
                                                         : r.status === 'Rejected' ? <XCircle size={13} style={{ color: '#f87171' }} />
                                                         : <Clock size={13} style={{ color: '#fbbf24' }} />}
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{r.name}</span>
                                                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: rc.bg, color: rc.color, WebkitTextFillColor: rc.color }}>{r.status}</span>
                                                    </div>
                                                    {/* "Selected to next round" banner */}
                                                    {isNextRound && (
                                                        <div style={{ marginTop: 4, marginLeft: 21, padding: '5px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, color: '#a5b4fc', WebkitTextFillColor: '#a5b4fc', fontWeight: 600 }}>
                                                            🎯 You are selected to the {r.name} round!
                                                        </div>
                                                    )}
                                                    {r.status === 'Cleared' && isLatest && myApp.finalStatus === 'Selected' && (
                                                        <div style={{ marginTop: 4, marginLeft: 21, padding: '5px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 11, color: '#34d399', WebkitTextFillColor: '#34d399', fontWeight: 700 }}>
                                                            🎉 Congratulations! You are SELECTED!
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ padding: '12px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                                {isStudent ? (
                                    <button onClick={() => handleApply(company.id)} disabled={applied || isExpired}
                                        className={(applied || isExpired) ? '' : 'btn btn-primary'}
                                        style={(applied || isExpired) ? { 
                                            width: '100%', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', 
                                            cursor: 'default', 
                                            background: applied ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', 
                                            color: applied ? '#34d399' : '#f87171', 
                                            WebkitTextFillColor: applied ? '#34d399' : '#f87171' 
                                        } : { width: '100%' }}>
                                        {applied ? '✓ Applied' : isExpired ? 'Deadline Passed' : 'Apply Now'}
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => setPipeline(company)} className="btn btn-primary" style={{ flex: 1 }}>
                                            <TrendingUp size={13}/> Manage Pipeline
                                        </button>
                                        <button onClick={() => handleDelete(company.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}>
                                            <Trash2 size={13}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {companies.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
                        No companies added yet.
                    </div>
                )}
            </div>

            {/* Pipeline Modal */}
            {pipelineCompany && (
                <PipelinePanel
                    company={pipelineCompany}
                    applications={applications}
                    students={students}
                    setApplications={setApplications}
                    onClose={() => setPipeline(null)}
                />
            )}
        </div>
    );
};

export default Companies;
