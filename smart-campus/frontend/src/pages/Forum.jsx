import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, ArrowUp, Send, PenLine } from 'lucide-react';

const Forum = () => {
    const { discussions, setDiscussions } = useContext(DataContext);
    const { user } = useContext(AuthContext);

    const [newTitle, setNewTitle]     = useState('');
    const [newContent, setNewContent] = useState('');
    const [newComment, setNewComment] = useState('');
    const [activePostId, setActivePostId] = useState(null);

    const activePost = discussions.find(d => d.id === activePostId);

    const handlePost = (e) => {
        e.preventDefault();
        setDiscussions([...discussions, {
            id: Date.now(), title: newTitle, content: newContent,
            author: user.email, upvotes: [], comments: []
        }]);
        setNewTitle('');
        setNewContent('');
    };

    const handleUpvote = (id) => {
        setDiscussions(discussions.map(post =>
            post.id === id && !post.upvotes.includes(user?._id)
                ? { ...post, upvotes: [...post.upvotes, user._id] }
                : post
        ));
    };

    const handleComment = (id, e) => {
        e.preventDefault();
        setDiscussions(discussions.map(post =>
            post.id === id
                ? { ...post, comments: [...post.comments, { content: newComment, author: user.email }] }
                : post
        ));
        setNewComment('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Header */}
            <div>
                <h2 style={{ marginBottom: 4 }}>Discussion Forum</h2>
                <p style={{ margin: 0, fontSize: 13 }}>Ask questions, share interview experiences, and collaborate.</p>
            </div>

            <div className="forum-layout">
                {/* Left: Post feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {discussions.length === 0 && (
                        <div className="glass-panel p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No discussions yet. Be the first to post!
                        </div>
                    )}
                    {discussions.map(post => (
                        <div
                            key={post.id}
                            className="glass-panel p-4"
                            style={{ cursor: 'pointer', borderColor: activePostId === post.id ? 'rgba(99,102,241,0.5)' : undefined }}
                            onClick={() => setActivePostId(post.id === activePostId ? null : post.id)}
                        >
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                {/* Upvote column */}
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, minWidth: 32 }}
                                    onClick={e => { e.stopPropagation(); handleUpvote(post.id); }}
                                >
                                    <ArrowUp
                                        size={20}
                                        style={{
                                            cursor: 'pointer',
                                            color: post.upvotes.includes(user?._id) ? '#818cf8' : 'var(--text-muted)',
                                        }}
                                    />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>
                                        {post.upvotes.length}
                                    </span>
                                </div>

                                {/* Post content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ marginBottom: 6, fontSize: 15 }}>{post.title}</h3>
                                    <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.5 }}>
                                        {post.content.length > 120 ? post.content.substring(0, 120) + '…' : post.content}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                                            Posted by <strong style={{ color: '#a5b4fc', WebkitTextFillColor: '#a5b4fc' }}>{post.author.split('@')[0]}</strong>
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                                            <MessageSquare size={13} /> {post.comments.length} Comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* New post form */}
                    <form className="glass-panel p-4" onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <PenLine size={16} style={{ color: '#818cf8' }} />
                            <h3 style={{ margin: 0, fontSize: 14 }}>Start a Discussion</h3>
                        </div>
                        <input
                            className="form-input"
                            placeholder="Title"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            required
                        />
                        <textarea
                            className="form-input"
                            placeholder="What's on your mind?"
                            rows={4}
                            style={{ resize: 'none' }}
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Post Discussion
                        </button>
                    </form>

                    {/* Active post detail */}
                    {activePost && (
                        <div className="glass-panel p-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3 style={{ margin: 0, fontSize: 15 }}>{activePost.title}</h3>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{activePost.content}</p>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)', marginBottom: 8 }}>
                                    Comments ({activePost.comments.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                                    {activePost.comments.length === 0
                                        ? <p style={{ fontSize: 12, margin: 0 }}>No comments yet.</p>
                                        : activePost.comments.map((c, i) => (
                                            <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 8 }}>
                                                <p style={{ margin: '0 0 4px', fontSize: 13, lineHeight: 1.4, color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{c.content}</p>
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>— {c.author.split('@')[0]}</span>
                                            </div>
                                        ))
                                    }
                                </div>

                                <form style={{ display: 'flex', gap: 8 }} onSubmit={e => handleComment(activePost.id, e)}>
                                    <input
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        placeholder="Add a comment…"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum;
