import React, { useContext, useState } from 'react';
import AppContext from '../../context/AppContext';
import { submitFeedback } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const FeedbackModal = () => {
    const { feedbackModal, toggleFeedbackModal } = useContext(AppContext);
    const { showToast } = useToast();

    const [feedbackType, setFeedbackType] = useState('IMPROVEMENT');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleClose = () => {
        setErrors({});
        setSubject('');
        setMessage('');
        setRating(0);
        setHoverRating(0);
        setFeedbackType('IMPROVEMENT');
        toggleFeedbackModal();
    };

    const validateForm = () => {
        const errs = {};
        if (!feedbackType) {
            errs.feedbackType = 'Please select a feedback type.';
        }
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            errs.message = 'Feedback message is required.';
        } else if (trimmedMessage.length > 2000) {
            errs.message = 'Message cannot exceed 2000 characters.';
        }

        if (subject.trim().length > 150) {
            errs.subject = 'Subject cannot exceed 150 characters.';
        }

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Please fix the form errors before submitting.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                feedback_type: feedbackType,
                subject: subject.trim() || null,
                message: message.trim(),
                rating: rating > 0 ? rating : null
            };

            await submitFeedback(payload);
            showToast('Thanks! Your feedback has been submitted.', 'success');
            handleClose();
        } catch (error) {
            console.error('Feedback submit error:', error);
            showToast(error.message || 'Failed to submit feedback. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!feedbackModal) return null;

    return (
        <div 
            className="modal-overlay active" 
            id="feedback-modal"
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay') && !loading) handleClose();
            }}
        >
            <div className="modal-box" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <h3>Help us improve SpendWise AI</h3>
                    </div>
                    <button className="modal-close-btn" onClick={handleClose} disabled={loading}>&times;</button>
                </div>

                <form id="feedback-form" onSubmit={handleSubmit} noValidate>
                    <div className="modal-body" style={{ gap: '1.2rem' }}>
                        {/* Feedback Type */}
                        <div className="form-group">
                            <label htmlFor="feedback-type-select">Feedback Type *</label>
                            <select
                                id="feedback-type-select"
                                className={`select-field ${errors.feedbackType ? 'input-error' : ''}`}
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                                disabled={loading}
                            >
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="BUG">Bug Report</option>
                                <option value="FEATURE_REQUEST">Feature Request</option>
                                <option value="OTHER">Other</option>
                            </select>
                            {errors.feedbackType && <span className="field-error-text">{errors.feedbackType}</span>}
                        </div>

                        {/* Subject */}
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="feedback-subject-input">Subject (optional)</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subject.length}/150</span>
                            </div>
                            <input
                                type="text"
                                id="feedback-subject-input"
                                className={`input-field ${errors.subject ? 'input-error' : ''}`}
                                placeholder="Brief summary of your feedback"
                                maxLength={150}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={loading}
                            />
                            {errors.subject && <span className="field-error-text">{errors.subject}</span>}
                        </div>

                        {/* Message */}
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="feedback-message-input">Message *</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{message.length}/2000</span>
                            </div>
                            <textarea
                                id="feedback-message-input"
                                className={`input-field ${errors.message ? 'input-error' : ''}`}
                                placeholder="Describe your experience, feature request, or issue in detail..."
                                rows={5}
                                maxLength={2000}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={loading}
                                style={{ resize: 'vertical', minHeight: '110px' }}
                            ></textarea>
                            {errors.message && <span className="field-error-text">{errors.message}</span>}
                        </div>

                        {/* Star Rating */}
                        <div className="form-group">
                            <label>Rating (optional)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = star <= (hoverRating || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(rating === star ? 0 : star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            disabled={loading}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '1.6rem',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                color: active ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                                                transition: 'transform 0.15s ease, color 0.15s ease',
                                                padding: '2px',
                                                lineHeight: 1,
                                                transform: active ? 'scale(1.15)' : 'scale(1)'
                                            }}
                                            title={`${star} Star${star > 1 ? 's' : ''}`}
                                        >
                                            ★
                                        </button>
                                    );
                                })}
                                {rating > 0 && (
                                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '600', marginLeft: '0.5rem' }}>
                                        {rating}/5 Stars
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <Spinner size="small" text="Submitting..." /> : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
