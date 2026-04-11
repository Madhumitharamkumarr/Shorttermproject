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
    if (status === 'Cleared' || status === 'Selected') return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
    if (status === 'Rejected') return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
    return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '32px 16px' }}>
            <div style={{ width: '100%', maxWidth: 780, borderRadius: 16, padding: 0, overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18, color: '#0F172A', fontWeight: 800 }}>{company.name} — Interview Pipeline</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>
                            {company.role} · {apps.length} applicant{apps.length !== 1 ? 's' : ''} · {selected} selected
                        </p>
                    </div>
                    <button onClick={onClose} className="btn btn-glass" style={{ padding: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#64748B' }}><X size={18}/></button>
                </div>

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Summary funnel */}
                    {roundStats.length > 0 && (
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BarChart2 size={13}/> Round-wise Funnel
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {/* Applied pill */}
                                <div style={{ padding: '12px 18px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', textAlign: 'center', minWidth: 110 }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8' }}>{apps.length}</div>
                                    <div style={{ fontSize: 12, color: '#2563EB', marginTop: 2, fontWeight: 600 }}>Applied</div>
                                </div>
                                {roundStats.map((rs, i) => (
                                    <React.Fragment key={rs.round}>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}><ChevronRight size={18}/></div>
                                        <div style={{ padding: '12px 18px', borderRadius: 12, background: '#F8FAFF', border: '1px solid #E2E8F0', textAlign: 'center', minWidth: 110 }}>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{rs.cleared}</div>
                                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 600 }}>{rs.round} Cleared</div>
                                            <div style={{ fontSize: 11, display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6, fontWeight: 600 }}>
                                                <span style={{ color: '#DC2626' }}>✗ {rs.rejected}</span>
                                                <span style={{ color: '#D97706' }}>⏳ {rs.pending}</span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                {selected > 0 && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}><ChevronRight size={18}/></div>
                                        <div style={{ padding: '12px 18px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', textAlign: 'center', minWidth: 110 }}>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{selected}</div>
                                            <div style={{ fontSize: 12, color: '#065F46', marginTop: 2, fontWeight: 700 }}>🎉 Selected</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Student list */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={13}/> Manage Applicants
                        </div>
                        {apps.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', background: '#F8FAFF', borderRadius: 12, border: '1px solid #EEF2FF' }}>
                                <p style={{ color: '#64748B', fontSize: 14, margin: 0, fontWeight: 500 }}>No students have applied yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {apps.map(app => {
                                    const s = students.find(st => st.id === app.studentId);
                                    const sc = roundStatusColor(app.finalStatus);
                                    const isExpanded = expandedApp === app.id;
                                    return (
                                        <div key={app.id} style={{ borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', background: '#FFFFFF', boxShadow: isExpanded ? '0 4px 12px rgba(37,99,235,0.06)' : 'none', transition: 'box-shadow 0.2s' }}>
                                            {/* Row */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', flexWrap: 'wrap', gap: 8, background: isExpanded ? '#F8FAFF' : 'transparent' }}
                                                onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                                                <div style={{ flex: 1, minWidth: 160 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                                                        {s?.name || app.studentId}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                                                        {s?.id} · Sec {s?.section} · CGPA {s?.cgpa || '—'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                                                        {app.finalStatus}
                                                    </span>
                                                    {isExpanded ? <ChevronDown size={16} color="#94A3B8"/> : <ChevronRight size={16} color="#94A3B8"/>}
                                                </div>
                                            </div>

                                            {/* Expanded: round management */}
                                            {isExpanded && (
                                                <div style={{ padding: '16px', borderTop: '1px solid #E2E8F0', background: '#FAFAFB' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        {app.rounds.map((r, idx) => {
                                                            const rc = roundStatusColor(r.status);
                                                            return (
                                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 14px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                        {r.status === 'Cleared' ? <CheckCircle size={16} style={{ color: '#059669' }}/> :
                                                                         r.status === 'Rejected' ? <XCircle size={16} style={{ color: '#DC2626' }}/> :
                                                                         <Clock size={16} style={{ color: '#D97706' }}/>}
                                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{r.name}</span>
                                                                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontWeight: 600 }}>{r.status}</span>
                                                                    </div>
                                                                    {r.status === 'Pending' && (
                                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                                            <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12 }}
                                                                                onClick={() => updateRound(app.id, r.name, 'Cleared')}>
                                                                                ✓ Clear
                                                                            </button>
                                                                            <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}
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
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>Visiting Companies</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>{companies.length} companies driving this season</p>
                </div>
                {!isStudent && (
                    <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn btn-glass' : 'btn btn-primary'}>
                        {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Add Company</>}
                    </button>
                )}
            </div>

            {/* Add Company Form */}
            {showForm && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(37,99,235,0.06)' }}>
                    <p style={{ margin: '0 0 20px', fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>Add New Company</p>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            {[['Company Name','name','e.g. Infosys'],['Role / Position','role','e.g. System Engineer'],
                              ['Eligibility %','eligibility','e.g. 60%'],['Salary Package','salary','e.g. 3.6 LPA']].map(([label,field,ph]) => (
                                <div key={field} className="form-group">
                                    <label style={{ color: '#475569' }}>{label}</label>
                                    <input className="form-input" placeholder={ph} value={formData[field]}
                                        onChange={e => setFormData({...formData, [field]: e.target.value})} required style={{ background: '#FFFFFF' }} />
                                </div>
                            ))}
                            <div className="form-group">
                                <label style={{ color: '#475569' }}>Drive Date</label>
                                <input type="date" className="form-input" value={formData.driveDate?.substring(0,10) || ''}
                                    onChange={e => setFormData({...formData, driveDate: e.target.value})} style={{ background: '#FFFFFF' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#475569' }}>Interview Rounds (comma separated)</label>
                                <input className="form-input" placeholder="Aptitude,Technical,HR" value={formData.rounds}
                                    onChange={e => setFormData({...formData, rounds: e.target.value})} style={{ background: '#FFFFFF' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#475569' }}>Application Deadline</label>
                                <input type="datetime-local" className="form-input" value={formData.applicationDeadline}
                                    onChange={e => setFormData({...formData, applicationDeadline: e.target.value})} style={{ background: '#FFFFFF' }} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label style={{ color: '#475569' }}>Short Description</label>
                            <textarea className="form-input" rows="2" placeholder="Brief tagline about the drive…"
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{ resize: 'none', background: '#FFFFFF' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label style={{ color: '#475569' }}>Full Job Description</label>
                            <textarea className="form-input" rows="4" placeholder="Roles & responsibilities, requirements, perks…"
                                value={formData.jobDescription} onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                                style={{ resize: 'vertical', background: '#FFFFFF' }} />
                        </div>
                        <button type="submit" className="btn btn-success" style={{ padding: '10px 24px' }}>Add Company</button>
                    </form>
                </div>
            )}

            {/* Company Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {companies.map(company => {
                    const applicantList = applications.filter(a => a.companyId === company.id);
                    const applied = hasApplied(company.id);
                    const myApp   = applications.find(a => a.companyId === company.id && a.studentId === user._id);
                    const selected = applicantList.filter(a => a.finalStatus === 'Selected').length;
                    const jobExpanded = expandedJob === company.id;
                    const isExpired = new Date() > new Date(company.applicationDeadline || '9999-12-31');

                    return (
                        <div key={company.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(37,99,235,0.05)', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>

                            {/* Card Header */}
                            <div style={{ padding: '24px 24px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, border: '1px solid #BFDBFE' }}>
                                        {company.name.charAt(0)}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                        <span style={{ background: company.status === 'Active' ? '#ECFDF5' : '#FFFBEB', color: company.status === 'Active' ? '#059669' : '#D97706', border: `1px solid ${company.status === 'Active' ? '#A7F3D0' : '#FDE68A'}`, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                            {company.status}
                                        </span>
                                        {isExpired && (
                                            <span style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 style={{ margin: '14px 0 6px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{company.name}</h3>
                                {company.description && <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>{company.description}</p>}
                            </div>

                            {/* Details row */}
                            <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { icon: <Briefcase size={15}/>,    text: company.role },
                                    { icon: <IndianRupee size={15}/>,  text: company.salary },
                                    { icon: <Calendar size={15}/>,     text: `Drive: ${new Date(company.driveDate || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}` },
                                    { icon: <Clock size={15}/>,        text: `Deadline: ${new Date(company.applicationDeadline || Date.now()).toLocaleTimeString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}`, color: isExpired ? '#DC2626' : '#D97706' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: item.color || '#475569', fontWeight: 500 }}>
                                        <span style={{ color: item.color || '#2563EB' }}>{item.icon}</span>
                                        {item.text}
                                    </div>
                                ))}
                                {/* Interview Rounds preview */}
                                {company.rounds && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                                        {company.rounds.split(',').map((r, i, arr) => (
                                            <React.Fragment key={r.trim()}>
                                                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, border: '1px solid #BFDBFE' }}>
                                                    {r.trim()}
                                                </span>
                                                {i < arr.length - 1 && <ChevronRight size={12} style={{ color: '#94A3B8' }}/>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                                {/* Admin quick stats */}
                                {!isStudent && (
                                    <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13, background: '#F8FAFF', padding: '10px', borderRadius: 8, border: '1px solid #EEF2FF' }}>
                                        <span style={{ color: '#1D4ED8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14}/> {applicantList.length} applied</span>
                                        <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14}/> {selected} selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Job Description toggle */}
                            {company.jobDescription && (
                                <div style={{ padding: '0 24px 16px' }}>
                                    <button onClick={() => setExpandedJob(jobExpanded ? null : company.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
                                        <FileText size={14}/> {jobExpanded ? 'Hide' : 'View'} Job Description
                                        {jobExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                    </button>
                                    {jobExpanded && (
                                        <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 10, background: '#F8FAFF', border: '1px solid #E2E8F0', fontSize: 14, lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-wrap' }}>
                                            {company.jobDescription}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Student: My Round Status ── */}
                            {isStudent && myApp && (
                                <div style={{ padding: '14px 24px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFF' }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', marginBottom: 12 }}>Your Progress</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {myApp.rounds.map((r, idx) => {
                                            const rc = roundStatusColor(r.status);
                                            const isLatest = idx === myApp.rounds.length - 1;
                                            const isNextRound = r.status === 'Pending' && idx > 0 && myApp.rounds[idx-1]?.status === 'Cleared';
                                            return (
                                                <div key={idx}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        {r.status === 'Cleared' ? <CheckCircle size={15} style={{ color: '#059669' }} />
                                                         : r.status === 'Rejected' ? <XCircle size={15} style={{ color: '#DC2626' }} />
                                                         : <Clock size={15} style={{ color: '#D97706' }} />}
                                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{r.name}</span>
                                                        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontWeight: 600 }}>{r.status}</span>
                                                    </div>
                                                    {/* "Selected to next round" banner */}
                                                    {isNextRound && (
                                                        <div style={{ marginTop: 6, marginLeft: 25, padding: '8px 12px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 12, color: '#1D4ED8', fontWeight: 600 }}>
                                                            🎯 You are selected to the {r.name} round!
                                                        </div>
                                                    )}
                                                    {r.status === 'Cleared' && isLatest && myApp.finalStatus === 'Selected' && (
                                                        <div style={{ marginTop: 6, marginLeft: 25, padding: '8px 12px', borderRadius: 8, background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: 13, color: '#065F46', fontWeight: 800 }}>
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
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', marginTop: 'auto', background: '#FAFAFB' }}>
                                {isStudent ? (
                                    <button onClick={() => handleApply(company.id)} disabled={applied || isExpired}
                                        className={(applied || isExpired) ? '' : 'btn btn-primary'}
                                        style={(applied || isExpired) ? { 
                                            width: '100%', padding: '12px', border: applied ? '1px solid #A7F3D0' : '1px solid #FECACA', borderRadius: '10px', fontWeight: 700, fontSize: '14px', 
                                            cursor: 'default', 
                                            background: applied ? '#ECFDF5' : '#FEF2F2', 
                                            color: applied ? '#065F46' : '#B91C1C' 
                                        } : { width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px' }}>
                                        {applied ? '✓ Applied Successfully' : isExpired ? 'Application Closed' : 'Apply Now'}
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button onClick={() => setPipeline(company)} className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '10px' }}>
                                            <TrendingUp size={15}/> Manage Pipeline
                                        </button>
                                        <button onClick={() => handleDelete(company.id)} className="btn btn-danger" style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                            <Trash2 size={15}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {companies.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', color: '#64748B', fontSize: '15px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
                        <p style={{ fontWeight: 600, margin: 0 }}>No companies added yet.</p>
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
