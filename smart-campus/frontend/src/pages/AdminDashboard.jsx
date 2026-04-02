import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Users, Briefcase, BarChart2, CheckCircle, Search, SlidersHorizontal, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = () => {
    const { students, companies, applications, tests } = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [sectionFilter, setSectionFilter] = useState('All');

    const formatStudentAnalytics = () => {
        let selected = 0, rejected = 0, pending = 0;
        applications.forEach(a => {
            if (a.finalStatus === 'Selected') selected++;
            else if (a.finalStatus === 'Rejected') rejected++;
            else pending++;
        });
        return { selected, rejected, pending };
    };

    const stats = formatStudentAnalytics();

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSection = sectionFilter === 'All' ? true : s.section === sectionFilter;
        return matchesSearch && matchesSection;
    });

    const sectionData = [
        { name: 'Section A', count: students.filter(s => s.section === 'A').length },
        { name: 'Section B', count: students.filter(s => s.section === 'B').length }
    ];

    const cgpaRanges = [
        { name: '< 6',  count: students.filter(s => s.cgpa && parseFloat(s.cgpa) < 6).length },
        { name: '6 – 7', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 6 && parseFloat(s.cgpa) < 7).length },
        { name: '7 – 8', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 7 && parseFloat(s.cgpa) < 8).length },
        { name: '8 – 9', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 8 && parseFloat(s.cgpa) < 9).length },
        { name: '≥ 9',   count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 9).length }
    ];

    const pipelineData = [
        { name: 'Selected', value: stats.selected },
        { name: 'Pending',  value: stats.pending  },
        { name: 'Rejected', value: stats.rejected  }
    ];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    const downloadStudentProfile = (student) => {
        const win = window.open('', '_blank');
        const html = `
            <html>
                <head>
                    <title>${student.name} – Profile</title>
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
                        .page { max-width: 800px; margin: auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                        .header { display: flex; align-items: center; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 28px; }
                        .avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; flex-shrink: 0; }
                        h1 { font-size: 24px; color: #0f172a; }
                        .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
                        .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 6px; }
                        h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px; font-weight: 700; }
                        .section { margin-bottom: 28px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                        .info-item { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600; }
                        .value { font-size: 14px; color: #1e293b; word-break: break-all; }
                        .full { grid-column: span 2; }
                        .link a { color: #6366f1; text-decoration: none; font-size: 14px; }
                        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
                        .skill { background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
                        @media print { body { background: white; } .page { box-shadow: none; padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <div class="header">
                            <div class="avatar">${(student.name || 'S').charAt(0)}</div>
                            <div>
                                <h1>${student.name}</h1>
                                <p class="subtitle">${student.dept || 'MCA'} — Section ${student.section || '-'}</p>
                                <span class="badge">CGPA: ${student.cgpa || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="section">
                            <h3>Contact Information</h3>
                            <div class="grid">
                                <div class="info-item"><div class="label">Roll Number</div><div class="value">${student.id || 'N/A'}</div></div>
                                <div class="info-item"><div class="label">Phone</div><div class="value">${student.phone || 'N/A'}</div></div>
                                <div class="info-item full"><div class="label">Email</div><div class="value">${student.email || 'N/A'}</div></div>
                                <div class="info-item full"><div class="label">Address</div><div class="value">${student.address || 'N/A'}</div></div>
                            </div>
                        </div>
                        <div class="section">
                            <h3>Professional Links</h3>
                            <div class="grid">
                                <div class="info-item link"><div class="label">GitHub</div><div class="value"><a href="${student.github || '#'}">${student.github || 'N/A'}</a></div></div>
                                <div class="info-item link"><div class="label">LinkedIn</div><div class="value"><a href="${student.linkedin || '#'}">${student.linkedin || 'N/A'}</a></div></div>
                                <div class="info-item link full"><div class="label">LeetCode</div><div class="value"><a href="${student.leetcode || '#'}">${student.leetcode || 'N/A'}</a></div></div>
                            </div>
                        </div>
                        <div class="section">
                            <h3>Skills</h3>
                            <div class="skills">
                                ${student.skills && student.skills.length > 0
                                    ? student.skills.map(s => `<span class="skill">${s}</span>`).join('')
                                    : '<p style="color:#94a3b8;font-size:14px">No skills listed.</p>'}
                            </div>
                        </div>
                    </div>
                    <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                </body>
            </html>`;
        win.document.open();
        win.document.write(html);
        win.document.close();
    };

    const tooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px' };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Admin Control Center</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Real-time Analytics &amp; Placement Insights</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                    { icon: <Users size={20} />, value: students.length, label: 'Total Students', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                    { icon: <Briefcase size={20} />, value: companies.length, label: 'Companies', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
                    { icon: <BarChart2 size={20} />, value: tests.length, label: 'Mock Tests', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                    { icon: <CheckCircle size={20} />, value: stats.selected, label: 'Offers Given', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                ].map((card, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>{card.value}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', height: '280px' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Section Distribution</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={sectionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', height: '280px' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>CGPA Distribution</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={cgpaRanges} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', height: '280px' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Application Pipeline</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie data={pipelineData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4}>
                                {pipelineData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Student Directory */}
            <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>Student Directory</p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{filteredStudents.length} of {students.length} students</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px', minWidth: '240px' }}>
                            <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                placeholder="Search name, email or roll no…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }}
                            />
                        </div>
                        {/* Section Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px' }}>
                            <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <select
                                value={sectionFilter}
                                onChange={e => setSectionFilter(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <option value="All" style={{ background: '#0f172a' }}>All Sections</option>
                                <option value="A" style={{ background: '#0f172a' }}>Section A</option>
                                <option value="B" style={{ background: '#0f172a' }}>Section B</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '110px' }} />
                            <col style={{ width: '200px' }} />
                            <col style={{ width: '90px' }} />
                            <col style={{ width: '75px' }} />
                            <col />
                            <col style={{ width: '80px' }} />
                        </colgroup>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {['Roll No', 'Name', 'Section', 'CGPA', 'Email', 'Actions'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '12px 16px',
                                        textAlign: i === 5 ? 'center' : 'left',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        whiteSpace: 'nowrap'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((stu, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{stu.id}</td>
                                    <td style={{ padding: '13px 16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.name}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ background: stu.section === 'A' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)', color: stu.section === 'A' ? '#818cf8' : '#34d399', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
                                            {stu.section || '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: 600, color: parseFloat(stu.cgpa) >= 8 ? '#34d399' : parseFloat(stu.cgpa) >= 7 ? '#fbbf24' : 'var(--text-primary)' }}>
                                        {stu.cgpa || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.email}</td>
                                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => downloadStudentProfile(stu)}
                                            title="Download Profile"
                                            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, transition: 'all 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.3)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                                        >
                                            <Download size={13} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        No students match your search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
