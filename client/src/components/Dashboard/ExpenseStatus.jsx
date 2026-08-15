import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const ExpenseStatus = () => {
    const { expenses, budgets, accumulatedSavings } = useContext(AppContext);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 2. Weekly Spending: sum of expenses in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyExpenses = expenses ? expenses.filter(e => {
        if (!e.transaction_date) return false;
        const date = new Date(e.transaction_date);
        return date >= oneWeekAgo && date <= now;
    }) : [];
    const weeklySpending = weeklyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 3. Monthly Spendings: sum of expenses in the current calendar month
    const monthlyExpenses = expenses ? expenses.filter(e => {
        if (!e.transaction_date) return false;
        const date = new Date(e.transaction_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }) : [];
    const monthlySpendings = monthlyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // 4. Budget Status: Remaining amount of the active regular budget
    const activeRegularBudget = budgets ? budgets.find(b => (b.budget_type?.toLowerCase() === 'regular' || !b.budget_type) && (b.budget_status?.toUpperCase() === "ACTIVE" || b.budget_status?.toUpperCase() === "OVERSPENT" || b.is_active)) : null;
    
    let budgetStatusValue = "No Active Budget";
    let budgetStatusMeta = "Create a budget to track limits";
    let budgetPercentage = 0;

    if (activeRegularBudget) {
        const isOverspent = activeRegularBudget.spent_amount > activeRegularBudget.budget_amount;
        const overspentAmt = activeRegularBudget.spent_amount - activeRegularBudget.budget_amount;
        budgetPercentage = activeRegularBudget.budget_amount > 0 
            ? Math.round((activeRegularBudget.spent_amount / activeRegularBudget.budget_amount) * 100)
            : 0;

        if (isOverspent) {
            budgetStatusValue = `₹0 (Overspent by ₹${overspentAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })})`;
            budgetStatusMeta = `Overspent by ${overspentAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })} on ${activeRegularBudget.budget_name || 'Regular Budget'}`;
        } else {
            budgetStatusValue = `₹${activeRegularBudget.remaining_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            budgetStatusMeta = `${Math.min(100, budgetPercentage)}% of ${activeRegularBudget.budget_name || 'Regular Budget'} limit spent`;
        }
    }

    return (
        <section className="stats-grid">
            {/* Total Savings Card */}
            <div className="stat-card card-balance">
                <div className="stat-header">
                    <span className="stat-title">Total Savings</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 11V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
                            <path d="M16 11h6V9a2 2 0 0 0-2-2h-4"></path>
                            <circle cx="9" cy="12" r="1"></circle>
                        </svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-total-savings">₹{(accumulatedSavings || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="stat-meta">Accumulated saved amount</div>
            </div>

            {/* Weekly Spending Card */}
            <div className="stat-card card-daily">
                <div className="stat-header">
                    <span className="stat-title">Weekly Spending</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-weekly-spend">₹{weeklySpending.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="stat-meta">Spent in the last 7 days</div>
            </div>

            {/* Monthly Spending Card */}
            <div className="stat-card card-monthly">
                <div className="stat-header">
                    <span className="stat-title">Monthly Spending</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-monthly-spend">₹{monthlySpendings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div className="stat-meta">{activeRegularBudget ? `${budgetPercentage}% of limit spent` : "This calendar month"}</div>
            </div>

            {/* Budget Status Card */}
            <div className="stat-card card-yearly">
                <div className="stat-header">
                    <span className="stat-title">Budget Status</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-budget-status">{budgetStatusValue}</div>
                <div className="stat-meta">{budgetStatusMeta}</div>
            </div>
        </section>
    )
}

export default ExpenseStatus