import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { extractTextFromPDF, parseQuestionsFromText } from '../utils/pdfExtractor';
import { Upload, Plus, Trash2, Save, BookOpen, List, FileText, CheckCircle, Clipboard, Users, ChevronDown, ChevronUp } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const MockTestManager = () => {
    const { mockTests, setMockTests, companies, pushNotification, testResults, students } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState('upload'); // upload | paste | manual | manage
    const [expandedTest, setExpandedTest] = useState(null);

    const getTestStats = (testId) => {
        const attempts = testResults.filter(r => r.testId === testId);
        const unique = new Set(attempts.map(a => a.studentId));
        return { total: attempts.length, unique: unique.size };
    };

    // ── Paste Text state ──────────────────────────────────────────────────────
    const [pasteCompany, setPasteCompany] = useState('');
    const [pasteTitle, setPasteTitle]     = useState('');
    const [pasteText, setPasteText]       = useState('');
    const [pasteError, setPasteError]     = useState('');
    const [pasting, setPasting]           = useState(false);

    // ── Upload PDF state ──────────────────────────────────────────────────────
    const [uploadCompany, setUploadCompany]   = useState('');
    const [uploadTitle, setUploadTitle]       = useState('');
    const [extracting, setExtracting]         = useState(false);
    const [extracted, setExtracted]           = useState([]);
    const [uploadError, setUploadError]       = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setExtracting(true);
        setUploadError('');
        setExtracted([]);
        try {
            const text = await extractTextFromPDF(file);
            const questions = parseQuestionsFromText(text);
            if (questions.length === 0) {
                setUploadError('No MCQ questions detected. Make sure the PDF is text-based (not scanned).');
            } else {
                setExtracted(questions);
            }
        } catch (err) {
            setUploadError('Failed to read PDF: ' + err.message);
        }
        setExtracting(false);
    };

    const updateExtracted = (idx, field, val) => {
        setExtracted(extracted.map((q, i) => i === idx ? { ...q, [field]: val } : q));
    };

    const updateOption = (qIdx, optIdx, val) => {
        setExtracted(extracted.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...q.options];
            opts[optIdx] = val;
            return { ...q, options: opts };
        }));
    };

    const deleteExtracted = (idx) => setExtracted(extracted.filter((_, i) => i !== idx));

    const saveUploadedQuiz = () => {
        if (!uploadCompany || !uploadTitle || extracted.length === 0) return;
        setMockTests([...mockTests, {
            id: Date.now(),
            companyName: uploadCompany,
            title: uploadTitle,
            type: 'mcq',
            questions: extracted,
            createdAt: new Date().toISOString(),
        }]);

        // Push notification to ALL students
        pushNotification(
            `New Mock Test Available: ${uploadTitle}`,
            `A new ${uploadCompany} practice test has been added. Start preparing now!`,
            'Info'
        );

        setExtracted([]);
        setUploadCompany('');
        setUploadTitle('');
        setActiveTab('manage');
    };

    const handlePasteSubmit = async () => {
        if (!pasteCompany || !pasteTitle || !pasteText) {
            setPasteError('Please fill out Company, Title, and paste your MCQ text.');
            return;
        }
        setPasting(true);
        setPasteError('');
        try {
            const res = await fetch('/api/quiz/paste', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: pasteTitle,
                    companyName: pasteCompany,
                    text: pasteText
                })
            });
            
            const responseText = await res.text();
            
            if (!responseText) {
                setPasteError(`Backend server did not respond. Is the NodeJS server running on port 5000?`);
                setPasting(false);
                return;
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                // Not JSON, probably Vite proxy throwing a 504/502 HTML or empty text
                setPasteError(`Failed to connect to backend API: Make sure your backend node server is running (Status ${res.status}).`);
                setPasting(false);
                return;
            }

            if (!res.ok) {
                setPasteError(data.message || 'Failed to parse text.');
                setPasting(false);
                return;
            }

            // Sync successfully parsed output with local DataContext for immediate display
            setMockTests([...mockTests, {
                id: Date.now(),
                companyName: pasteCompany,
                title: pasteTitle,
                type: 'mcq',
                questions: data.rawParsed.map(q => ({
                    id: Math.random().toString(36).substr(2, 9),
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    difficulty: 'Medium',
                    type: 'mcq'
                })),
                createdAt: new Date().toISOString(),
            }]);

            pushNotification(
                `New Mock Test Available: ${pasteTitle}`,
                `A new ${pasteCompany} quiz has been added via raw text.`,
                'Info'
            );

            setPasteCompany('');
            setPasteTitle('');
            setPasteText('');
            setActiveTab('manage');
        } catch (err) {
            setPasteError('Failed to connect to backend API: ' + err.message);
        }
        setPasting(false);
    };

    // ── Manual create state ───────────────────────────────────────────────────
    const [manualCompany, setManualCompany]   = useState('');
    const [manualTitle, setManualTitle]       = useState('');
    const [manualType, setManualType]         = useState('mcq');
    const [manualQs, setManualQs]             = useState([
        { id: Date.now(), question: '', options: ['', '', '', ''], answer: 'A', difficulty: 'Medium', type: 'mcq',
          problemStatement: '', boilerplate: '' }
    ]);

    const addManualQ = () => setManualQs([...manualQs, {
        id: Date.now(), question: '', options: ['', '', '', ''], answer: 'A', difficulty: 'Medium', type: manualType,
        problemStatement: '', boilerplate: ''
    }]);

    const updateManualQ = (idx, field, val) =>
        setManualQs(manualQs.map((q, i) => i === idx ? { ...q, [field]: val } : q));

    const updateManualOpt = (qIdx, optIdx, val) =>
        setManualQs(manualQs.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...q.options]; opts[optIdx] = val;
            return { ...q, options: opts };
        }));

    const saveManualQuiz = () => {
        if (!manualCompany || !manualTitle) return;
        setMockTests([...mockTests, {
            id: Date.now(),
            companyName: manualCompany,
            title: manualTitle,
            type: manualType,
            questions: manualQs,
            createdAt: new Date().toISOString(),
        }]);

        // Push notification to ALL students
        pushNotification(
            `New Mock Test Available: ${manualTitle}`,
            `A new ${manualCompany} ${manualType.toUpperCase()} test has been added to the preparation section.`,
            'Info'
        );

        setManualQs([{ id: Date.now(), question: '', options: ['', '', '', ''], answer: 'A', difficulty: 'Medium', type: manualType, problemStatement: '', boilerplate: '' }]);
        setManualCompany(''); setManualTitle('');
        setActiveTab('manage');
    };

    const deleteTest = (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        setMockTests(mockTests.filter(t => t.id !== id));
    };

    const tabs = [
        { key: 'upload', icon: <Upload size={15}/>,   label: 'Upload PDF' },
        { key: 'paste',  icon: <Clipboard size={15}/>,label: 'Paste Text' },
        { key: 'manual', icon: <Plus size={15}/>,     label: 'Create Manually' },
        { key: 'manage', icon: <List size={15}/>,     label: `Manage (${mockTests.length})` },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h2 style={{ marginBottom: 4, color: '#0F172A', fontWeight: 800 }}>Mock Test Manager</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Upload company PDFs or create quizzes manually for students to practice.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 10 }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={activeTab === t.key ? 'btn btn-primary' : 'btn btn-glass'}
                        style={activeTab === t.key ? { padding: '10px 18px', borderRadius: '10px', display: 'flex', gap: 8, alignItems: 'center' } : { padding: '10px 18px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── UPLOAD PDF TAB ─────────────────────────────────────────── */}
            {activeTab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
                        <h3 style={{ marginBottom: 16, fontSize: 16, color: '#0F172A', fontWeight: 800 }}>Step 1 — Select Company &amp; Upload PDF</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div className="form-group">
                                <label style={{ color: '#475569' }}>Company Name</label>
                                <input className="form-input" placeholder="e.g. Infosys"
                                    value={uploadCompany} onChange={e => setUploadCompany(e.target.value)} style={{ background: '#F8FAFF' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#475569' }}>Quiz Title</label>
                                <input className="form-input" placeholder="e.g. Infosys Aptitude 2024"
                                    value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} style={{ background: '#F8FAFF' }} />
                            </div>
                        </div>

                        {/* File drop zone */}
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #93C5FD', borderRadius: 12, padding: '36px 20px',
                            cursor: 'pointer', background: '#EFF6FF',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                        onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}>
                            <FileText size={40} style={{ color: '#2563EB', marginBottom: 12 }} />
                            <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: 15 }}>
                                {extracting ? 'Extracting questions…' : 'Click to upload PDF'}
                            </span>
                            <span style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                                Text-based PDFs work best. Scanned PDFs may not extract correctly.
                            </span>
                            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>

                        {uploadError && (
                            <div style={{ marginTop: 16, padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, fontSize: 14 }}>{uploadError}</div>
                        )}
                    </div>

                    {/* Extracted questions review */}
                    {extracted.length > 0 && (
                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#0F172A', fontWeight: 800 }}>
                                    Step 2 — Review Extracted Questions ({extracted.length} found)
                                </h3>
                                <button className="btn btn-success" onClick={saveUploadedQuiz}
                                    disabled={!uploadCompany || !uploadTitle} style={{ padding: '8px 16px', borderRadius: 8 }}>
                                    <Save size={15}/> Save Quiz
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
                                {extracted.map((q, qi) => (
                                    <div key={q.id} style={{ padding: 16, background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: 14, color: '#2563EB', fontWeight: 800 }}>Question {qi + 1}</span>
                                            <button onClick={() => deleteExtracted(qi)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}>
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                        <input className="form-input" value={q.question}
                                            onChange={e => updateExtracted(qi, 'question', e.target.value)}
                                            style={{ marginBottom: 12, background: '#FFFFFF' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                            {['A','B','C','D'].map((k, oi) => (
                                                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 14, color: '#2563EB', flexShrink: 0, fontWeight: 800, minWidth: 20 }}>{k}.</span>
                                                    <input className="form-input" value={q.options[oi] || ''}
                                                        onChange={e => updateOption(qi, oi, e.target.value)} style={{ background: '#FFFFFF' }} />
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: '#EFF6FF', padding: 12, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                                            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <label style={{ fontSize: 13, margin: 0, color: '#475569', fontWeight: 700 }}>Answer:</label>
                                                <select className="form-input" style={{ width: 80, background: '#FFFFFF' }} value={q.answer}
                                                    onChange={e => updateExtracted(qi, 'answer', e.target.value)}>
                                                    {['A','B','C','D'].map(k => <option key={k}>{k}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <label style={{ fontSize: 13, margin: 0, color: '#475569', fontWeight: 700 }}>Difficulty:</label>
                                                <select className="form-input" style={{ width: 120, background: '#FFFFFF' }} value={q.difficulty}
                                                    onChange={e => updateExtracted(qi, 'difficulty', e.target.value)}>
                                                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── PASTE TEXT TAB ─────────────────────────────────────────── */}
            {activeTab === 'paste' && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: 0, fontSize: 16, color: '#0F172A', fontWeight: 800 }}>Paste Raw MCQ Questions</h3>
                        <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#64748B' }}>
                            Paste correctly formatted text using the "Q1." syntax. Ensure exactly 1 line for the question, 4 lines for options A, B, C, D, and a final answer line like "Answer: C".
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label style={{ color: '#475569' }}>Company Name</label>
                            <input className="form-input" placeholder="e.g. Amazon" value={pasteCompany} onChange={e => setPasteCompany(e.target.value)} style={{ background: '#F8FAFF' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#475569' }}>Quiz Title</label>
                            <input className="form-input" placeholder="e.g. Phase 1 Assessment" value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} style={{ background: '#F8FAFF' }} />
                        </div>
                    </div>

                    <textarea className="form-input" rows={12} placeholder={`Q1. What is 2+2?\nA. 1\nB. 2\nC. 3\nD. 4\nAnswer: C\n\nQ2. What is 10% of 100?\nA. 5\nB. 10\nC. 15\nD. 20\nAnswer: B`}
                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13, background: '#F8FAFF', padding: 16 }}
                        value={pasteText} onChange={e => setPasteText(e.target.value)} />

                    {pasteError && (
                        <div style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, fontSize: 14 }}>{pasteError}</div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button className="btn btn-primary" onClick={handlePasteSubmit} disabled={pasting} style={{ padding: '8px 24px' }}>
                            {pasting ? 'Parsing...' : <><Save size={15}/> Parse & Save Quiz</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ── MANUAL TAB ─────────────────────────────────────────────── */}
            {activeTab === 'manual' && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 4px 12px rgba(37,99,235,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label style={{ color: '#475569' }}>Company Name</label>
                            <input className="form-input" placeholder="e.g. TCS" value={manualCompany} onChange={e => setManualCompany(e.target.value)} style={{ background: '#F8FAFF' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#475569' }}>Quiz Title</label>
                            <input className="form-input" placeholder="e.g. TCS NQT 2024" value={manualTitle} onChange={e => setManualTitle(e.target.value)} style={{ background: '#F8FAFF' }} />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#475569' }}>Type</label>
                            <select className="form-input" value={manualType} onChange={e => setManualType(e.target.value)} style={{ background: '#F8FAFF' }}>
                                <option value="mcq">MCQ</option>
                                <option value="coding">Coding</option>
                            </select>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr style={{ border: 'none', borderTop: '1px solid #EEF2FF', margin: 0 }} />

                    {manualQs.map((q, qi) => (
                        <div key={q.id} style={{ padding: 20, background: '#F8FAFF', border: '1px solid #E2E8F0', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: '#2563EB', fontWeight: 800, fontSize: 15 }}>Question {qi + 1}</span>
                                {manualQs.length > 1 && (
                                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                                        onClick={() => setManualQs(manualQs.filter((_, i) => i !== qi))}>
                                        <Trash2 size={14}/>
                                    </button>
                                )}
                            </div>

                            {manualType === 'mcq' ? (
                                <>
                                    <textarea className="form-input" rows={2} placeholder="Question text…"
                                        style={{ resize: 'none', marginBottom: 12, background: '#FFFFFF' }}
                                        value={q.question} onChange={e => updateManualQ(qi, 'question', e.target.value)} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                        {['A','B','C','D'].map((k, oi) => (
                                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: '#2563EB', fontWeight: 800, minWidth: 20, fontSize: 14 }}>{k}.</span>
                                                <input className="form-input" placeholder={`Option ${k}`}
                                                    value={q.options[oi] || ''} onChange={e => updateManualOpt(qi, oi, e.target.value)} style={{ background: '#FFFFFF' }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <select className="form-input" style={{ width: 130, background: '#FFFFFF' }} value={q.answer}
                                            onChange={e => updateManualQ(qi, 'answer', e.target.value)}>
                                            {['A','B','C','D'].map(k => <option key={k}>Answer: {k}</option>)}
                                        </select>
                                        <select className="form-input" style={{ width: 130, background: '#FFFFFF' }} value={q.difficulty}
                                            onChange={e => updateManualQ(qi, 'difficulty', e.target.value)}>
                                            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <textarea className="form-input" rows={4} placeholder="Problem statement…"
                                        style={{ resize: 'vertical', marginBottom: 12, background: '#FFFFFF' }}
                                        value={q.problemStatement} onChange={e => updateManualQ(qi, 'problemStatement', e.target.value)} />
                                    <textarea className="form-input" rows={3} placeholder="Boilerplate / starter code (optional)…"
                                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13, background: '#FFFFFF' }}
                                        value={q.boilerplate} onChange={e => updateManualQ(qi, 'boilerplate', e.target.value)} />
                                </>
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <button className="btn btn-primary" onClick={addManualQ} style={{ padding: '8px 16px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                            <Plus size={15}/> Add Question
                        </button>
                        <button className="btn btn-success" onClick={saveManualQuiz} disabled={!manualCompany || !manualTitle} style={{ padding: '8px 24px' }}>
                            <Save size={15}/> Save Quiz
                        </button>
                    </div>
                </div>
            )}

            {/* ── MANAGE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'manage' && (
                <div>
                    {mockTests.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748B', background: '#FFFFFF', padding: '60px 20px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>No quizzes yet. Upload a PDF or create manually.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {mockTests.map(test => (
                                <div key={test.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(37,99,235,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                                                {test.title}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span>🏢 {test.companyName}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={13} /> {test.questions.length} questions</span>
                                                <span style={{
                                                    padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                                                    background: test.type === 'mcq' ? '#EFF6FF' : '#ECFDF5',
                                                    color: test.type === 'mcq' ? '#1D4ED8' : '#065F46',
                                                    border: `1px solid ${test.type === 'mcq' ? '#BFDBFE' : '#A7F3D0'}`
                                                }}>
                                                    {test.type.toUpperCase()}
                                                </span>
                                                {getTestStats(test.id).unique > 0 && (
                                                    <button className="btn btn-glass" style={{ padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} 
                                                            onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}>
                                                        <Users size={13}/> {getTestStats(test.id).unique} students attended
                                                        {expandedTest === test.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button className="btn btn-danger" onClick={() => deleteTest(test.id)} style={{ padding: '8px 16px' }}>
                                            <Trash2 size={15}/> Delete
                                        </button>
                                    </div>
                                    
                                    {/* Attendees Panel */}
                                    {expandedTest === test.id && (
                                        <div style={{ marginTop: 16, padding: '16px', background: '#F8FAFF', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                                            <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>Recent Attendees</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                                                {testResults.filter(r => r.testId === test.id).slice().reverse().map((result, idx) => {
                                                    const student = students.find(s => s.id === result.studentId);
                                                    return (
                                                        <div key={`${result.id}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEF2FF', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                                            <div>
                                                                <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>
                                                                    {student ? student.name : 'Unknown Student'}
                                                                </div>
                                                                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
                                                                    {student?.id || result.studentId} · {new Date(result.date).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: 15, fontWeight: 800, padding: '4px 12px', borderRadius: 20, background: result.pct >= 60 ? '#ECFDF5' : '#FEF2F2', color: result.pct >= 60 ? '#059669' : '#DC2626' }}>
                                                                {result.score}/{result.total} ({result.pct}%)
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MockTestManager;
