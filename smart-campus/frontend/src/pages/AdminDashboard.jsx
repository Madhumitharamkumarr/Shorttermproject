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
        { name: '6–7', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 6 && parseFloat(s.cgpa) < 7).length },
        { name: '7–8', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 7 && parseFloat(s.cgpa) < 8).length },
        { name: '8–9', count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 8 && parseFloat(s.cgpa) < 9).length },
        { name: '≥ 9',   count: students.filter(s => s.cgpa && parseFloat(s.cgpa) >= 9).length }
    ];

    const pipelineData = [
        { name: 'Selected', value: stats.selected },
        { name: 'Pending',  value: stats.pending  },
        { name: 'Rejected', value: stats.rejected  }
    ];
    const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

    const tooltipStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        color: '#0F172A',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
    };

    const downloadStudentProfile = (student) => {
        const win = window.open('', '_blank');
        const html = `
            <html>
                <head>
                    <title>${student.name} – Profile</title>
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { font-family: 'Segoe UI', sans-serif; background: #F0F4FF; color: #1e293b; padding: 40px; }
                        .page { max-width: 800px; margin: auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(37,99,235,0.12); }
                        .header { display: flex; align-items: center; gap: 20px; padding-bottom: 24px; border-bottom: 2px solid #DBEAFE; margin-bottom: 28px; }
                        .avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg,#2563EB,#60A5FA); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; flex-shrink: 0; }
                        h1 { font-size: 24px; color: #0f172a; }
                        .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
                        .badge { display: inline-block; background: #EFF6FF; color: #1D4ED8; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 6px; border: 1px solid #BFDBFE; }
                        h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #2563EB; margin-bottom: 12px; font-weight: 700; }
                        .section { margin-bottom: 28px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                        .info-item { background: #F8FAFF; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0; }
                        .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600; }
                        .value { font-size: 14px; color: #1e293b; word-break: break-all; }
                        .full { grid-column: span 2; }
                        .link a { color: #2563EB; text-decoration: none; font-size: 14px; }
                        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
                        .skill { background: #EFF6FF; color: #1D4ED8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #BFDBFE; }
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

    const statCards = [
        { icon: <Users size={22} />, value: students.length, label: 'Total Students', color: '#2563EB', bg: '#EFF6FF' },
        { icon: <Briefcase size={22} />, value: companies.length, label: 'Companies', color: '#0EA5E9', bg: '#F0F9FF' },
        { icon: <BarChart2 size={22} />, value: tests.length, label: 'Mock Tests', color: '#F59E0B', bg: '#FFFBEB' },
        { icon: <CheckCircle size={22} />, value: stats.selected, label: 'Offers Given', color: '#10B981', bg: '#ECFDF5' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Admin Control Center</h2>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>Real-time Analytics &amp; Placement Insights</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14,
                        padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(37,99,235,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(37,99,235,0.06)'; }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {card.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1, color: card.color }}>{card.value}</div>
                            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: 500 }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px', height: '280px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>📊 Section Distribution</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={sectionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip cursor={{ fill: 'rgba(37,99,235,0.04)' }} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px', height: '280px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>📈 CGPA Distribution</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={cgpaRanges} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis stroke="#94A3B8" tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip cursor={{ fill: 'rgba(37,99,235,0.04)' }} contentStyle={tooltipStyle} />
                            <Bar dataKey="count" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px', height: '280px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>🎯 Application Pipeline</p>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie data={pipelineData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4}>
                                {pipelineData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px', color: '#64748B' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Student Directory */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Table Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #EEF2FF', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>🎓 Student Directory</p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>{filteredStudents.length} of {students.length} students</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '8px 14px', minWidth: '240px' }}>
                            <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            <input
                                placeholder="Search name, email or roll no…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0F172A', fontSize: '13px', width: '100%' }}
                            />
                        </div>
                        {/* Section Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '8px 14px' }}>
                            <SlidersHorizontal size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            <select
                                value={sectionFilter}
                                onChange={e => setSectionFilter(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0F172A', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <option value="All">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
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
                            <col style={{ width: '90px' }} />
                        </colgroup>
                        <thead>
                            <tr style={{ background: '#F1F5FE' }}>
                                {['Roll No', 'Name', 'Section', 'CGPA', 'Email', 'Actions'].map((h, i) => (
                                    <th key={i} style={{
                                        padding: '12px 16px',
                                        textAlign: i === 5 ? 'center' : 'left',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#64748B',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px',
                                        borderBottom: '1px solid #E2E8F0',
                                        whiteSpace: 'nowrap'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((stu, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #EEF2FF', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748B', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{stu.id}</td>
                                    <td style={{ padding: '13px 16px', fontWeight: 600, fontSize: '14px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.name}</td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{
                                            background: stu.section === 'A' ? '#EFF6FF' : '#ECFDF5',
                                            color: stu.section === 'A' ? '#1D4ED8' : '#065F46',
                                            border: `1px solid ${stu.section === 'A' ? '#BFDBFE' : '#A7F3D0'}`,
                                            fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px'
                                        }}>
                                            {stu.section || '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: 700, color: parseFloat(stu.cgpa) >= 8 ? '#059669' : parseFloat(stu.cgpa) >= 7 ? '#D97706' : '#0F172A' }}>
                                        {stu.cgpa || '—'}
                                    </td>
                                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stu.email}</td>
                                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => downloadStudentProfile(stu)}
                                            title="Download Profile"
                                            style={{
                                                background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8',
                                                borderRadius: '8px', padding: '7px 10px', cursor: 'pointer',
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                fontSize: '12px', fontWeight: 600, transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                                        >
                                            <Download size={13} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
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
