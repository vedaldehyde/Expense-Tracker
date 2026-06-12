import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'

const DashboardHeader = () => {
    const { toggleBudgetModal, toggleExpenseModal, toggleBalanceModal } = useContext(AppContext)
    return (
        <header class="dashboard-header">
            <div class="header-title-wrapper">
                <h1 id="welcome-message">Hello, User</h1>
                <span class="header-subtitle" id="current-date-display">Today is Wednesday, May 27, 2026</span>
            </div>
            <div class="header-accounts-bar" id="header-accounts-container">
                <div class="header-account-card total-balance">
                    <span class="account-icon">💰</span>
                    <div class="account-card-info">
                        <span class="account-card-name">Total Balance</span>
                        <span class="account-card-val" id="header-total-balance">10,00,000</span>
                    </div>
                    <button class="btn-add-balance" onClick={toggleBalanceModal} title="Add Balance">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="header-actions">
                <button onClick={toggleBudgetModal} class="btn btn-secondary" id="open-budget-modal-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20v-6M9 17h6M5 12h14M12 4v8" />
                    </svg>
                    Set Budget
                </button>
                <button onClick={toggleExpenseModal} class="btn btn-primary" id="open-expense-modal-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Expense
                </button>
            </div>
        </header>
    )
}

export default DashboardHeader