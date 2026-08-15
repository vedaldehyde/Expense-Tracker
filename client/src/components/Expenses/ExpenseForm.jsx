import React, { useContext, useState } from 'react';
import AppContext from '../../context/AppContext';
import { createCategory, getBudgets, getExpenseCategories, getExpenses, getIncomes, submitExpenseForm, submitSavingsFundedExpense } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const ExpenseForm = () => {
    const [incomeId, setIncomeId] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customCategoryName, setCustomCategoryName] = useState("");
    const [priorityType, setPriorityType] = useState("normal");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Shortfall modal state
    const [pendingData, setPendingData] = useState(null);
    const [shortfallInfo, setShortfallInfo] = useState(null);

    const { 
        expenseModal, 
        toggleExpenseModal, 
        expenseCategories, 
        setExpenseCategories, 
        setExpenses, 
        setBudgets, 
        setIncomes, 
        setTotalIncome, 
        incomes, 
        budgets,
        unallocatedSavings,
        fetchTotalSavings
    } = useContext(AppContext);

    const { showToast } = useToast();

    const activeBudgets = (budgets || []).filter(budget => budget.is_active);
    const hasActiveBudget = activeBudgets.some(budget => budget.income_id === incomeId);

    const validateForm = (data) => {
        const errs = {};
        if (!data.expense_title || !data.expense_title.trim()) {
            errs.expense_title = 'Expense title is required.';
        }
        if (!data.expense_amount || isNaN(data.expense_amount) || Number(data.expense_amount) <= 0) {
            errs.expense_amount = 'Please enter a valid amount greater than 0.';
        }
        if (!selectedCategory) {
            errs.expense_category = 'Category selection is required.';
        }
        if (selectedCategory === "new" && (!customCategoryName || !customCategoryName.trim())) {
            errs.custom_category = 'Custom category name is required.';
        }
        if (!data.income_source) {
            errs.income_source = 'Income source selection is required.';
        }
        return errs;
    };

    const processExpenseSubmission = async (data, isSavingsFunded = false) => {
        setLoading(true);
        try {
            let finalCategoryId = selectedCategory;

            if (selectedCategory === "new") {
                const createdCat = await createCategory(customCategoryName.trim());
                finalCategoryId = createdCat.id;
                
                const updatedCategories = await getExpenseCategories();
                if (setExpenseCategories) {
                    setExpenseCategories(updatedCategories);
                }
            }

            data.expense_category = finalCategoryId;
            data.priority_type = priorityType;

            if (isSavingsFunded) {
                await submitSavingsFundedExpense(data);
                showToast('Savings-funded expense recorded successfully!', 'success');
            } else {
                await submitExpenseForm(data);
                showToast('Expense created successfully!', 'success');
            }
            
            const [latestExpenses, latestBudgetData, latestIncomeData] = await Promise.all([
                getExpenses(),
                getBudgets(),
                getIncomes()
            ]);

            setExpenses(latestExpenses);
            setBudgets(latestBudgetData);

            if (setIncomes && latestIncomeData?.incomesList) {
                setIncomes(latestIncomeData);
            }
            if (setTotalIncome && latestIncomeData?.total_balance !== undefined) {
                setTotalIncome(latestIncomeData.total_balance);
            }

            if (fetchTotalSavings) {
                await fetchTotalSavings();
            }

            setPendingData(null);
            setShortfallInfo(null);
            toggleExpenseModal();
            setIncomeId("");
            setSelectedCategory("");
            setCustomCategoryName("");
            setPriorityType("normal");
        } catch (error) {
            console.error('Expense submit error:', error);
            showToast(error.message || 'Failed to process expense. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const validationErrors = validateForm(data);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Please fix the validation errors in the form.', 'error');
            return;
        }

        const selectedIncomeObj = (incomes?.incomesList || []).find(i => i.id === data.income_source);
        const availableLiquid = selectedIncomeObj ? (selectedIncomeObj.balance || 0) : 0;
        const requestedAmount = Number(data.expense_amount);

        // Check if liquid account balance is insufficient
        if (requestedAmount > availableLiquid) {
            const shortfall = requestedAmount - Math.max(0, availableLiquid);

            if (unallocatedSavings >= shortfall) {
                // Prompt user for explicit savings fallback confirmation
                setPendingData(data);
                setShortfallInfo({
                    accountName: selectedIncomeObj?.source || 'Selected Account',
                    availableLiquid: Math.max(0, availableLiquid),
                    requestedAmount,
                    shortfall,
                    availableSavings: unallocatedSavings
                });
                return;
            } else {
                showToast(`Insufficient liquid balance (₹${availableLiquid.toLocaleString('en-IN')}) and unallocated savings (₹${unallocatedSavings.toLocaleString('en-IN')}) to cover ₹${shortfall.toLocaleString('en-IN')} shortfall.`, 'error');
                return;
            }
        }

        // Standard flow when liquid balance is sufficient
        await processExpenseSubmission(data, false);
    };

    return (
        <div 
            className={expenseModal ? "modal-overlay active" : "modal-overlay"} 
            id="expense-modal"
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay')) toggleExpenseModal();
            }}
        >
            <div className="modal-box" style={{ maxWidth: '560px' }}>
                <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <h3 id="expense-modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>💳</span> Add Expense
                        </h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                            Record a new transaction to sync with your balance & budgets
                        </span>
                    </div>
                    <button onClick={toggleExpenseModal} className="modal-close-btn" id="close-expense-modal-btn">&times;</button>
                </div>

                {/* Shortfall Fallback Confirmation Dialog */}
                {shortfallInfo && pendingData ? (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: '700', fontSize: '1rem' }}>
                                <span>⚠️</span> Insufficient Account Balance
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                                The expense amount (<strong>₹{shortfallInfo.requestedAmount.toLocaleString('en-IN')}</strong>) exceeds available liquid balance in <strong>{shortfallInfo.accountName}</strong>.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                                <div>
                                    <span style={{ color: '#94a3b8', display: 'block' }}>Available Liquid</span>
                                    <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>₹{shortfallInfo.availableLiquid.toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#94a3b8', display: 'block' }}>Required Shortfall</span>
                                    <strong style={{ color: '#f43f5e', fontSize: '0.95rem' }}>₹{shortfallInfo.shortfall.toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#94a3b8', display: 'block' }}>Unallocated Savings</span>
                                    <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>₹{shortfallInfo.availableSavings.toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#94a3b8', display: 'block' }}>Goal Savings (Protected)</span>
                                    <strong style={{ color: '#a855f7', fontSize: '0.95rem' }}>Protected 🔒</strong>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                                Would you like to use <strong>₹{shortfallInfo.shortfall.toLocaleString('en-IN')}</strong> from your <strong>Unallocated Savings Vault</strong> to cover this shortfall?
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => { setShortfallInfo(null); setPendingData(null); }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={() => processExpenseSubmission(pendingData, true)}
                                disabled={loading}
                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none' }}
                            >
                                {loading ? <Spinner size="small" text="Processing..." /> : `Use ₹${shortfallInfo.shortfall.toLocaleString('en-IN')} Savings & Submit`}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form id="add-expense-form" onSubmit={handleExpenseSubmit} noValidate>
                        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            
                            {/* Title Input */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="expense_title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>📝</span> Expense Title *
                                </label>
                                <input 
                                    type="text" 
                                    id="expense_title" 
                                    name='expense_title' 
                                    className={`input-field ${errors.expense_title ? "input-error" : ""}`}
                                    placeholder="e.g. Grocery Store, Rent Payment"
                                    style={{ paddingLeft: '1rem' }}
                                />
                                {errors.expense_title && <span className="field-error-text">{errors.expense_title}</span>}
                            </div>
                            
                            {/* Amount & Category */}
                            <div className="form-row" style={{ gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="expense-amount" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>💰</span> Amount (₹) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name='expense_amount' 
                                        id="expense-amount" 
                                        step="0.01" 
                                        min="0.01" 
                                        className={`input-field ${errors.expense_amount ? "input-error" : ""}`}
                                        placeholder="0.00"
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                    {errors.expense_amount && <span className="field-error-text">{errors.expense_amount}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="expense-category" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>🏷️</span> Category *
                                    </label>
                                    <select 
                                        id="expense-category" 
                                        className={`select-field ${errors.expense_category ? "input-error" : ""}`}
                                        name='expense_category'
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            if (errors.expense_category) {
                                                setErrors(prev => ({ ...prev, expense_category: null }));
                                            }
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="" disabled>Select category</option>
                                        {expenseCategories.map(category => (
                                            <option key={category.id} value={category.id}>{category.category_type}</option>
                                        ))}
                                        <option value="new">+ Create Custom Category...</option>
                                    </select>
                                    {errors.expense_category && <span className="field-error-text">{errors.expense_category}</span>}
                                </div>
                            </div>

                            {/* Inline Custom Category Field */}
                            {selectedCategory === "new" && (
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px dashed var(--primary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.75rem'
                                }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.35rem', display: 'block' }}>
                                        + New Category Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        className={`input-field ${errors.custom_category ? "input-error" : ""}`}
                                        placeholder="e.g., Subscriptions, Pet Care"
                                        value={customCategoryName}
                                        onChange={(e) => setCustomCategoryName(e.target.value)}
                                        style={{ padding: '0.55rem 0.8rem', fontSize: '0.88rem' }}
                                    />
                                    {errors.custom_category && <span className="field-error-text" style={{ marginTop: '0.25rem' }}>{errors.custom_category}</span>}
                                </div>
                            )}

                            {/* Date & Income Source */}
                            <div className="form-row" style={{ gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="expense-date" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>📅</span> Date *
                                    </label>
                                    <input 
                                        type="date" 
                                        id="expense-date" 
                                        name='expense_date'
                                        className="input-field"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="income_source" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>🏛️</span> Income Source *
                                    </label>
                                    <select 
                                        id="income_source" 
                                        className={`select-field ${errors.income_source ? "input-error" : ""}`} 
                                        name="income_source" 
                                        value={incomeId}
                                        onChange={(e) => setIncomeId(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="" disabled>Select Source</option>
                                        {incomes?.incomesList?.map(income => (
                                            <option key={income.id} value={income.id}>{income.source} (₹{income.balance?.toLocaleString('en-IN')})</option>
                                        ))}
                                    </select>
                                    {errors.income_source && <span className="field-error-text">{errors.income_source}</span>}
                                </div>
                            </div>

                            {/* Priority Selector */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>⚡</span> Priority Level *
                                </label>
                                <input type="hidden" name="priority_type" value={priorityType} />
                                <div className="priority-selector-group">
                                    <button 
                                        type="button" 
                                        className={`priority-btn ${priorityType === 'normal' ? 'active normal' : ''}`}
                                        onClick={() => setPriorityType('normal')}
                                    >
                                        <span>🟢</span> Normal Expense
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`priority-btn ${priorityType === 'emergency' ? 'active emergency' : ''}`}
                                        onClick={() => setPriorityType('emergency')}
                                    >
                                        <span>🚨</span> Emergency Expense
                                    </button>
                                </div>
                            </div>

                            {/* Active Budget Detection Alert Banner */}
                            {hasActiveBudget && (
                                <div style={{ 
                                    background: "rgba(239, 68, 68, 0.08)", 
                                    border: "1px solid rgba(239, 68, 68, 0.25)", 
                                    borderRadius: "var(--radius-sm)", 
                                    padding: "0.6rem 0.85rem", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.5rem", 
                                    fontSize: "0.8rem", 
                                    color: "#f87171" 
                                }}>
                                    <span>⚠️</span>
                                    <span>Active budget cycle detected on this income source. Amount will deduct from remaining limit.</span>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="expense-notes" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>✏️</span> Notes / Remarks
                                </label>
                                <textarea 
                                    id="expense-notes" 
                                    name='expense_notes' 
                                    placeholder="Any additional notes or transaction details (optional)..."
                                    className="input-field"
                                    style={{ height: '70px', padding: '0.65rem 0.85rem' }}
                                ></textarea>
                            </div>

                        </div>
                        <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <button type="button" className="btn btn-secondary" onClick={toggleExpenseModal} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.6rem 1.5rem' }}>
                                {loading ? <Spinner size="small" text="Saving..." /> : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExpenseForm;