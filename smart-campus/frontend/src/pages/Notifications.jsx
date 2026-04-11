import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, Check, X, Plus } from 'lucide-react';

const typeStyle = (type) => {
    if (type === 'Urgent')          return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
    if (type === 'Action Required') return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
    return                                 { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
};

const Notifications = () => {
    const { notifications, setNotifications, pushNotification } = useContext(DataContext);
    const { user } = useContext(AuthContext);

    const [showForm, setShowForm] = useState(false);
    const [newNotif, setNewNotif] = useState({ title: '', description: '', type: 'Info' });
    const [reasons, setReasons] = useState({});

    const filteredNotifications = notifications
        .filter(n => n.recipientId === null || n.recipientId === user?._id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

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
                    <h2 style={{ marginBottom: 4, color: '#0F172A', fontWeight: 800 }}>Notifications &amp; Announcements</h2>
                    <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Stay updated with the latest campus placement news.</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Bell size={16} style={{ color: '#2563EB' }} />
                        <h3 style={{ margin: 0, fontSize: 15, color: '#0F172A' }}>Push New Notification (Global)</h3>
                    </div>
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
                <div className="glass-panel p-4" style={{ textAlign: 'center', color: '#64748B', padding: '48px 24px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                    <p style={{ margin: 0, color: '#475569', fontWeight: 500 }}>No notifications yet.</p>
                </div>
            ) : (
                filteredNotifications.map(notif => {
                    const ts = typeStyle(notif.type);
                    const myResponse = notif.responses?.[user._id];
                    const isUnread = user?.role === 'student' && !notif.read && !myResponse;

                    return (
                        <div key={notif.id} style={{
                            background: '#FFFFFF',
                            border: `1px solid ${isUnread ? '#2563EB' : '#E2E8F0'}`,
                            borderLeft: `4px solid ${isUnread ? '#2563EB' : '#E2E8F0'}`,
                            borderRadius: 14,
                            padding: '20px 22px',
                            boxShadow: isUnread ? '0 2px 12px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                            background: isUnread ? '#F8FBFF' : '#FFFFFF',
                            transition: 'box-shadow 0.2s',
                        }}>
                            {/* Top row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10, background: ts.bg, border: `1px solid ${ts.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Bell size={17} style={{ color: ts.color }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <h3 style={{ margin: 0, fontSize: 15, color: '#0F172A' }}>{notif.title}</h3>
                                            <span style={{
                                                background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`,
                                                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0
                                            }}>
                                                {notif.type}
                                            </span>
                                            {isUnread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }}></span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                                            {new Date(notif.date).toLocaleDateString()} · {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.6, color: '#334155' }}>{notif.description}</p>
                                </div>
                            </div>

                            {/* Student actions section */}
                            {user?.role === 'student' && (
                                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EEF2FF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {notif.type === 'Action Required' ? (
                                        myResponse ? (
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                                padding: '7px 14px', borderRadius: 8,
                                                background: myResponse.interested ? '#ECFDF5' : '#FEF2F2',
                                                color: myResponse.interested ? '#065F46' : '#B91C1C',
                                                border: `1px solid ${myResponse.interested ? '#A7F3D0' : '#FECACA'}`,
                                                fontSize: 13, fontWeight: 600,
                                            }}>
                                                {myResponse.interested ? <Check size={14}/> : <X size={14}/>}
                                                Responded: {myResponse.interested ? 'Interested' : 'Not Interested'}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, flex: 1 }}>
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <button className="btn btn-success" style={{ flex: 1, padding: '8px 14px', fontSize: 13 }} onClick={() => handleRespond(notif.id, true)}>
                                                        <Check size={14} /> Interested
                                                    </button>
                                                    <button className="btn btn-danger" style={{ flex: 1, padding: '8px 14px', fontSize: 13 }} onClick={() => handleRespond(notif.id, false)}>
                                                        <X size={14} /> Not Interested
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ fontSize: 12 }}
                                                    placeholder="Reason (if not interested)"
                                                    value={reasons[notif.id] || ''}
                                                    onChange={e => setReasons({ ...reasons, [notif.id]: e.target.value })}
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <div>
                                            {notif.read ? (
                                                <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Check size={13} /> Read
                                                </span>
                                            ) : (
                                                <button className="btn btn-glass" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => markAsRead(notif.id)}>
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Admin: responses count */}
                            {user?.role === 'admin' && notif.type === 'Action Required' && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EEF2FF', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#64748B' }}>
                                        Total responses: <strong style={{ color: '#0F172A' }}>{Object.keys(notif.responses || {}).length}</strong>
                                    </span>
                                    <span style={{ fontSize: 13, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Check size={13} /> Interested: {Object.values(notif.responses || {}).filter(r => r.interested).length}
                                    </span>
                                    <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <X size={13} /> Declined: {Object.values(notif.responses || {}).filter(r => !r.interested).length}
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
