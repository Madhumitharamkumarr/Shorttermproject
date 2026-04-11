import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import CodingEditor from './CodingEditor';
import { BookOpen, Code2, ChevronRight, Trophy, RotateCcw } from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const Preparation = () => {
    const { mockTests, testResults, setTestResults } = useContext(DataContext);
    const { user } = useContext(AuthContext);

    const [mode, setMode]           = useState('home');      // home | quiz | result | coding
    const [selectedTest, setTest]   = useState(null);
    const [currentQ, setCurrentQ]   = useState(0);
    const [answers, setAnswers]     = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore]         = useState(0);

    const mcqTests    = mockTests.filter(t => t.type === 'mcq');
    const codingTests = mockTests.filter(t => t.type === 'coding');

    // ── Start MCQ quiz ────────────────────────────────────────────────────────
    const startQuiz = (test) => {
        setTest(test);
        setCurrentQ(0);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setMode('quiz');
    };

    const selectAnswer = (qIdx, ans) => {
        if (submitted) return;
        setAnswers({ ...answers, [qIdx]: ans });
    };

    const submitQuiz = () => {
        const q = selectedTest.questions;
        let correct = 0;
        q.forEach((quest, i) => {
            // Answer is stored as 'A'/'B'/'C'/'D' — compare to selected option index
            const selectedLabel = answers[i];
            const correctLabel  = quest.answer?.toUpperCase();
            if (selectedLabel === correctLabel) correct++;
        });
        setScore(correct);
        setSubmitted(true);
        // Save result
        setTestResults([...testResults, {
            id: Date.now(),
            studentId: user._id,
            testId: selectedTest.id,
            companyName: selectedTest.companyName,
            title: selectedTest.title,
            score: correct,
            total: q.length,
            pct: Math.round((correct / q.length) * 100),
            date: new Date().toISOString(),
            type: 'mcq',
        }]);
        setMode('result');
    };

    const q = selectedTest?.questions || [];
    const current = q[currentQ];

    // ── RESULT screen ─────────────────────────────────────────────────────────
    if (mode === 'result') {
        const pct = Math.round((score / q.length) * 100);
        const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
        const label = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practicing!';
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ marginBottom: 4, color: '#0F172A', fontWeight: 800 }}>Quiz Complete!</h2>
                <div className="glass-panel p-4" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', width: '100%', background: '#FFFFFF' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
                    <h3 style={{ marginBottom: 6, color: '#0F172A', fontSize: 24, fontWeight: 800 }}>{label}</h3>
                    <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748B' }}>{selectedTest.title} · {selectedTest.companyName}</p>
                    <div style={{ fontSize: 56, fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>
                        {score}/{q.length}
                    </div>
                    <div style={{ fontSize: 16, color: '#64748B', marginTop: 8, fontWeight: 600 }}>
                        {pct}% correct
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={() => setMode('home')}>
                        <RotateCcw size={16}/> Back to Tests
                    </button>
                </div>

                {/* Review answers */}
                <div className="glass-panel p-4" style={{ background: '#FFFFFF' }}>
                    <h3 style={{ marginBottom: 18, fontSize: 16, color: '#0F172A' }}>Answer Review</h3>
                    {q.map((quest, i) => {
                        const selected = answers[i];
                        const correct  = quest.answer?.toUpperCase();
                        const isRight  = selected === correct;
                        return (
                            <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < q.length-1 ? '1px solid #E2E8F0' : 'none' }}>
                                <div style={{ fontWeight: 600, fontSize: 15, color: '#0F172A', marginBottom: 12 }}>
                                    {i+1}. {quest.question}
                                </div>
                                {OPTION_LABELS.map((k, oi) => {
                                    const opt = quest.options[oi];
                                    if (!opt) return null;
                                    const isCorrect = k === correct;
                                    const isSelected = k === selected;
                                    let bg = '#F8FAFF', color = '#475569', border = '#EEF2FF';
                                    if (isCorrect)         { bg = '#ECFDF5'; color = '#065F46'; border = '#A7F3D0'; }
                                    else if (isSelected)  { bg = '#FEF2F2'; color = '#B91C1C'; border = '#FECACA';  }
                                    return (
                                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: bg, border: `1px solid ${border}`, marginBottom: 6 }}>
                                            <span style={{ minWidth: 20, fontWeight: 800, color, fontSize: 13 }}>{k}.</span>
                                            <span style={{ fontSize: 14, color, fontWeight: 500 }}>{opt}</span>
                                            {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#059669', fontWeight: 700 }}>✓ Correct</span>}
                                            {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#DC2626', fontWeight: 700 }}>✗ Wrong</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── QUIZ screen ───────────────────────────────────────────────────────────
    if (mode === 'quiz' && current) {
        const progress = Math.round(((currentQ) / q.length) * 100);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ marginBottom: 4, fontSize: '1.4rem', color: '#0F172A', fontWeight: 800 }}>{selectedTest.title}</h2>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>🏢 {selectedTest.companyName} &nbsp;·&nbsp; Question {currentQ+1} of {q.length}</p>
                    </div>
                    <button className="btn btn-glass" onClick={() => setMode('home')}>✕ Exit</button>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#2563EB,#60A5FA)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>

                {/* Question card */}
                <div className="glass-panel p-4" style={{ background: '#FFFFFF', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, fontWeight: 700,
                            background: current.difficulty === 'Easy' ? '#ECFDF5' : current.difficulty === 'Hard' ? '#FEF2F2' : '#FFFBEB',
                            color: current.difficulty === 'Easy' ? '#059669' : current.difficulty === 'Hard' ? '#DC2626' : '#D97706',
                            border: `1px solid ${current.difficulty === 'Easy' ? '#A7F3D0' : current.difficulty === 'Hard' ? '#FECACA' : '#FDE68A'}`
                        }}>{current.difficulty || 'Medium'}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A', marginBottom: 24, lineHeight: 1.6 }}>
                        {current.question}
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {OPTION_LABELS.map((k, oi) => {
                            const opt = current.options[oi];
                            if (!opt) return null;
                            const selected = answers[currentQ] === k;
                            return (
                                <button key={k} onClick={() => selectAnswer(currentQ, k)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                                        borderRadius: 12, cursor: 'pointer', border: selected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                        background: selected ? '#EFF6FF' : '#FFFFFF',
                                        textAlign: 'left', transition: 'all 0.2s',
                                        boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.1)' : 'none'
                                    }}>
                                    <span style={{ minWidth: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0,
                                        background: selected ? '#2563EB' : '#F1F5F9',
                                        color: selected ? '#FFFFFF' : '#64748B',
                                    }}>{k}</span>
                                    <span style={{ fontSize: 15, color: selected ? '#1D4ED8' : '#334155', fontWeight: selected ? 600 : 500 }}>{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <button className="btn btn-glass" onClick={() => setCurrentQ(Math.max(0, currentQ-1))} disabled={currentQ === 0}>
                        ← Previous
                    </button>
                    <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>
                        {Object.keys(answers).length} / {q.length} answered
                    </span>
                    {currentQ < q.length - 1
                        ? <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ+1)}>Next →</button>
                        : <button className="btn btn-success" onClick={submitQuiz}><Trophy size={16}/> Submit Quiz</button>
                    }
                </div>
            </div>
        );
    }

    // ── CODING screen ─────────────────────────────────────────────────────────
    if (mode === 'coding') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h2 style={{ marginBottom: 4, color: '#0F172A', fontWeight: 800 }}>Coding Practice</h2>
                        <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Write and run code using 15+ languages. Results saved to your dashboard.</p>
                    </div>
                    <button className="btn btn-glass" onClick={() => setMode('home')}>← Back to Prep</button>
                </div>

                {codingTests.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Problem selector */}
                        {!selectedTest ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <h3 style={{ fontSize: 15, margin: 0, color: '#0F172A' }}>Select a Company Mock Test</h3>
                                {codingTests.map(t => (
                                    <div key={t.id} className="glass-panel p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}
                                        onClick={() => setTest(t)}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1D4ED8', fontSize: 16 }}>{t.title}</div>
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>🏢 {t.companyName} · {t.questions.length} problem{t.questions.length !== 1 ? 's' : ''}</div>
                                        </div>
                                        <ChevronRight size={20} style={{ color: '#2563EB' }}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {!selectedTest.activeProblem ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: 15, color: '#0F172A' }}>{selectedTest.title} — Choose Problem</h3>
                                            <button className="btn btn-glass" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => setTest(null)}>← Back to Tests</button>
                                        </div>
                                        {selectedTest.questions.map((prob, i) => (
                                            <div key={i} className="glass-panel p-4" style={{ cursor: 'pointer', background: '#FFFFFF' }}
                                                onClick={() => setTest({ ...selectedTest, activeProblem: prob })}>
                                                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>
                                                    Problem {i+1}
                                                </div>
                                                <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.6, color: '#475569' }}>
                                                    {(prob.problemStatement || prob.question || '').substring(0, 150)}…
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <button className="btn btn-glass" style={{ alignSelf: 'flex-start', fontSize: 13, padding: '6px 12px' }}
                                            onClick={() => setTest({ ...selectedTest, activeProblem: null })}>← Problem List</button>
                                        <CodingEditor
                                            problem={{ ...selectedTest.activeProblem, companyName: selectedTest.companyName }}
                                            onComplete={() => {}}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <CodingEditor problem={null} onComplete={() => {}} />
                )}
            </div>
        );
    }

    // ── HOME screen ───────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h2 style={{ marginBottom: 4, color: '#0F172A', fontWeight: 800 }}>Preparation Zone</h2>
                <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Practice company-specific quizzes and coding problems.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="glass-card" style={{ padding: 24, cursor: 'pointer', background: '#FFFFFF', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => setMode('coding')} 
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.1)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <Code2 size={32} style={{ color: '#059669', marginBottom: 12, padding: 8, background: '#ECFDF5', borderRadius: 10 }}/>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>Coding Editor</div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>15+ languages · Live execution</div>
                </div>
            </div>

            {/* MCQ Quizzes */}
            {mcqTests.length > 0 && (
                <div>
                    <h3 style={{ fontSize: 15, marginBottom: 14, color: '#0F172A', fontWeight: 700 }}>MCQ Quizzes ({mcqTests.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {mcqTests.map(test => {
                            const done = testResults.filter(r => r.testId === test.id && r.studentId === user._id);
                            const best = done.length > 0 ? Math.max(...done.map(r => r.pct)) : null;
                            return (
                                <div key={test.id} className="glass-panel p-4" style={{ background: '#FFFFFF' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#1D4ED8' }}>{test.title}</div>
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                                                🏢 {test.companyName} &nbsp;·&nbsp; <BookOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }}/> {test.questions.length} questions
                                                {best !== null && (
                                                    <span style={{ marginLeft: 10, padding: '2px 8px', borderRadius: 20, background: best >= 80 ? '#ECFDF5' : '#FFFBEB', color: best >= 80 ? '#059669' : '#B45309', fontWeight: 700, fontSize: 11 }}>
                                                        Highest: {best}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary" onClick={() => startQuiz(test)}>
                                            {done.length > 0 ? '↺ Retry Quiz' : 'Start Quiz'} <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {mockTests.length === 0 && (
                <div className="glass-panel p-4" style={{ textAlign: 'center', color: '#64748B', background: '#FFFFFF', padding: '60px 20px' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>No quizzes available yet. Ask your admin to upload company PDFs.</p>
                </div>
            )}
        </div>
    );
};

export default Preparation;
