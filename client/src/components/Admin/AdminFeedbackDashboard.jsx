import React, { useState, useEffect } from 'react';
import { getAllFeedbackAdmin, updateFeedbackStatusAdmin } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const AdminFeedbackDashboard = () => {
    const { showToast } = useToast();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal state for responding
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [responseStatus, setResponseStatus] = useState('REVIEWED');
    const [adminNotes, setAdminNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchFeedbacks = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllFeedbackAdmin();
            setFeedbacks(data || []);
        } catch (error) {
            console.error('Failed to fetch admin feedbacks:', error);
            showToast(error.message || 'Failed to load feedback list.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const handleOpenRespondModal = (fb) => {
        setSelectedFeedback(fb);
        setResponseStatus(fb.status || 'REVIEWED');
        setAdminNotes(fb.admin_notes || '');
    };

    const handleCloseRespondModal = () => {
        setSelectedFeedback(null);
        setAdminNotes('');
    };

    const handleSaveResponse = async (e) => {
        e.preventDefault();
        if (!selectedFeedback) return;

        setSubmitting(true);
        try {
            await updateFeedbackStatusAdmin({
                feedback_id: selectedFeedback.id,
                status: responseStatus,
                admin_notes: adminNotes.trim()
            });

            showToast('Feedback response and status updated!', 'success');
            handleCloseRespondModal();
            fetchFeedbacks();
        } catch (error) {
            console.error('Failed to update feedback:', error);
            showToast(error.message || 'Failed to update feedback status.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Statistics
    const totalCount = feedbacks.length;
    const newCount = feedbacks.filter(f => f.status === 'NEW').length;
    const inProgressCount = feedbacks.filter(f => f.status === 'IN_PROGRESS' || f.status === 'PLANNED').length;
    const doneCount = feedbacks.filter(f => f.status === 'DONE').length;

    const ratedFeedbacks = feedbacks.filter(f => f.rating && f.rating > 0);
    const avgRating = ratedFeedbacks.length > 0 
        ? (ratedFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / ratedFeedbacks.length).toFixed(1) 
        : 'N/A';

    // Filtering logic
    const filteredFeedbacks = feedbacks.filter(f => {
        if (typeFilter !== 'ALL' && f.feedback_type?.toUpperCase() !== typeFilter) return false;
        if (statusFilter !== 'ALL' && f.status?.toUpperCase() !== statusFilter) return false;
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchName = f.user_name?.toLowerCase().includes(query);
            const matchEmail = f.user_email?.toLowerCase().includes(query);
            const matchSubject = f.subject?.toLowerCase().includes(query);
            const matchMsg = f.message?.toLowerCase().includes(query);
            return matchName || matchEmail || matchSubject || matchMsg;
        }

        return true;
    });

    const getTypeBadgeClass = (type) => {
        switch (type?.toUpperCase()) {
            case 'BUG': return { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', label: 'Bug Report' };
            case 'FEATURE_REQUEST': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', label: 'Feature Request' };
            case 'IMPROVEMENT': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: 'Improvement' };
            default: return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: 'Other' };
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'NEW': return { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' };
            case 'REVIEWED': return { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' };
            case 'PLANNED': return { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' };
            case 'IN_PROGRESS': return { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: '#fff' };
            case 'DONE': return { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' };
            case 'REJECTED': return { bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', color: '#fff' };
            default: return { bg: 'rgba(255,255,255,0.1)', color: '#fff' };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section className="dashboard-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👑</span> Admin Feedback Dashboard
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Review user queries, feature requests, and bug reports. Respond with official updates.
                    </p>
                </div>
                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={fetchFeedbacks}
                    disabled={loading}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="stat-card">
                    <span className="stat-title">Total Feedbacks</span>
                    <span className="stat-value">{totalCount}</span>
                </div>
                <div className="stat-card" style={{ borderColor: newCount > 0 ? 'rgba(245, 158, 11, 0.4)' : 'inherit' }}>
                    <span className="stat-title">New / Unreviewed</span>
                    <span className="stat-value" style={{ color: newCount > 0 ? '#f59e0b' : 'inherit' }}>{newCount}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-title">Planned / In Progress</span>
                    <span className="stat-value" style={{ color: '#c084fc' }}>{inProgressCount}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-title">Completed / Done</span>
                    <span className="stat-value" style={{ color: '#34d399' }}>{doneCount}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-title">Avg User Rating</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>
                        {avgRating} {avgRating !== 'N/A' ? '⭐' : ''}
                    </span>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ flex: '1 1 240px' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by user name, email, subject or text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                </div>
                <div className="filter-select-wrapper" style={{ flex: '0 0 160px' }}>
                    <select
                        className="select-field"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="BUG">Bug Reports</option>
                        <option value="FEATURE_REQUEST">Feature Requests</option>
                        <option value="IMPROVEMENT">Improvements</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div className="filter-select-wrapper" style={{ flex: '0 0 160px' }}>
                    <select
                        className="select-field"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Feedbacks Content List */}
            {loading ? (
                <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <Spinner text="Loading feedback items..." />
                </div>
            ) : filteredFeedbacks.length === 0 ? (
                <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-muted)'
                }}>
                    No feedback records match your filters.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFeedbacks.map((fb) => {
                        const typeInfo = getTypeBadgeClass(fb.feedback_type);
                        const statusStyle = getStatusBadgeStyle(fb.status);
                        const userAvatar = fb.user_name ? fb.user_name.charAt(0).toUpperCase() : 'U';

                        return (
                            <div 
                                key={fb.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: fb.status === 'NEW' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.85rem',
                                    transition: 'transform 0.15s ease, border-color 0.15s ease'
                                }}
                            >
                                {/* Top Row: User info & Status Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>{userAvatar}</div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{fb.user_name}</span>
                                                <span style={{
                                                    backgroundColor: typeInfo.bg,
                                                    color: typeInfo.color,
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    padding: '0.2rem 0.55rem',
                                                    borderRadius: '12px'
                                                }}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fb.user_email} • {formatDate(fb.created_at)}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {fb.rating && fb.rating > 0 && (
                                            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}>
                                                {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)} ({fb.rating}/5)
                                            </span>
                                        )}
                                        <span style={{
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            padding: '0.3rem 0.75rem',
                                            borderRadius: '6px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {fb.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Subject & Message Body */}
                                <div>
                                    {fb.subject && (
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                                            {fb.subject}
                                        </h4>
                                    )}
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.5',
                                        background: 'rgba(0, 0, 0, 0.15)',
                                        padding: '0.85rem',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        {fb.message}
                                    </p>
                                </div>

                                {/* Official Admin Response Section */}
                                {fb.admin_notes && (
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        borderLeft: '3px solid #10b981',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0 8px 8px 0',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '0.2rem' }}>
                                            💬 Official Admin Response:
                                        </div>
                                        <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                            {fb.admin_notes}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleOpenRespondModal(fb)}
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.35rem 0.85rem',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            color: '#fff',
                                            border: 'none'
                                        }}
                                    >
                                        ✏️ Respond & Update Status
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Response Modal */}
            {selectedFeedback && (
                <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay') && !submitting) handleCloseRespondModal(); }}>
                    <div className="modal-box" style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h3>Respond to Feedback</h3>
                            <button className="modal-close-btn" onClick={handleCloseRespondModal} disabled={submitting}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveResponse}>
                            <div className="modal-body" style={{ gap: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '6px' }}>
                                    <strong>User:</strong> {selectedFeedback.user_name} ({selectedFeedback.user_email})<br />
                                    <strong>Type:</strong> {selectedFeedback.feedback_type}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="response-status-select">Update Status *</label>
                                    <select
                                        id="response-status-select"
                                        className="select-field"
                                        value={responseStatus}
                                        onChange={(e) => setResponseStatus(e.target.value)}
                                        disabled={submitting}
                                    >
                                        <option value="NEW">NEW (Unreviewed)</option>
                                        <option value="REVIEWED">REVIEWED (Acknowledged)</option>
                                        <option value="PLANNED">PLANNED (Added to roadmap)</option>
                                        <option value="IN_PROGRESS">IN PROGRESS (Working on it)</option>
                                        <option value="DONE">DONE (Resolved/Implemented)</option>
                                        <option value="REJECTED">REJECTED (Declined)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="admin-notes-textarea">Admin Response / Internal Notes</label>
                                    <textarea
                                        id="admin-notes-textarea"
                                        className="input-field"
                                        placeholder="Add an official response or note for this query..."
                                        rows={4}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        disabled={submitting}
                                        style={{ resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseRespondModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <Spinner size="small" text="Saving..." /> : 'Save Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminFeedbackDashboard;
