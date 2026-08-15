import React, { useContext, useState, useEffect, useMemo } from 'react';
import AppContext from '../../context/AppContext';
import { getBudgets, submitBudgetForm } from '../../APIs/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../Common/Loader';

const BudgetForm = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const defaultTargetDateObj = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formattedTargetDate = `${defaultTargetDateObj.getFullYear()}-${String(defaultTargetDateObj.getMonth() + 1).padStart(2, '0')}-${String(defaultTargetDateObj.getDate()).padStart(2, '0')}`;

    const { toggleBudgetModal, budgetModal, expenseCategories, incomes, setBudgets } = useContext(AppContext);
    const { showToast } = useToast();

    // Core Form States
    const [budgetCategory, setBudgetCategory] = useState('regular');
    const [fixedExpenses, setFixedExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Temporary inline inputs for a single fixed expense item
    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState({ category_id: '', category: 'Others' });
    const [expenseDescription, setExpenseDescription] = useState('');
    const [startDate, setStartDate] = useState(formattedDate);
    const [budgetFrequency, setBudgetFrequency] = useState("monthly");
    const [endDate, setEndDate] = useState(formattedDate);
    const [savingTargetDate, setSavingTargetDate] = useState(formattedTargetDate);
    const [savingFrequency, setSavingFrequency] = useState("");
    const [budgetAmount, setBudgetAmount] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [income, setIncome] = useState({ id: '', type: '' });
    const [variableAmount, setVariableAmount] = useState(0);

    // Mode switch cleanup to prevent state leakage
    useEffect(() => {
        setBudgetAmount('');
        setSavingFrequency('');
        setTargetAmount('');
        setFixedExpenses([]);
        setVariableAmount(0);
        setErrors({});
    }, [budgetCategory]);

    const selectedIncomeObj = useMemo(() => {
        return incomes?.incomesList?.find(inc => inc.id === income.id);
    }, [incomes, income.id]);

    const accountBalance = Number(selectedIncomeObj?.balance || 0);

    const totalFixedAmount = useMemo(() => {
        return fixedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [fixedExpenses]);

    const reserveVal = Math.max(0, Number(variableAmount || 0));

    const isBalanceExceeded = useMemo(() => {
        if (!income.id) return false;
        return (totalFixedAmount + reserveVal) > accountBalance;
    }, [income.id, totalFixedAmount, reserveVal, accountBalance]);

    const clampedAvailableForSpending = useMemo(() => {
        if (!income.id) return 0;
        return Math.max(0, accountBalance - totalFixedAmount - reserveVal);
    }, [income.id, accountBalance, totalFixedAmount, reserveVal]);

    const recommendedVariableBudget = clampedAvailableForSpending;

    const numBudgetAmount = Number(budgetAmount || 0);
    const manualExcess = useMemo(() => {
        if (!income.id || isBalanceExceeded || !numBudgetAmount) return 0;
        return Math.max(0, numBudgetAmount - clampedAvailableForSpending);
    }, [income.id, isBalanceExceeded, numBudgetAmount, clampedAvailableForSpending]);

    const daysRemaining = useMemo(() => {
        const todayDate = new Date(startDate);
        todayDate.setHours(0, 0, 0, 0);
        const target = new Date(savingTargetDate);
        target.setHours(0, 0, 0, 0);

        const diff = Math.ceil((target - todayDate) / (1000 * 60 * 60 * 24));
        return diff;
    }, [startDate, savingTargetDate]);

    const recommendations = useMemo(() => {
        const numTarget = Number(targetAmount);
        if (!numTarget || numTarget <= 0 || daysRemaining < 0) {
            return { daily: 0, weekly: 0, monthly: 0, dailyPeriods: 0, weeklyPeriods: 0, monthlyPeriods: 0 };
        }

        const dailyPeriods = Math.max(1, daysRemaining + 1);
        const weeklyPeriods = Math.max(1, Math.ceil((daysRemaining + 1) / 7));

        const startObj = new Date(startDate);
        const targetObj = new Date(savingTargetDate);
        let mDiff = (targetObj.getFullYear() - startObj.getFullYear()) * 12 + (targetObj.getMonth() - startObj.getMonth());
        if (targetObj.getDate() > startObj.getDate()) {
            mDiff += 1;
        }
        const monthlyPeriods = Math.max(1, mDiff);

        const daily = Math.min(numTarget, Math.ceil(numTarget / dailyPeriods));
        const weekly = Math.min(numTarget, Math.ceil(numTarget / weeklyPeriods));
        const monthly = Math.min(numTarget, Math.ceil(numTarget / monthlyPeriods));

        return {
            daily,
            weekly,
            monthly,
            dailyPeriods,
            weeklyPeriods,
            monthlyPeriods
        };
    }, [targetAmount, daysRemaining, startDate, savingTargetDate]);

    const recommendationOptions = [
        { id: "daily", label: "Daily basis", value: formatCurrency(recommendations.daily) },
        { id: "weekly", label: "Weekly basis", value: formatCurrency(recommendations.weekly) },
        { id: "monthly", label: "Monthly basis", value: formatCurrency(recommendations.monthly) }
    ];

    const handleRecommendationClick = (option) => {
        setSavingFrequency(option.id);
        const amountVal = recommendations[option.id];
        if (amountVal > 0) {
            setBudgetAmount(amountVal);
        }
    };

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    }

    useEffect(() => {
        const date = new Date(startDate);
        switch (budgetFrequency) {
            case "daily":
                break;
            case "weekly":
                date.setDate(date.getDate() + 6);
                break;
            case "monthly":
                date.setMonth(date.getMonth() + 1);
                date.setDate(date.getDate() - 1);
                break;
            default:
                break;
        }
        setEndDate(date.toISOString().split("T")[0]);
    }, [startDate, budgetFrequency]);

    const handleAddFixedExpense = () => {
        if (!expenseTitle.trim()) {
            showToast('Fixed expense name is required.', 'warning');
            return;
        }
        if (!expenseAmount || isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
            showToast('Please enter a valid fixed expense amount.', 'warning');
            return;
        }

        const newExpense = {
            id: Date.now(),
            expense_name: expenseTitle,
            amount: Number(expenseAmount),
            category_id: expenseCategory.category_id || GuidEmpty(),
            category: expenseCategory.category,
            description: expenseDescription
        };

        setFixedExpenses(prev => [...prev, newExpense]);
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseCategory({ category_id: '', category: 'Others' });
        setExpenseDescription('');
    };

    function GuidEmpty() {
        return "00000000-0000-0000-0000-000000000000";
    }

    const handleRemoveFixedExpense = (id) => {
        setFixedExpenses(prev => prev.filter(item => item.id !== id));
    };

    const validateForm = (data) => {
        const errs = {};
        if (budgetCategory === 'regular') {
            if (!data.budget_amount || isNaN(data.budget_amount) || Number(data.budget_amount) <= 0) {
                errs.budget_amount = 'Valid total budget amount is required.';
            }
            if (!income.id) {
                errs.income_source = 'Income source is required.';
            }
        } else if (budgetCategory === 'savings') {
            if (!data.budget_name || !data.budget_name.trim()) {
                errs.budget_name = 'Goal description is required.';
            }
            if (!data.target_amount || isNaN(data.target_amount) || Number(data.target_amount) <= 0) {
                errs.target_amount = 'Valid target savings amount is required.';
            }
            if (!data.budget_amount || isNaN(data.budget_amount) || Number(data.budget_amount) <= 0) {
                errs.budget_amount = 'Please select a savings strategy recommendation or enter a contribution amount.';
            }
            if (!income.id) {
                errs.income_source = 'Income source is required.';
            }
            if (daysRemaining <= 0) {
                errs.end_date = 'Target date must be after start date.';
            }
        }
        return errs;
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const validationErrors = validateForm(data);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast('Please fix the form errors before submitting.', 'error');
            return;
        }

        if (budgetCategory === 'savings') {
            data.fixed_expenses = [];
            data.total_fixed_amount = 0;
            data.variable_amount = 0;
        } else {
            data.fixed_expenses = fixedExpenses;
            data.total_fixed_amount = totalFixedAmount;
            data.variable_amount = variableAmount;
        }
        data.income_source = income.id;

        setLoading(true);
        try {
            await submitBudgetForm(data);
            showToast('Budget configured successfully!', 'success');
            const latestBudgetData = await getBudgets();
            setBudgets(latestBudgetData);

            setFixedExpenses([]);
            toggleBudgetModal();
            e.target.reset();
        } catch (error) {
            console.error("Budget submit error:", error);
            showToast(error.message || 'Failed to submit budget. Try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className={budgetModal ? "modal-overlay active" : "modal-overlay"} 
            id="budget-modal"
            onClick={(e) => {
                if (e.target.classList.contains('modal-overlay')) toggleBudgetModal();
            }}
        >
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Configure Budgets</h3>
                    <button type="button" className="modal-close-btn" onClick={toggleBudgetModal}>&times;</button>
                </div>
                <form id="configure-budget-form" onSubmit={handleBudgetSubmit} noValidate>
                    <div className="modal-body">
                        <div className="budget-modal-grid">
                            <div className="budget-modal-left">
                                <div className="form-group">
                                    <label htmlFor="budget-mode-select">Budget Strategy *</label>
                                    <select 
                                        id="budget-mode-select" 
                                        className="select-field" 
                                        style={{ width: '100%' }} 
                                        required 
                                        name='budget_type' 
                                        value={budgetCategory} 
                                        onChange={(e) => setBudgetCategory(e.target.value)} 
                                    >
                                        <option value="regular">Regular Limit Budget</option>
                                        <option value="savings">Savings Goal Tracker</option>
                                    </select>
                                </div>

                                {budgetCategory === "regular" && (
                                    <div id="period-budget-fields">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="budget-period-select">Budget Frequency *</label>
                                                <select 
                                                    id="budget-period-select" 
                                                    className="select-field" 
                                                    style={{ width: '100%' }} 
                                                    value={budgetFrequency} 
                                                    name='budget_frequency' 
                                                    onChange={(e) => setBudgetFrequency(e.target.value)}
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="start_date">Start Date *</label>
                                                <input 
                                                    type="date" 
                                                    id="start_date" 
                                                    className="input-field" 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    name='start_date' 
                                                    onChange={(e) => setStartDate(e.target.value)} 
                                                    value={startDate} 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="end_date">End Date *</label>
                                                <input 
                                                    type="date" 
                                                    id="end_date" 
                                                    className="input-field" 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    name='end_date' 
                                                    value={endDate} 
                                                    readOnly 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="income_source">Income Source *</label>
                                                <select 
                                                    id="income_source" 
                                                    className={`select-field ${errors.income_source ? "input-error" : ""}`} 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    onChange={(e) => setIncome({ id: e.target.value, type: e.target.options[e.target.selectedIndex].text })} 
                                                    name="income_source"
                                                    value={income.id}
                                                >
                                                    <option value="" disabled>Select Income Source</option>
                                                    {incomes?.incomesList?.map(inc => (
                                                        <option key={inc.id} value={inc.id}>{inc.source}</option>
                                                    ))}
                                                </select>
                                                {errors.income_source && <span className="field-error-text">{errors.income_source}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="variable_amount">Amount to Keep Aside (₹)</label>
                                                <input 
                                                    type="number" 
                                                    id="variable_amount" 
                                                    min="0"
                                                    placeholder="0" 
                                                    className="input-field" 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    name='variable_amount' 
                                                    value={variableAmount || ''}
                                                    onChange={(e) => setVariableAmount(Number(e.target.value))} 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="budget_amount">Total Budget Amount (₹) *</label>
                                                <input 
                                                    type="number" 
                                                    id="budget_amount" 
                                                    name='budget_amount' 
                                                    placeholder="e.g. 25000" 
                                                    className={`input-field ${errors.budget_amount ? "input-error" : ""}`} 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    value={budgetAmount}
                                                    onChange={(e) => setBudgetAmount(e.target.value)}
                                                />
                                                {errors.budget_amount && <span className="field-error-text">{errors.budget_amount}</span>}
                                            </div>
                                        </div>

                                        {/* Regular Budget Recommendation Card */}
                                        {income.id && (
                                            <div id="regular-recommendation-card" className="savings-recommendation-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.2rem' }}>💡</span>
                                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Budget Recommendation</span>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Available Balance</span>
                                                        <span style={{ fontWeight: '600' }}>{formatCurrency(accountBalance)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Fixed Expenses</span>
                                                        <span style={{ color: '#f43f5e', fontWeight: '600' }}>-{formatCurrency(totalFixedAmount)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>Keep Aside</span>
                                                        <span style={{ color: '#f59e0b', fontWeight: '600' }}>-{formatCurrency(reserveVal)}</span>
                                                    </div>
                                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                                                        <span>Available for Spending</span>
                                                        <span style={{ color: '#34d399' }}>{formatCurrency(clampedAvailableForSpending)}</span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Recommended Budget</span>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(recommendedVariableBudget)}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setBudgetAmount(recommendedVariableBudget)}
                                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                                                    >
                                                        Use Recommended Amount
                                                    </button>
                                                </div>

                                                {isBalanceExceeded && (
                                                    <div style={{ background: 'rgba(244, 63, 94, 0.15)', borderLeft: '3px solid #f43f5e', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', color: '#f43f5e', marginTop: '0.25rem' }}>
                                                        ⚠️ Your fixed expenses and reserved amount exceed the available account balance.
                                                    </div>
                                                )}

                                                {!isBalanceExceeded && manualExcess > 0 && (
                                                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderLeft: '3px solid #f59e0b', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                                                        ⚠️ This budget exceeds the currently available amount by {formatCurrency(manualExcess)}.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Regular Budget Salary Breakdown Summary on Modal */}
                                        {(() => {
                                            const selectedIncomeObj = incomes?.incomesList?.find(inc => inc.id === income.id);
                                            const isSalaryAccount = selectedIncomeObj?.isSalary || selectedIncomeObj?.is_salary || (income.type && income.type.toLowerCase().includes('salary'));
                                            
                                            if (!isSalaryAccount) return null;

                                            return (
                                                <div className="salary-summary-card" style={{ marginTop: '1.25rem' }}>
                                                    <div className="salary-summary-header">
                                                        <span>💼 Salary Account Budget Summary</span>
                                                        <span className="salary-summary-badge">Salary Source</span>
                                                    </div>
                                                    <div className="salary-summary-grid">
                                                        <div className="salary-summary-item">
                                                            <span className="salary-summary-label">Fixed Expenses</span>
                                                            <span className="salary-summary-val">₹ {formatCurrency(totalFixedAmount)}</span>
                                                        </div>
                                                        <div className="salary-summary-item">
                                                            <span className="salary-summary-label">Variable Allowance</span>
                                                            <span className="salary-summary-val">₹ {formatCurrency(variableAmount || 0)}</span>
                                                        </div>
                                                        <div className="salary-summary-item">
                                                            <span className="salary-summary-label">Total Budget</span>
                                                            <span className="salary-summary-val">₹ {formatCurrency(Number(budgetAmount || 0))}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {budgetCategory === "savings" && (
                                    <div id="goal-budget-fields">
                                        <input type="hidden" name="saving_frequency" value={savingFrequency || "monthly"} />
                                        <input type="hidden" name="budget_frequency" value={savingFrequency || "monthly"} />
                                        <div className="form-group">
                                            <label htmlFor="goal-name-input">Goal Description *</label>
                                            <input 
                                                type="text" 
                                                id="goal-name-input" 
                                                placeholder="e.g. Save for Wedding" 
                                                className={`input-field ${errors.budget_name ? "input-error" : ""}`} 
                                                style={{ paddingLeft: '1rem' }} 
                                                name='budget_name' 
                                            />
                                            {errors.budget_name && <span className="field-error-text">{errors.budget_name}</span>}
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="goal-amount-input">Target Savings Amount (₹) *</label>
                                                <input 
                                                    type="number" 
                                                    id="goal-amount-input" 
                                                    min="1" 
                                                    placeholder="e.g. 500000" 
                                                    className={`input-field ${errors.target_amount ? "input-error" : ""}`} 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    name='target_amount' 
                                                    value={targetAmount} 
                                                    onChange={(e) => setTargetAmount(Number(e.target.value))} 
                                                />
                                                {errors.target_amount && <span className="field-error-text">{errors.target_amount}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="goal-date-input">Target Date *</label>
                                                <input 
                                                    type="date" 
                                                    id="goal-date-input" 
                                                    className="input-field" 
                                                    name='end_date' 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    value={savingTargetDate} 
                                                    onChange={(e) => setSavingTargetDate(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="goal-income-input">Budget Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    id="goal-income-input" 
                                                    min="0" 
                                                    placeholder="e.g. 120000" 
                                                    className="input-field" 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    name='budget_amount' 
                                                    value={budgetAmount} 
                                                    onChange={(e) => setBudgetAmount(Number(e.target.value))} 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="savings-income-source">Income Source *</label>
                                                <select 
                                                    id="savings-income-source" 
                                                    className={`select-field ${errors.income_source ? "input-error" : ""}`} 
                                                    style={{ paddingLeft: '1rem' }} 
                                                    onChange={(e) => setIncome({ id: e.target.value, type: e.target.options[e.target.selectedIndex].text })} 
                                                    name="income_source"
                                                    value={income.id}
                                                >
                                                    <option value="" disabled>Select Income Source</option>
                                                    {incomes?.incomesList?.map(inc => (
                                                        <option key={inc.id} value={inc.id}>{inc.source}</option>
                                                    ))}
                                                </select>
                                                {errors.income_source && <span className="field-error-text">{errors.income_source}</span>}
                                            </div>
                                        </div>

                                        <div id="goal-recommendation-card" className="savings-recommendation-card" style={{ display: 'flex' }}>
                                            <span className="savings-recommendation-icon">💡</span>
                                            <div className="savings-recommendation-content">
                                                <span className="savings-recommendation-title">Recommended Savings Strategy</span>
                                                {daysRemaining <= 0 ? (
                                                    <span style={{ fontSize: "0.8rem", color: "var(--warning)", marginTop: "0.4rem" }}>
                                                        ⚠️ Please select a future target date to calculate savings recommendations.
                                                    </span>
                                                ) : !targetAmount || Number(targetAmount) <= 0 ? (
                                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                                                        Enter a target savings amount above to view daily, weekly, and monthly recommendations.
                                                    </span>
                                                ) : (
                                                    <div className="savings-recommendation-options" style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                                        {recommendationOptions.map(option => (
                                                            <div 
                                                                key={option.id}
                                                                className={option.id === savingFrequency ? `recommendation-option selected` : `recommendation-option`} 
                                                                onClick={() => handleRecommendationClick(option)}
                                                            >
                                                                <span className="option-label">{option.label}</span>
                                                                <span className="option-value">{option.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {budgetCategory === "regular" && (
                                <div className="budget-modal-right">
                                    <div className="form-group">
                                        <label style={{ marginBottom: '0.5rem', display: 'block' }}>Fixed Expenditures & Monthly Bills</label>
                                        <div id="modal-recurring-list" style={{ marginBottom: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                                            {fixedExpenses.length === 0 ? (
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", textAlign: "center", padding: "0.5rem" }}>
                                                    No fixed items added yet.
                                                </span>
                                            ) : (
                                                fixedExpenses.map((item) => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <span>{item.expense_name} ({item.category})</span>
                                                        <div>
                                                            <span style={{ marginRight: '0.75rem', fontWeight: 600 }}>₹{item.amount}</span>
                                                            <button type="button" onClick={() => handleRemoveFixedExpense(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="modal-add-recurring-inline" style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-color)" }}>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-muted)", display: "block" }}>Add Itemized Fixed Expense:</span>
                                            <div className="form-row" style={{ gridTemplateColumns: "2fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. Rent, Gym" 
                                                    className="input-field" 
                                                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} 
                                                    value={expenseTitle} 
                                                    onChange={(e) => setExpenseTitle(e.target.value)} 
                                                />
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    placeholder="Amount (₹)" 
                                                    className="input-field" 
                                                    style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} 
                                                    value={expenseAmount} 
                                                    onChange={(e) => setExpenseAmount(e.target.value)} 
                                                />
                                            </div>
                                            <div className="form-row" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                                <select
                                                    className="select-field"
                                                    style={{ padding: "0.5rem 2rem 0.5rem 0.75rem", fontSize: "0.85rem", width: "100%" }}
                                                    value={expenseCategory.category_id}
                                                    onChange={(e) => setExpenseCategory({ category_id: e.target.value, category: e.target.options[e.target.selectedIndex].text })}
                                                >
                                                    <option value="" disabled>Select category</option>
                                                    {expenseCategories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.category_type}</option>
                                                    ))}
                                                </select>
                                                <input type="number" min="1" max="28" placeholder="Due Day (1-28)" className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} />
                                            </div>
                                            <button type="button" className="btn btn-secondary" style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", height: "34px" }} onClick={handleAddFixedExpense}>
                                                + Add Item
                                            </button>
                                        </div>
                                        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", fontWeight: 600, textAlign: "right", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>Will show in Monthly Bills card</span>
                                            <span>Total Fixed: <span style={{ color: "var(--primary)", fontWeight: 700 }}>₹{totalFixedAmount}</span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={toggleBudgetModal} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <Spinner size="small" text="Saving..." /> : 'Save Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;