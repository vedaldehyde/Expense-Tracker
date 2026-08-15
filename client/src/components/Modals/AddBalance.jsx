import React, { useContext, useState } from 'react';
import AppContext from '../../context/AppContext';
import { getIncomes, submitIncomeForm, updateIncomeForm } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const AddBalance = () => {
    const { addBalance, toggleBalanceModal, setIncomes, incomes, selectedAccount, setSelectedAccount } = useContext(AppContext);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = (data) => {
        const errs = {};
        if (!selectedAccount) {
            errs.account_id = 'Please select an account or create a new source.';
        }
        if (selectedAccount === 'new' && (!data.source || !data.source.trim())) {
            errs.source = 'New account source name is required.';
        }
        if (!data.balance || isNaN(data.balance) || Number(data.balance) <= 0) {
            errs.balance = 'Please enter a valid amount greater than 0.';
        }
        return errs;
    };

    const handleBalanceSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const validationErrors = validateForm(data);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Please fix the form errors before saving.', 'error');
            return;
        }

        setLoading(true);
        try {
            if (selectedAccount === 'new') {
                await submitIncomeForm(data);
                showToast('New income account created!', 'success');
            } else {
                await updateIncomeForm(data);
                showToast('Account balance updated successfully!', 'success');
            }

            const latestIncomeData = await getIncomes();
            setIncomes(latestIncomeData);

            toggleBalanceModal();
            e.target.reset();
            setSelectedAccount('');
        } catch (error) {
            console.error("Balance submit error:", error);
            showToast(error.message || 'Failed to update balance. Try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className={addBalance ? "modal-overlay active" : "modal-overlay"} 
            id="balance-modal"
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay')) toggleBalanceModal();
            }}
        >
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Add Account Balance</h3>
                    <button className="modal-close-btn" onClick={toggleBalanceModal} id="close-balance-modal-btn">&times;</button>
                </div>
                <form id="add-balance-form" onSubmit={handleBalanceSubmit} noValidate>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="balance-account-select">Select Account *</label>
                            <select 
                                id="balance-account-select" 
                                name="account_id" 
                                className={`select-field ${errors.account_id ? "input-error" : ""}`}
                                value={selectedAccount} 
                                onChange={(e) => setSelectedAccount(e.target.value)}
                            >
                                <option value="" disabled>-- Select Income Source --</option>
                                {(incomes?.incomesList || []).map(income => (
                                    <option key={income.id} value={income.id}>
                                        {income.source}
                                    </option>
                                ))}
                                <option value="new">+ Create new income source</option>
                            </select>
                            {errors.account_id && <span className="field-error-text">{errors.account_id}</span>}
                        </div>

                        {selectedAccount === 'new' && (
                            <div className="form-group" id="new-account-name-group">
                                <label htmlFor="new-account-name">New Account Source Name *</label>
                                <input 
                                    type="text" 
                                    id="new-account-name" 
                                    name="source" 
                                    className={`input-field ${errors.source ? "input-error" : ""}`}
                                    placeholder="e.g. Axis Bank, Salary Wallet" 
                                />
                                {errors.source && <span className="field-error-text">{errors.source}</span>}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="balance-amount-input">Amount to Add (₹) *</label>
                            <input 
                                type="number" 
                                id="balance-amount-input" 
                                name="balance" 
                                min="0.01" 
                                step="0.01" 
                                className={`input-field ${errors.balance ? "input-error" : ""}`}
                                placeholder="0.00" 
                            />
                            {errors.balance && <span className="field-error-text">{errors.balance}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="salary-account-select">Salary Account *</label>
                            <select name="is_salary" id="salary-account-select" className="select-field" defaultValue="true">
                                <option value="true">Yes (Primary Salary)</option>
                                <option value="false">No (Secondary Source)</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={toggleBalanceModal} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <Spinner size="small" text="Updating..." /> : 'Add Balance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBalance;