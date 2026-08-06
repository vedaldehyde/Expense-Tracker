import React, { useContext, useState, useEffect, useMemo } from 'react';
import AppContext from '../../context/AppContext';
import { getBudgets, submitBudgetForm } from '../../APIs/api';

const BudgetForm = () => {
    // Date calculations safely scoped inside component
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const { toggleBudgetModal, budgetModal, expenseCategories, incomes, setBudgets } = useContext(AppContext);

    // Core Form States
    const [budgetCategory, setBudgetCategory] = useState('regular');
    const [fixedExpenses, setFixedExpenses] = useState([]);

    // Temporary inline inputs for a single fixed expense item
    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState({ category_id: '0', category: 'Others' });
    const [expenseDescription, setExpenseDescription] = useState('');
    const [startDate, setStartDate] = useState(formattedDate);
    const [budgetFrequency, setBudgetFrequency] = useState("monthly");
    const [endDate, setEndDate] = useState(formattedDate);
    const [savingTargetDate, setSavingTargetDate] = useState(formattedDate);
    const [savingFrequency, setSavingFrequency] = useState("");
    const [budgetAmount, setBudgetAmount] = useState();
    const [targetAmount, setTargetAmount] = useState();
    const [income, setIncome] = useState({ id: '0', type: '' });
    const [variableAmount, setVariableAmount] = useState(0);


    const daysRemaining = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(savingTargetDate);
        target.setHours(0, 0, 0, 0);

        const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return diff;

    }, [savingTargetDate]);


    const recommendations = useMemo(() => {

        if (!targetAmount || daysRemaining <= 0) {
            return {
                daily: 0,
                weekly: 0,
                monthly: 0
            };
        }


        const daily = Math.ceil(
            targetAmount / daysRemaining
        );


        return {

            daily,

            // Weekly saving based on daily requirement
            weekly: Math.ceil(
                daily * 7
            ),

            // Monthly saving based on daily requirement
            monthly: Math.ceil(
                daily * 30
            )
        };


    }, [targetAmount, daysRemaining]);

    const recommendationOptions = [
        {
            id: "daily",
            label: "Daily basis",
            value: formatCurrency(recommendations.daily)
        },
        {
            id: "weekly",
            label: "Weekly basis",
            value: formatCurrency(recommendations.weekly)
        },
        {
            id: "monthly",
            label: "Monthly basis",
            value: formatCurrency(recommendations.monthly)
        }
    ];

    const handleRecommendationClick = (option) => {
        setSavingFrequency(option.id);
        setBudgetAmount(recommendations[option.id]);
    };
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0 // Keep interface sleek by hiding paisa values
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


    // Dynamically calculate total fixed expenses
    const totalFixedAmount = fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    // Add fixed expense item to array list
    const handleAddFixedExpense = () => {
        if (!expenseTitle || !expenseAmount) return; // Basic validation

        const newExpense = {
            expense_name: expenseTitle,
            amount: Number(expenseAmount),
            category_id: expenseCategory.category_id,
            category: expenseCategory.category,
            description: expenseDescription
        };


        setFixedExpenses(prev => [...prev, newExpense]);

        // Reset only the fixed item sub-form fields
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseCategory({ category_id: '', category: 'Others' });
        setExpenseDescription('')
    };

    // Remove a single fixed expense item
    const handleRemoveFixedExpense = (id) => {
        setFixedExpenses(prev => prev.filter(item => item.id !== id));
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Append the array of dynamically added itemized expenses to the submission payload
        data.fixed_expenses = fixedExpenses;
        data.total_fixed_amount = totalFixedAmount;
        data.income_source = income.id;
        console.log('Budget data with fixed expenses ', data);


        try {
            await submitBudgetForm(data);
            const latestBudgetData = await getBudgets();
            setBudgets(latestBudgetData);

            // Clean up state on success
            setFixedExpenses([]);
            toggleBudgetModal();
            e.target.reset();
        }
        catch (error) {
            console.error("Budget submit error:", error);
        }
    };
    console.log(income);

    // const salaryAccount = incomes?.incomesList?.find(income => income.isSalary);
    // const salaryAccBalance = salaryAccount?.balance ?? 0;
    // const calculatedBudget = Number(salaryAccBalance) - Number(totalFixedAmount)- Number(variableAmount)



    return (
        <div className={budgetModal ? "modal-overlay active" : "modal-overlay"} id="budget-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Configure Budgets</h3>
                    <button type="button" className="modal-close-btn" onClick={toggleBudgetModal}>&times;</button>
                </div>
                <form id="configure-budget-form" onSubmit={handleBudgetSubmit}>
                    <div className="modal-body">
                        <div className="budget-modal-grid">
                            <div className="budget-modal-left">
                                <div className="form-group">
                                    <label for="budget-mode-select">Budget Strategy *</label>
                                    <select id="budget-mode-select" className="select-field" style={{ width: '100%' }} required name='budget_type' value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} >
                                        <option value="regular">Regular Limit Budget</option>
                                        <option value="savings">Savings Goal Tracker</option>
                                    </select>
                                </div>

                                {
                                    budgetCategory === "regular" && (
                                        <>
                                            <div id="period-budget-fields">
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label for="budget-period-select">Budget Frequency *</label>
                                                        <select id="budget-period-select" className="select-field" style={{ width: '100%' }} value={budgetFrequency} name='budget_frequency' onChange={(e) => setBudgetFrequency(e.target.value)}>
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="monthly" selected>Monthly</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label for="budget-mode-select">Total Budget (₹) *</label>
                                                        <input type="number" id="budget-mode-select" name='budget_amount' placeholder="e.g. 25000" className="input-field" style={{ paddingLeft: '1rem' }} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label for="budget-period-select">Start Date *</label>
                                                        <input type="date" id="budget-total-input" className="input-field" style={{ paddingLeft: '1rem' }} name='start_date' onChange={(e) => setStartDate(e.target.value)} value={startDate} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label for="budget-period-select">End Date *</label>
                                                        <input type="date" id="budget-total-input" className="input-field" style={{ paddingLeft: '1rem' }} name='end_date' value={endDate} readOnly />
                                                    </div>
                                                    <div className="form-group">
                                                        <label for="budget-period-select">Income Source *</label>
                                                        <select id="budget-period-select" className="select-field" style={{ paddingLeft: '1rem' }} onChange={(e) => setIncome({ id: e.target.value, type: e.target.options[e.target.selectedIndex].text })} name="income_source">
                                                            {
                                                                incomes.incomesList ? incomes?.incomesList.map(income => <option key={income.id} value={income.id}>{income.source}</option>) : null
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label for="budget-period-select">Variable Amount (₹) *</label>
                                                        <input type="number" id="budget-total-input" placeholder="e.g. 25000" className="input-field" style={{ paddingLeft: '1rem' }} name='variable_amount' onChange={(e) => setVariableAmount(Number(e.target.value))} />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                }
                                {
                                    budgetCategory === "savings" && (
                                        <div id="goal-budget-fields">
                                            <input
                                                type="hidden"
                                                name="saving_frequency"
                                                value={savingFrequency}
                                            />
                                            <div className="form-group">
                                                <label for="goal-name-input">Goal Description *</label>
                                                <input type="text" id="goal-name-input" placeholder="e.g. Save for Wedding" className="input-field" style={{ paddingLeft: '1rem' }} name='budget_name' />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label for="goal-amount-input">Target Savings Amount (₹) *</label>
                                                    <input type="number" id="goal-amount-input" min="1" placeholder="e.g. 500000" className="input-field" style={{ paddingLeft: '1rem' }} name='target_amount' value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
                                                </div>
                                                <div className="form-group">
                                                    <label for="goal-date-input">Target Date *</label>
                                                    <input type="date" id="goal-date-input" className="input-field" name='end_date' style={{ paddingLeft: '1rem' }} value={savingTargetDate} onChange={(e) => setSavingTargetDate(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label for="goal-income-input">Budget Amount (₹) *</label>
                                                    <input type="number" id="goal-income-input" min="0" placeholder="e.g. 120000" className="input-field" style={{ paddingLeft: '1rem' }} name='budget_amount' value={budgetAmount} onChange={(e) => setBudgetAmount(Number(e.target.value))} />
                                                </div>
                                                <div className="form-group">
                                                    <label for="budget-period-select">Income Source *</label>
                                                    <select id="budget-period-select" className="select-field" style={{ paddingLeft: '1rem' }} onChange={(e) => setIncome({ id: e.target.value, type: e.target.options[e.target.selectedIndex].text })} name="income_source">
                                                        {
                                                            incomes.incomesList ? incomes?.incomesList.map(income => <option key={income.id} value={income.id}>{income.source}</option>) : null
                                                        }
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label for="budget-period-select">Variable Amount (₹) *</label>
                                                    <input type="number" id="budget-total-input" placeholder="e.g. 25000" className="input-field" style={{ paddingLeft: '1rem' }} name='variable_amount' />
                                                </div>
                                            </div>
                                            <div id="goal-recommendation-card" className="savings-recommendation-card">
                                                <span className="savings-recommendation-icon">💡</span>
                                                <div className="savings-recommendation-content">
                                                    <span className="savings-recommendation-title">Recommended Savings Strategy</span>
                                                    <span id="goal-recommendation-text" className="savings-recommendation-text">
                                                        <div className="savings-recommendation-options" style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                                            {
                                                                recommendationOptions.map(option => (
                                                                    <div className={option.id === savingFrequency ? `recommendation-option selected` : `recommendation-option`} onClick={() => handleRecommendationClick(option)}>
                                                                        <span className="option-label">{option.label}</span>
                                                                        <span className="option-value">{option.value}</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="budget-modal-right">
                                <div className="form-group">
                                    <label style={{ marginBottom: '0.5rem', display: 'block' }}>Fixed Expenditures & Monthly Bills</label>
                                    <div id="modal-recurring-list" style={{ marginBottom: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                                        <div style={{ marginBottom: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                                            {fixedExpenses.length === 0 ? (
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", textAlign: "center", padding: "0.5rem" }}>
                                                    No fixed items added yet.
                                                </span>
                                            ) : (
                                                fixedExpenses.map((item) => (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <span>{item.expense_name} ({item.category.category})</span>
                                                        <div>
                                                            <span style={{ marginRight: '0.75rem', fontWeight: 600 }}>₹{item.amount}</span>
                                                            <button type="button" onClick={() => handleRemoveFixedExpense(item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-add-recurring-inline" style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-color)" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-muted)", display: "block" }}>Add Itemized Fixed Expense:</span>
                                        <div className="form-row" style={{ gridTemplateColumns: "2fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <input type="text" id="modal-rec-title" placeholder="e.g. Rent, Gym" className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} />
                                            <input type="number" id="modal-rec-amount" min="1" placeholder="Amount (₹)" className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
                                        </div>
                                        <div className="form-row" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                            <select
                                                className="select-field"
                                                style={{ padding: "0.5rem 2rem 0.5rem 0.75rem", fontSize: "0.85rem", width: "100%" }}
                                                value={expenseCategory.category_id}
                                                onChange={(e) => setExpenseCategory({ category_id: e.target.value, category: e.target.options[e.target.selectedIndex].text })}
                                                required={fixedExpenses.length === 0}
                                            >
                                                <option className='expense-category-cell' value="" selected>Select category</option>
                                                {
                                                    expenseCategories.map(category => <option className='expense-category-cell' value={category.id}>{category.category_type}</option>)
                                                }
                                            </select>
                                            <input type="number" id="modal-rec-due" min="1" max="28" placeholder="Due Day (1-28)" className="input-field" style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", paddingLeft: "0.75rem" }} />
                                        </div>
                                        <button type="button" id="modal-rec-add-btn" className="btn btn-secondary" style={{ width: "100%", padding: "0.4rem", fontSize: "0.8rem", height: "34px" }} onClick={handleAddFixedExpense}>+ Add Item</button>
                                    </div>
                                    <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", fontWeight: 600, textAlign: "right", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>Will show in Monthly Bills card</span>
                                        <span>Total Fixed: <span id="modal-fixed-total-display" style={{ color: "var(--primary)", fontWeight: 700 }}>₹{totalFixedAmount}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={toggleBudgetModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Update Budgets</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;