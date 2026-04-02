import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { extractTextFromPDF, parseQuestionsFromText } from '../utils/pdfExtractor';
import { Upload, Plus, Trash2, Save, BookOpen, List, FileText, CheckCircle } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const MockTestManager = () => {
    const { mockTests, setMockTests, companies, pushNotification } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState('upload'); // upload | manual | manage

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
        { key: 'manual', icon: <Plus size={15}/>,     label: 'Create Manually' },
        { key: 'manage', icon: <List size={15}/>,     label: `Manage (${mockTests.length})` },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <h2 style={{ marginBottom: 4 }}>Mock Test Manager</h2>
                <p style={{ margin: 0, fontSize: 13 }}>Upload company PDFs or create quizzes manually for students to practice.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={activeTab === t.key ? 'btn btn-primary' : 'btn btn-glass'}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── UPLOAD PDF TAB ─────────────────────────────────────────── */}
            {activeTab === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="glass-panel p-4">
                        <h3 style={{ marginBottom: 14, fontSize: 14 }}>Step 1 — Select Company &amp; Upload PDF</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input className="form-input" placeholder="e.g. Infosys"
                                    value={uploadCompany} onChange={e => setUploadCompany(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Quiz Title</label>
                                <input className="form-input" placeholder="e.g. Infosys Aptitude 2024"
                                    value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
                            </div>
                        </div>

                        {/* File drop zone */}
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed rgba(99,102,241,0.4)', borderRadius: 12, padding: '28px 20px',
                            cursor: 'pointer', background: 'rgba(99,102,241,0.05)',
                            transition: 'background 0.2s',
                        }}>
                            <FileText size={36} style={{ color: '#818cf8', marginBottom: 10 }} />
                            <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 14 }}>
                                {extracting ? 'Extracting questions…' : 'Click to upload PDF'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                                Text-based PDFs work best. Scanned PDFs may not extract correctly.
                            </span>
                            <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>

                        {uploadError && (
                            <div className="auth-error" style={{ marginTop: 12 }}>{uploadError}</div>
                        )}
                    </div>

                    {/* Extracted questions review */}
                    {extracted.length > 0 && (
                        <div className="glass-panel p-4">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ margin: 0, fontSize: 14 }}>
                                    Step 2 — Review Extracted Questions ({extracted.length} found)
                                </h3>
                                <button className="btn btn-success" onClick={saveUploadedQuiz}
                                    disabled={!uploadCompany || !uploadTitle}>
                                    <Save size={14}/> Save Quiz
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 500, overflowY: 'auto' }}>
                                {extracted.map((q, qi) => (
                                    <div key={q.id} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, color: '#818cf8', WebkitTextFillColor: '#818cf8', fontWeight: 600 }}>Q{qi + 1}</span>
                                            <button onClick={() => deleteExtracted(qi)} className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }}>
                                                <Trash2 size={12}/>
                                            </button>
                                        </div>
                                        <input className="form-input" value={q.question}
                                            onChange={e => updateExtracted(qi, 'question', e.target.value)}
                                            style={{ marginBottom: 8 }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                                            {['A','B','C','D'].map((k, oi) => (
                                                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 12, color: '#818cf8', WebkitTextFillColor: '#818cf8', flexShrink: 0, fontWeight: 700, minWidth: 16 }}>{k}.</span>
                                                    <input className="form-input" value={q.options[oi] || ''}
                                                        onChange={e => updateOption(qi, oi, e.target.value)} />
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <label style={{ fontSize: 11, margin: 0, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>Answer:</label>
                                                <select className="form-input" style={{ width: 70 }} value={q.answer}
                                                    onChange={e => updateExtracted(qi, 'answer', e.target.value)}>
                                                    {['A','B','C','D'].map(k => <option key={k}>{k}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <label style={{ fontSize: 11, margin: 0, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>Difficulty:</label>
                                                <select className="form-input" style={{ width: 100 }} value={q.difficulty}
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

            {/* ── MANUAL TAB ─────────────────────────────────────────────── */}
            {activeTab === 'manual' && (
                <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input className="form-input" placeholder="e.g. TCS" value={manualCompany} onChange={e => setManualCompany(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Quiz Title</label>
                            <input className="form-input" placeholder="e.g. TCS NQT 2024" value={manualTitle} onChange={e => setManualTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="form-input" value={manualType} onChange={e => setManualType(e.target.value)}>
                                <option value="mcq">MCQ</option>
                                <option value="coding">Coding</option>
                            </select>
                        </div>
                    </div>

                    {manualQs.map((q, qi) => (
                        <div key={q.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8', fontWeight: 700, fontSize: 13 }}>Question {qi + 1}</span>
                                {manualQs.length > 1 && (
                                    <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: 11 }}
                                        onClick={() => setManualQs(manualQs.filter((_, i) => i !== qi))}>
                                        <Trash2 size={12}/>
                                    </button>
                                )}
                            </div>

                            {manualType === 'mcq' ? (
                                <>
                                    <textarea className="form-input" rows={2} placeholder="Question text…"
                                        style={{ resize: 'none', marginBottom: 10 }}
                                        value={q.question} onChange={e => updateManualQ(qi, 'question', e.target.value)} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                        {['A','B','C','D'].map((k, oi) => (
                                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8', fontWeight: 700, minWidth: 16, fontSize: 12 }}>{k}.</span>
                                                <input className="form-input" placeholder={`Option ${k}`}
                                                    value={q.options[oi] || ''} onChange={e => updateManualOpt(qi, oi, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <select className="form-input" style={{ width: 110 }} value={q.answer}
                                            onChange={e => updateManualQ(qi, 'answer', e.target.value)}>
                                            {['A','B','C','D'].map(k => <option key={k}>Answer: {k}</option>)}
                                        </select>
                                        <select className="form-input" style={{ width: 120 }} value={q.difficulty}
                                            onChange={e => updateManualQ(qi, 'difficulty', e.target.value)}>
                                            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <textarea className="form-input" rows={4} placeholder="Problem statement…"
                                        style={{ resize: 'vertical', marginBottom: 10 }}
                                        value={q.problemStatement} onChange={e => updateManualQ(qi, 'problemStatement', e.target.value)} />
                                    <textarea className="form-input" rows={3} placeholder="Boilerplate / starter code (optional)…"
                                        style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
                                        value={q.boilerplate} onChange={e => updateManualQ(qi, 'boilerplate', e.target.value)} />
                                </>
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-glass" onClick={addManualQ}><Plus size={14}/> Add Question</button>
                        <button className="btn btn-success" onClick={saveManualQuiz} disabled={!manualCompany || !manualTitle}>
                            <Save size={14}/> Save Quiz
                        </button>
                    </div>
                </div>
            )}

            {/* ── MANAGE TAB ─────────────────────────────────────────────── */}
            {activeTab === 'manage' && (
                <div>
                    {mockTests.length === 0 ? (
                        <div className="glass-panel p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                            <p style={{ margin: 0 }}>No quizzes yet. Upload a PDF or create manually.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {mockTests.map(test => (
                                <div key={test.id} className="glass-panel p-4">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>
                                                {test.title}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 14 }}>
                                                <span>🏢 {test.companyName}</span>
                                                <span><BookOpen size={12} style={{ display: 'inline', verticalAlign: 'middle' }}/> {test.questions.length} questions</span>
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                                                    background: test.type === 'mcq' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                                                    color: test.type === 'mcq' ? '#a5b4fc' : '#34d399',
                                                    WebkitTextFillColor: test.type === 'mcq' ? '#a5b4fc' : '#34d399',
                                                }}>
                                                    {test.type.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="btn btn-danger" onClick={() => deleteTest(test.id)}>
                                            <Trash2 size={14}/> Delete
                                        </button>
                                    </div>
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
