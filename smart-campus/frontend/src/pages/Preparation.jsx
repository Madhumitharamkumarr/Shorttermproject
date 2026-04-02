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
        const label = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : 'Keep Practising!';
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ marginBottom: 4 }}>Quiz Complete!</h2>
                <div className="glass-panel p-4" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto', width: '100%' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
                    <h3 style={{ marginBottom: 6 }}>{label}</h3>
                    <p style={{ margin: '0 0 16px', fontSize: 13 }}>{selectedTest.title} · {selectedTest.companyName}</p>
                    <div style={{ fontSize: 48, fontWeight: 800, color: '#818cf8', WebkitTextFillColor: '#818cf8', lineHeight: 1 }}>
                        {score}/{q.length}
                    </div>
                    <div style={{ fontSize: 16, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 4 }}>
                        {pct}% correct
                    </div>
                    <button className="btn btn-glass" style={{ marginTop: 20 }} onClick={() => setMode('home')}>
                        <RotateCcw size={14}/> Back to Tests
                    </button>
                </div>

                {/* Review answers */}
                <div className="glass-panel p-4">
                    <h3 style={{ marginBottom: 14, fontSize: 14 }}>Answer Review</h3>
                    {q.map((quest, i) => {
                        const selected = answers[i];
                        const correct  = quest.answer?.toUpperCase();
                        const isRight  = selected === correct;
                        return (
                            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < q.length-1 ? '1px solid var(--glass-border)' : 'none' }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)', marginBottom: 8 }}>
                                    {i+1}. {quest.question}
                                </div>
                                {OPTION_LABELS.map((k, oi) => {
                                    const opt = quest.options[oi];
                                    if (!opt) return null;
                                    const isCorrect = k === correct;
                                    const isSelected = k === selected;
                                    let bg = 'transparent', color = 'var(--text-muted)';
                                    if (isCorrect)         { bg = 'rgba(16,185,129,0.15)'; color = '#34d399'; }
                                    else if (isSelected)  { bg = 'rgba(239,68,68,0.15)'; color = '#f87171';  }
                                    return (
                                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: bg, marginBottom: 4 }}>
                                            <span style={{ minWidth: 20, fontWeight: 700, color, WebkitTextFillColor: color, fontSize: 13 }}>{k}.</span>
                                            <span style={{ fontSize: 13, color, WebkitTextFillColor: color }}>{opt}</span>
                                            {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#34d399', WebkitTextFillColor: '#34d399' }}>✓ Correct</span>}
                                            {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#f87171', WebkitTextFillColor: '#f87171' }}>✗ Wrong</span>}
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
                        <h2 style={{ marginBottom: 2, fontSize: '1.2rem' }}>{selectedTest.title}</h2>
                        <p style={{ margin: 0, fontSize: 12 }}>🏢 {selectedTest.companyName} &nbsp;·&nbsp; Question {currentQ+1} of {q.length}</p>
                    </div>
                    <button className="btn btn-glass" onClick={() => setMode('home')}>✕ Exit</button>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>

                {/* Question card */}
                <div className="glass-panel p-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                            background: current.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : current.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: current.difficulty === 'Easy' ? '#34d399' : current.difficulty === 'Hard' ? '#f87171' : '#fbbf24',
                            WebkitTextFillColor: current.difficulty === 'Easy' ? '#34d399' : current.difficulty === 'Hard' ? '#f87171' : '#fbbf24',
                        }}>{current.difficulty || 'Medium'}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)', marginBottom: 20, lineHeight: 1.5 }}>
                        {current.question}
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {OPTION_LABELS.map((k, oi) => {
                            const opt = current.options[oi];
                            if (!opt) return null;
                            const selected = answers[currentQ] === k;
                            return (
                                <button key={k} onClick={() => selectAnswer(currentQ, k)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                        borderRadius: 10, cursor: 'pointer', border: selected ? '2px solid #6366f1' : '1px solid var(--glass-border)',
                                        background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                                        textAlign: 'left', transition: 'all 0.15s',
                                    }}>
                                    <span style={{ minWidth: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
                                        background: selected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)',
                                        color: selected ? '#a5b4fc' : 'var(--text-muted)', WebkitTextFillColor: selected ? '#a5b4fc' : 'var(--text-muted)',
                                    }}>{k}</span>
                                    <span style={{ fontSize: 14, color: selected ? '#c7d2fe' : 'var(--text-main)', WebkitTextFillColor: selected ? '#c7d2fe' : 'var(--text-main)' }}>{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn btn-glass" onClick={() => setCurrentQ(Math.max(0, currentQ-1))} disabled={currentQ === 0}>
                        ← Previous
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                        {Object.keys(answers).length}/{q.length} answered
                    </span>
                    {currentQ < q.length - 1
                        ? <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ+1)}>Next →</button>
                        : <button className="btn btn-success" onClick={submitQuiz}><Trophy size={14}/> Submit Quiz</button>
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
                        <h2 style={{ marginBottom: 4 }}>Coding Practice</h2>
                        <p style={{ margin: 0, fontSize: 13 }}>Write and run code using 15+ languages. Results saved to your dashboard.</p>
                    </div>
                    <button className="btn btn-glass" onClick={() => setMode('home')}>← Back</button>
                </div>

                {codingTests.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Problem selector */}
                        {!selectedTest ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <h3 style={{ fontSize: 14, margin: 0 }}>Select a Problem</h3>
                                {codingTests.map(t => (
                                    <div key={t.id} className="glass-panel p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 8 }}
                                        onClick={() => setTest(t)}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{t.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 3 }}>🏢 {t.companyName} · {t.questions.length} problem{t.questions.length !== 1 ? 's' : ''}</div>
                                        </div>
                                        <ChevronRight size={18} style={{ color: '#818cf8' }}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {!selectedTest.activeProblem ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h3 style={{ margin: 0, fontSize: 14 }}>{selectedTest.title} — Choose Problem</h3>
                                            <button className="btn btn-glass" style={{ fontSize: 12 }} onClick={() => setTest(null)}>← Back</button>
                                        </div>
                                        {selectedTest.questions.map((prob, i) => (
                                            <div key={i} className="glass-panel p-4" style={{ cursor: 'pointer' }}
                                                onClick={() => setTest({ ...selectedTest, activeProblem: prob })}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)', fontSize: 14 }}>
                                                    Problem {i+1}
                                                </div>
                                                <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                                                    {(prob.problemStatement || prob.question || '').substring(0, 120)}…
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <button className="btn btn-glass" style={{ alignSelf: 'flex-start' }}
                                            onClick={() => setTest({ ...selectedTest, activeProblem: null })}>← Problems</button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <h2 style={{ marginBottom: 4 }}>Preparation Zone</h2>
                <p style={{ margin: 0, fontSize: 13 }}>Practice company-specific quizzes and coding problems.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="glass-card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => setMode('coding')}>
                    <Code2 size={28} style={{ color: '#34d399', marginBottom: 10 }}/>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)', marginBottom: 4 }}>Coding Editor</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>15+ languages · Live execution</div>
                </div>
            </div>

            {/* MCQ Quizzes */}
            {mcqTests.length > 0 && (
                <div>
                    <h3 style={{ fontSize: 14, marginBottom: 12 }}>MCQ Quizzes ({mcqTests.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {mcqTests.map(test => {
                            const done = testResults.filter(r => r.testId === test.id && r.studentId === user._id);
                            const best = done.length > 0 ? Math.max(...done.map(r => r.pct)) : null;
                            return (
                                <div key={test.id} className="glass-panel p-4">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{test.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginTop: 3 }}>
                                                🏢 {test.companyName} &nbsp;·&nbsp; <BookOpen size={11} style={{ display: 'inline', verticalAlign: 'middle' }}/> {test.questions.length} questions
                                                {best !== null && (
                                                    <span style={{ marginLeft: 8, color: best >= 80 ? '#34d399' : '#fbbf24', WebkitTextFillColor: best >= 80 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                                                        · Best: {best}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary" onClick={() => startQuiz(test)}>
                                            {done.length > 0 ? '↺ Retry' : 'Start Quiz'} <ChevronRight size={14}/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {mockTests.length === 0 && (
                <div className="glass-panel p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
                    <p style={{ margin: 0 }}>No quizzes available yet. Ask your admin to upload company PDFs.</p>
                </div>
            )}
        </div>
    );
};

export default Preparation;
