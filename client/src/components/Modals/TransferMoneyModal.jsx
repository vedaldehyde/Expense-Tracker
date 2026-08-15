import React, { useContext, useState } from 'react';
import AppContext from '../../context/AppContext';
import { getIncomes, transferBetweenAccounts } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const TransferMoneyModal = () => {
    const { 
        transferModal, 
        toggleTransferModal, 
        incomes, 
        setIncomes, 
        fetchAccountTransfers 
    } = useContext(AppContext);
    
    const { showToast } = useToast();

    const [fromIncomeId, setFromIncomeId] = useState('');
    const [toIncomeId, setToIncomeId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const incomeList = incomes?.incomesList || [];

    const handleFromAccountChange = (e) => {
        const selectedId = e.target.value;
        setFromIncomeId(selectedId);
        if (toIncomeId === selectedId) {
            setToIncomeId('');
        }
        if (errors.from_income_id) {
            setErrors(prev => ({ ...prev, from_income_id: null }));
        }
    };

    const handleToAccountChange = (e) => {
        setToIncomeId(e.target.value);
        if (errors.to_income_id) {
            setErrors(prev => ({ ...prev, to_income_id: null }));
        }
    };

    const selectedFromAccountObj = incomeList.find(acc => acc.id === fromIncomeId);
    const availableBalance = selectedFromAccountObj ? (selectedFromAccountObj.balance || 0) : 0;

    const validateForm = () => {
        const errs = {};
        if (!fromIncomeId) {
            errs.from_income_id = 'Please select a source account.';
        }
        if (!toIncomeId) {
            errs.to_income_id = 'Please select a destination account.';
        }
        if (fromIncomeId && toIncomeId && fromIncomeId === toIncomeId) {
            errs.to_income_id = 'Source and destination accounts must be different.';
        }
        const parsedAmount = Number(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            errs.amount = 'Please enter a valid amount greater than 0.';
        } else if (parsedAmount > availableBalance) {
            errs.amount = `Amount exceeds available balance (₹${availableBalance.toLocaleString('en-IN')}).`;
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Please fix validation errors before transferring.', 'error');
            return;
        }

        // Disable button immediately to prevent double submissions
        setLoading(true);
        try {
            await transferBetweenAccounts({
                from_income_id: fromIncomeId,
                to_income_id: toIncomeId,
                amount: Number(amount),
                description: description.trim() || 'Account Transfer'
            });

            showToast('Account transfer completed successfully!', 'success');

            // Refresh account balances and transfer history
            const latestIncomeData = await getIncomes();
            setIncomes(latestIncomeData);
            await fetchAccountTransfers();

            toggleTransferModal();
            setFromIncomeId('');
            setToIncomeId('');
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error('Transfer submission error:', error);
            showToast(error.message || 'Transfer failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className={transferModal ? "modal-overlay active" : "modal-overlay"} 
            id="transfer-money-modal"
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay') && !loading) toggleTransferModal();
            }}
        >
            <div className="modal-box" style={{ maxWidth: '520px' }}>
                <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>💸</span> Transfer Money Between Accounts
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                            Move funds between your accounts (Net wealth & budget limits remain unchanged)
                        </span>
                    </div>
                    <button onClick={toggleTransferModal} className="modal-close-btn" disabled={loading}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        
                        {/* Source Account Dropdown */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="from_income_id" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>🏛️</span> From Account (Source) *
                            </label>
                            <select 
                                id="from_income_id" 
                                className={`select-field ${errors.from_income_id ? "input-error" : ""}`}
                                value={fromIncomeId}
                                onChange={handleFromAccountChange}
                                disabled={loading}
                                style={{ width: '100%' }}
                            >
                                <option value="" disabled>Select Source Account</option>
                                {incomeList.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.source} (Available: ₹{(acc.balance || 0).toLocaleString('en-IN')})
                                    </option>
                                ))}
                            </select>
                            {errors.from_income_id && <span className="field-error-text">{errors.from_income_id}</span>}
                        </div>

                        {/* Destination Account Dropdown */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="to_income_id" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>🎯</span> To Account (Destination) *
                            </label>
                            <select 
                                id="to_income_id" 
                                className={`select-field ${errors.to_income_id ? "input-error" : ""}`}
                                value={toIncomeId}
                                onChange={handleToAccountChange}
                                disabled={loading || !fromIncomeId}
                                style={{ width: '100%' }}
                            >
                                <option value="" disabled>{fromIncomeId ? "Select Destination Account" : "Select Source Account First"}</option>
                                {incomeList.filter(acc => acc.id !== fromIncomeId).map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.source} (Current: ₹{(acc.balance || 0).toLocaleString('en-IN')})
                                    </option>
                                ))}
                            </select>
                            {errors.to_income_id && <span className="field-error-text">{errors.to_income_id}</span>}
                        </div>

                        {/* Transfer Amount Input */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="transfer-amount" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>💰</span> Transfer Amount (₹) *
                            </label>
                            <input 
                                type="number" 
                                id="transfer-amount"
                                step="0.01" 
                                min="0.01" 
                                className={`input-field ${errors.amount ? "input-error" : ""}`}
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                                }}
                                disabled={loading}
                                style={{ paddingLeft: '1rem' }}
                            />
                            {selectedFromAccountObj && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                    Available in {selectedFromAccountObj.source}: <strong>₹{availableBalance.toLocaleString('en-IN')}</strong>
                                </span>
                            )}
                            {errors.amount && <span className="field-error-text">{errors.amount}</span>}
                        </div>

                        {/* Description Input */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="transfer-description" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>✏️</span> Remarks / Description (Optional)
                            </label>
                            <input 
                                type="text"
                                id="transfer-description"
                                className="input-field"
                                placeholder="e.g. Monthly allocation, Cash withdrawal"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                style={{ paddingLeft: '1rem' }}
                            />
                        </div>

                    </div>
                    <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" className="btn btn-secondary" onClick={toggleTransferModal} disabled={loading}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading || !fromIncomeId || !toIncomeId || !amount}
                            style={{ padding: '0.6rem 1.5rem' }}
                        >
                            {loading ? <Spinner size="small" text="Transferring..." /> : 'Transfer Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferMoneyModal;
