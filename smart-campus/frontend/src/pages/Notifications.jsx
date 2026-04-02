import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, Check, X, Plus } from 'lucide-react';

const Notifications = () => {
    const { notifications, setNotifications, pushNotification } = useContext(DataContext);
    const { user } = useContext(AuthContext);

    const [showForm, setShowForm] = useState(false);
    const [newNotif, setNewNotif] = useState({ title: '', description: '', type: 'Info' });
    const [reasons, setReasons] = useState({});

    // Filter and sort: newest first, and only what applies to the current user
    const filteredNotifications = notifications
        .filter(n => n.recipientId === null || n.recipientId === user?._id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const typeStyle = (type) => {
        if (type === 'Urgent')          return { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' };
        if (type === 'Action Required') return { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
        return                                 { bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8' };
    };

    const handleRespond = (notifId, interested) => {
        if (!interested && !reasons[notifId]) {
            alert('Please enter a reason if you are not interested.');
            return;
        }
        setNotifications(notifications.map(n =>
            n.id === notifId
                ? { ...n, read: true, responses: { ...n.responses, [user._id]: { interested, reason: interested ? '' : reasons[notifId] } } }
                : n
        ));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        pushNotification(newNotif.title, newNotif.description, newNotif.type);
        setNewNotif({ title: '', description: '', type: 'Info' });
        setShowForm(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Page Header */}
            <div className="flex-between">
                <div>
                    <h2 style={{ marginBottom: 4 }}>Notifications &amp; Announcements</h2>
                    <p style={{ margin: 0, fontSize: 13 }}>Stay updated with the latest campus placement news.</p>
                </div>
                {user?.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Add Notification</>}
                    </button>
                )}
            </div>

            {/* Admin: Add Notification Form */}
            {showForm && (
                <form className="glass-panel p-4" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ marginBottom: 4 }}>Push New Notification (Global)</h3>
                    <input
                        className="form-input"
                        placeholder="Title (e.g. Infosys is coming)"
                        value={newNotif.title}
                        onChange={e => setNewNotif({ ...newNotif, title: e.target.value })}
                        required
                    />
                    <textarea
                        className="form-input"
                        placeholder="Description or question for students…"
                        rows={3}
                        style={{ resize: 'none' }}
                        value={newNotif.description}
                        onChange={e => setNewNotif({ ...newNotif, description: e.target.value })}
                        required
                    />
                    <select
                        className="form-input"
                        value={newNotif.type}
                        onChange={e => setNewNotif({ ...newNotif, type: e.target.value })}
                    >
                        <option value="Info">Info</option>
                        <option value="Action Required">Action Required</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" type="submit">Push to Students</button>
                    </div>
                </form>
            )}

            {/* Notification list */}
            {filteredNotifications.length === 0 ? (
                <div className="glass-panel p-4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No notifications yet.
                </div>
            ) : (
                filteredNotifications.map(notif => {
                    const ts = typeStyle(notif.type);
                    const myResponse = notif.responses?.[user._id];
                    const isUnread = user?.role === 'student' && !notif.read && !myResponse;

                    return (
                        <div key={notif.id} className="glass-panel p-4" style={{ 
                            position: 'relative', 
                            borderLeft: isUnread ? '4px solid #818cf8' : '1px solid var(--glass-border)',
                            background: isUnread ? 'rgba(99,102,241,0.05)' : 'none'
                        }}>
                            {/* Top row: icon + title + badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                                <Bell size={18} style={{ color: isUnread ? '#818cf8' : '#fbbf24', flexShrink: 0, marginTop: 2 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <h3 style={{ margin: 0, fontSize: 15 }}>{notif.title}</h3>
                                            <span style={{
                                                background: ts.bg, color: ts.color, WebkitTextFillColor: ts.color,
                                                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0
                                            }}>
                                                {notif.type}
                                            </span>
                                            {isUnread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8' }}></span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                                            {new Date(notif.date).toLocaleDateString()} · {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.5 }}>{notif.description}</p>
                                </div>
                            </div>

                            {/* Student actions section */}
                            {user?.role === 'student' && (
                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {notif.type === 'Action Required' ? (
                                        myResponse ? (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '6px 12px',
                                                borderRadius: 8,
                                                background: myResponse.interested ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: myResponse.interested ? '#34d399' : '#f87171',
                                                WebkitTextFillColor: myResponse.interested ? '#34d399' : '#f87171',
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}>
                                                {myResponse.interested ? <Check size={14}/> : <X size={14}/>}
                                                Responded: {myResponse.interested ? 'Interested' : 'Not Interested'}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, flex: 1 }}>
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button className="btn btn-success" style={{ flex: 1, padding: '6px 14px', fontSize: 12 }} onClick={() => handleRespond(notif.id, true)}>
                                                        <Check size={14} /> Interested
                                                    </button>
                                                    <button className="btn btn-danger" style={{ flex: 1, padding: '6px 14px', fontSize: 12 }} onClick={() => handleRespond(notif.id, false)}>
                                                        <X size={14} /> Not Interested
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ height: 32, fontSize: 12 }}
                                                    placeholder="Reason (if not interested)"
                                                    value={reasons[notif.id] || ''}
                                                    onChange={e => setReasons({ ...reasons, [notif.id]: e.target.value })}
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div>
                                            {notif.read ? (
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>Read</span>
                                            ) : (
                                                <button className="btn btn-glass" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => markAsRead(notif.id)}>
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin: responses count */}
                            {user?.role === 'admin' && notif.type === 'Action Required' && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>
                                        Total responses: <strong style={{ color: 'var(--text-main)', WebkitTextFillColor: 'var(--text-main)' }}>{Object.keys(notif.responses || {}).length}</strong>
                                    </span>
                                    <span style={{ fontSize: 12, color: '#34d399', WebkitTextFillColor: '#34d399' }}>
                                        Interested: {Object.values(notif.responses || {}).filter(r => r.interested).length}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#f87171', WebkitTextFillColor: '#f87171' }}>
                                        Rejected: {Object.values(notif.responses || {}).filter(r => !r.interested).length}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Notifications;
