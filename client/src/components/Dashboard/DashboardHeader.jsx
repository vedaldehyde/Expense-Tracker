import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const DashboardHeader = () => {
    const { toggleBudgetModal, toggleExpenseModal, toggleBalanceModal, toggleTransferModal, incomes } = useContext(AppContext)
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userName = user?.name ? user.name.split(' ')[0] : 'User';

    return (
        <header className="dashboard-header">
            <div className="header-title-wrapper">
                <h1 id="welcome-message">Hello, {userName}</h1>
                <span className="header-subtitle" id="current-date-display">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="header-accounts-bar" id="header-accounts-container">
                <div className="header-account-card total-balance">
                    <span className="account-icon">💰</span>
                    <div className="account-card-info">
                        <span className="account-card-name">Total Balance</span>
                        <span className="account-card-val" id="header-total-balance">₹ {(incomes?.total_balance || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <button className="btn-add-balance" onClick={toggleBalanceModal} title="Add Balance">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                {
                    incomes?.incomesList ?
                    incomes.incomesList.map(income => (
                        <div key={income.id} className="header-account-card total-balance">
                            <span className="account-icon">💳</span>
                            <div className="account-card-info">
                                <span className="account-card-name">{income.source}</span>
                                <span className="account-card-val">₹ {(income.balance || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <button className="btn-add-balance" onClick={toggleBalanceModal} title="Add Balance">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    )) : null
                }
            </div>
            <div className="header-actions">
                <button onClick={toggleTransferModal} className="btn btn-secondary" id="open-transfer-modal-btn" style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="17 1 21 5 17 9"></polyline>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <polyline points="7 23 3 19 7 15"></polyline>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    Transfer Money
                </button>
                <button onClick={toggleBudgetModal} className="btn btn-secondary" id="open-budget-modal-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20v-6M9 17h6M5 12h14M12 4v8" />
                    </svg>
                    Set Budget
                </button>
                <button onClick={toggleExpenseModal} className="btn btn-primary" id="open-expense-modal-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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