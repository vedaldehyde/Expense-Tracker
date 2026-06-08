import React from 'react'

const ExpenseStatus = () => {
    return (
        <section className="stats-grid">
            <div className="stat-card card-balance">
                <div className="stat-header">
                    <span className="stat-title">Remaining Budget</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-remaining-balance">₹0.00</div>
                <div className="stat-meta" id="stat-remaining-percentage">0% of monthly budget left</div>
            </div>

            <div className="stat-card card-daily">
                <div className="stat-header">
                    <span className="stat-title">Daily Spending</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-daily-spend">₹0.00</div>
                <div className="stat-meta" id="stat-daily-trend">Today's total expenses</div>
            </div>

            <div className="stat-card card-monthly">
                <div className="stat-header">
                    <span className="stat-title">Monthly Spending</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-monthly-spend">₹0.00</div>
                <div className="stat-meta" id="stat-monthly-budget-comparison">0% of monthly limit</div>
            </div>

            <div className="stat-card card-yearly">
                <div className="stat-header">
                    <span className="stat-title">Yearly Spending</span>
                    <div className="stat-icon-wrapper">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    </div>
                </div>
                <div className="stat-value" id="stat-yearly-spend">₹0.00</div>
                <div className="stat-meta">Accumulated this calendar year</div>
            </div>
        </section>

    )
}

export default ExpenseStatus