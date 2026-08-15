import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import AppContext from '../../context/AppContext';
import { addSavingsContribution, getBudgets, getIncomes } from '../../APIs/api';

const AddSavingsModal = ({ budget: propBudget, onClose: propOnClose, onSuccess }) => {
    const { savingsModal, selectedSavingsBudget, toggleSavingsModal, setBudgets, setIncomes, fetchTotalSavings } = useContext(AppContext);

    const activeBudget = propBudget || selectedSavingsBudget;
    const isModalOpen = propBudget ? true : (savingsModal && Boolean(selectedSavingsBudget));

    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!activeBudget) {
        return null;
    }

    const handleClose = () => {
        if (propOnClose) {
            propOnClose();
        }
        toggleSavingsModal(null);
    };

    const remainingTarget = activeBudget.remaining_amount !== undefined && activeBudget.remaining_amount !== null
        ? activeBudget.remaining_amount
        : Math.max(
            0,
            (activeBudget.target_amount || activeBudget.budget_amount || 0) - (activeBudget.spent_amount || activeBudget.saved_amount || 0)
        );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid contribution amount greater than ₹0.');
            return;
        }

        if (numAmount > remainingTarget) {
            setError(`Contribution amount (₹${numAmount.toLocaleString('en-IN')}) cannot exceed remaining target (₹${remainingTarget.toLocaleString('en-IN')}).`);
            return;
        }

        setLoading(true);

        try {
            await addSavingsContribution({
                budget_id: activeBudget.budget_id || activeBudget.id,
                amount: numAmount,
                credited_on: new Date(date).toISOString(),
                description: description.trim() || 'Fresh Goal Contribution'
            });

            // Refresh all affected context state instantly without page reload
            const [updatedBudgets, updatedIncomes] = await Promise.all([
                getBudgets(),
                getIncomes()
            ]);

            if (updatedBudgets) setBudgets(updatedBudgets);
            if (updatedIncomes) setIncomes(updatedIncomes);
            if (fetchTotalSavings) await fetchTotalSavings();

            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error('[AddSavingsModal Error]:', err);
            setError(err.message || 'Failed to process savings contribution.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAmount = (ratio) => {
        const val = Math.round(remainingTarget * ratio);
        if (val > 0) setAmount(val.toString());
    };

    return createPortal(
        <div 
            className={isModalOpen ? "modal-overlay active" : "modal-overlay"}
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    handleClose();
                }
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem',
                opacity: isModalOpen ? 1 : 0,
                pointerEvents: isModalOpen ? 'all' : 'none',
                transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease'
            }}
        >
            <div 
                className="modal-box glass-card"
                style={{
                    background: 'rgba(30, 41, 59, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    padding: '2rem',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                    transform: isModalOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                            + Add Savings Contribution
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
                            Goal: <strong style={{ color: '#38bdf8' }}>{activeBudget.budget_name}</strong>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Info Card */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem'
                }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Source Account</span>
                        <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>{activeBudget.income_source || 'Checking Account'}</strong>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Remaining Target</span>
                        <strong style={{ fontSize: '0.95rem', color: '#f43f5e' }}>₹{remainingTarget.toLocaleString('en-IN')}</strong>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        marginBottom: '1.25rem'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Amount Saved (₹) *
                        </label>
                        <input
                            type="number"
                            step="any"
                            placeholder={`Max ₹${remainingTarget}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#f8fafc',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                            }}
                        />
                        {remainingTarget > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => handleQuickAmount(0.25)}
                                    style={{
                                        flex: '1 1 0%',
                                        padding: '0.45rem 0.6rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#f8fafc',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    25%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickAmount(0.50)}
                                    style={{
                                        flex: '1 1 0%',
                                        padding: '0.45rem 0.6rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        color: '#f8fafc',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    50%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickAmount(1.00)}
                                    style={{
                                        flex: '1.4 1 0%',
                                        padding: '0.45rem 0.75rem',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        borderRadius: '8px',
                                        background: 'rgba(56, 189, 248, 0.15)',
                                        border: '1px solid rgba(56, 189, 248, 0.35)',
                                        color: '#38bdf8',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Full Remaining
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Contribution Date *
                        </label>
                        <input
                            type="date"
                            value={date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#f8fafc',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Note / Description (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Monthly salary contribution"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#f8fafc',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#94a3b8',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                color: '#ffffff',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            {loading ? 'Processing...' : 'Confirm Contribution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddSavingsModal;
