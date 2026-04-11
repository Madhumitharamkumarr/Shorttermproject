import React, { useState, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { Play, ChevronLeft, ChevronRight, CheckCircle, Terminal } from 'lucide-react';

// Piston API — free, no API key, supports 80+ languages
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGES = [
    { label: 'Python',     id: 'python',     version: '3.10.0',  monaco: 'python',     starter: 'print("Hello, World!")' },
    { label: 'Java',       id: 'java',        version: '15.0.2',  monaco: 'java',       starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { label: 'C++',        id: 'c++',         version: '10.2.0',  monaco: 'cpp',        starter: '#include<iostream>\nusing namespace std;\nint main(){\n    cout<<"Hello, World!"<<endl;\n    return 0;\n}' },
    { label: 'C',          id: 'c',           version: '10.2.0',  monaco: 'c',          starter: '#include<stdio.h>\nint main(){\n    printf("Hello, World!\\n");\n    return 0;\n}' },
    { label: 'JavaScript', id: 'javascript',  version: '18.15.0', monaco: 'javascript', starter: 'console.log("Hello, World!");' },
    { label: 'TypeScript', id: 'typescript',  version: '5.0.3',   monaco: 'typescript', starter: 'console.log("Hello, World!");' },
    { label: 'Go',         id: 'go',          version: '1.16.2',  monaco: 'go',         starter: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
    { label: 'Rust',       id: 'rust',        version: '1.50.0',  monaco: 'rust',       starter: 'fn main() {\n    println!("Hello, World!");\n}' },
    { label: 'SQL',        id: 'sqlite3',     version: '3.36.0',  monaco: 'sql',        starter: 'SELECT "Hello, World!" AS greeting;' },
    { label: 'PHP',        id: 'php',         version: '8.0.2',   monaco: 'php',        starter: '<?php\necho "Hello, World!";\n?>' },
    { label: 'Ruby',       id: 'ruby',        version: '3.0.1',   monaco: 'ruby',       starter: 'puts "Hello, World!"' },
    { label: 'Kotlin',     id: 'kotlin',      version: '1.4.31',  monaco: 'kotlin',     starter: 'fun main() {\n    println("Hello, World!")\n}' },
    { label: 'Swift',      id: 'swift',       version: '5.3.3',   monaco: 'swift',      starter: 'print("Hello, World!")' },
    { label: 'R',          id: 'r',           version: '4.1.1',   monaco: 'r',          starter: 'cat("Hello, World!\\n")' },
    { label: 'Shell',      id: 'bash',        version: '5.1.0',   monaco: 'shell',      starter: 'echo "Hello, World!"' },
];

const CodingEditor = ({ problem, onComplete }) => {
    const { user } = useContext(AuthContext);
    const { testResults, setTestResults } = useContext(DataContext);

    const [lang, setLang]       = useState(LANGUAGES[0]);
    const [code, setCode]       = useState(problem?.boilerplate || LANGUAGES[0].starter);
    const [stdin, setStdin]     = useState('');
    const [output, setOutput]   = useState('');
    const [running, setRunning] = useState(false);
    const [runError, setRunError] = useState('');
    const [saved, setSaved]     = useState(false);

    const handleLangChange = (langId) => {
        const l = LANGUAGES.find(l => l.id === langId);
        if (l) { setLang(l); setCode(problem?.boilerplate || l.starter); }
    };

    const runCode = async () => {
        setRunning(true); setOutput(''); setRunError('');
        try {
            const res = await fetch(PISTON_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: lang.id,
                    version: lang.version,
                    files: [{ content: code }],
                    stdin: stdin,
                }),
            });
            const data = await res.json();
            const out = data?.run?.output || data?.compile?.output || '';
            const err = data?.run?.stderr || data?.compile?.stderr || '';
            setOutput(out || err || '(no output)');
            if (err) setRunError(err);
        } catch (e) {
            setRunError('Failed to connect to execution server. Check your internet connection.');
        }
        setRunning(false);
    };

    const markComplete = () => {
        if (!problem || saved) return;
        setTestResults([...testResults, {
            id: Date.now(),
            studentId: user._id,
            testId: problem.id,
            companyName: problem.companyName || 'Coding Practice',
            title: problem.question || problem.problemStatement || 'Coding Problem',
            score: 1, total: 1, pct: 100,
            date: new Date().toISOString(),
            type: 'coding',
            language: lang.label,
        }]);
        setSaved(true);
        if (onComplete) onComplete();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <select className="form-input" style={{ width: 150 }}
                    value={lang.id} onChange={e => handleLangChange(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
                <button className="btn btn-primary" onClick={runCode} disabled={running}>
                    <Play size={14}/> {running ? 'Running…' : 'Run Code'}
                </button>
                {problem && (
                    <button className="btn btn-success" onClick={markComplete} disabled={saved}>
                        <CheckCircle size={14}/> {saved ? '✓ Completed' : 'Mark as Complete'}
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: problem ? '1fr 1.5fr' : '1fr', gap: 16 }}>
                {/* Problem panel */}
                {problem && (
                    <div className="glass-panel p-4" style={{ maxHeight: 520, overflowY: 'auto' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                            Problem Statement
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#0F172A' }}>
                            {problem.problemStatement || problem.question}
                        </p>
                    </div>
                )}

                {/* Editor + output */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Editor
                            height="340px"
                            language={lang.monaco}
                            value={code}
                            onChange={val => setCode(val || '')}
                            theme="light"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                padding: { top: 12 },
                                lineNumbers: 'on',
                                renderLineHighlight: 'line',
                            }}
                        />
                    </div>

                    {/* stdin */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                            Standard Input (stdin)
                        </div>
                        <textarea className="form-input" rows={2} style={{ resize: 'none', fontFamily: 'monospace', fontSize: 13, background: '#FFFFFF' }}
                            placeholder="Enter test input here…" value={stdin} onChange={e => setStdin(e.target.value)} />
                    </div>

                    {/* Output */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Terminal size={14} style={{ color: '#2563EB' }}/>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Output
                            </span>
                        </div>
                        <div style={{
                            background: '#0F172A', borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            padding: '14px 16px', minHeight: 100, maxHeight: 200, overflowY: 'auto',
                            fontFamily: '"Fira Code", monospace', fontSize: 13, whiteSpace: 'pre-wrap',
                            color: runError ? '#EF4444' : '#10B981',
                        }}>
                            {running ? '⏳ Executing…' : (output || '// Click Run Code to see output')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingEditor;
