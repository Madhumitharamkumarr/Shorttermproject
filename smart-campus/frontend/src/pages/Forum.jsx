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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 16px' }}>

            {/* Header — centered */}
            <div style={{ textAlign: 'center', maxWidth: 720, width: '100%' }}>
                <h2 style={{ marginBottom: 4 }}>Discussion Forum</h2>
                <p style={{ margin: 0, fontSize: 14 }}>Ask questions, share interview experiences, and collaborate.</p>
            </div>

            {/* New post form — centered card */}
            <form
                className="glass-panel p-4"
                onSubmit={handlePost}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, width: '100%' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <PenLine size={16} style={{ color: 'var(--primary-color)' }} />
                    <h3 style={{ margin: 0, fontSize: 15 }}>Start a Discussion</h3>
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
                    rows={3}
                    style={{ resize: 'vertical' }}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Post Discussion
                </button>
            </form>

            {/* Post feed — single centered column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, width: '100%' }}>
                {discussions.length === 0 && (
                    <div className="glass-panel p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No discussions yet. Be the first to post!
                    </div>
                )}
                {discussions.map(post => (
                    <div key={post.id}>
                        {/* Post card */}
                        <div
                            className="glass-panel p-4"
                            style={{
                                cursor: 'pointer',
                                borderColor: activePostId === post.id ? 'var(--primary-color)' : undefined,
                                borderWidth: activePostId === post.id ? 2 : 1,
                            }}
                            onClick={() => setActivePostId(post.id === activePostId ? null : post.id)}
                        >
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                {/* Upvote column */}
                                <div
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, minWidth: 36 }}
                                    onClick={e => { e.stopPropagation(); handleUpvote(post.id); }}
                                >
                                    <ArrowUp
                                        size={20}
                                        style={{
                                            cursor: 'pointer',
                                            color: post.upvotes.includes(user?._id) ? 'var(--primary-color)' : 'var(--text-muted)',
                                        }}
                                    />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                                        {post.upvotes.length}
                                    </span>
                                </div>

                                {/* Post content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ marginBottom: 6, fontSize: 16 }}>{post.title}</h3>
                                    <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.6 }}>
                                        {post.content.length > 180 ? post.content.substring(0, 180) + '…' : post.content}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Posted by <strong style={{ color: 'var(--primary-color)' }}>{post.author.split('@')[0]}</strong>
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <MessageSquare size={13} /> {post.comments.length} Comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded comment section — directly below the selected post, centered */}
                        {activePostId === post.id && (
                            <div
                                className="glass-panel"
                                style={{
                                    marginTop: -1,
                                    borderTop: 'none',
                                    borderTopLeftRadius: 0,
                                    borderTopRightRadius: 0,
                                    padding: '20px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                {/* Full post content */}
                                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-main)' }}>
                                    {post.content}
                                </p>

                                {/* Divider */}
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                                    <div style={{
                                        fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                                        letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10
                                    }}>
                                        Comments ({post.comments.length})
                                    </div>

                                    {/* Comments list */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', marginBottom: 14 }}>
                                        {post.comments.length === 0
                                            ? <p style={{ fontSize: 13, margin: 0, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No comments yet. Be the first to reply!</p>
                                            : post.comments.map((c, i) => (
                                                <div key={i} style={{
                                                    padding: '10px 14px',
                                                    background: 'var(--bg-main)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 8,
                                                }}>
                                                    <p style={{ margin: '0 0 4px', fontSize: 14, lineHeight: 1.5, color: 'var(--text-main)' }}>{c.content}</p>
                                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {c.author.split('@')[0]}</span>
                                                </div>
                                            ))
                                        }
                                    </div>

                                    {/* Comment input — centered */}
                                    <form
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 10,
                                            maxWidth: 560,
                                            margin: '0 auto',
                                            width: '100%',
                                        }}
                                        onSubmit={e => handleComment(post.id, e)}
                                    >
                                        <input
                                            className="form-input"
                                            style={{
                                                flex: 1,
                                                padding: '11px 18px',
                                                borderRadius: '24px',
                                                fontSize: 14,
                                            }}
                                            placeholder="Write a comment..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{
                                                padding: '11px 16px',
                                                borderRadius: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 42,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Forum;
