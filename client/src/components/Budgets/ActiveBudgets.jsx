import React from 'react'

const ActiveBudgets = () => {
  return (
      <section className="dashboard-card card-budgets" id="section-budgets-card">
          <div className="card-header-wrapper">
              <span className="card-title">
                  <svg viewBox="0 0 24 24"><path d="M20 12V8H4v4h16M4 12v4h16v-4H4m16-8H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2z" /></svg>
                  Active Budgets
              </span>
          </div>
          <div className="budget-progress-container">
              <div className="budget-item" id="weekly-budget-item">
                  <div className="budget-info">
                      <span className="budget-name">Weekly Limit</span>
                      <span className="budget-amount"><span id="weekly-budget-spent">₹0</span> / <span id="weekly-budget-limit">₹0</span></span>
                  </div>
                  <div className="progress-bar-bg">
                      <div className="progress-bar-fill" id="weekly-budget-progress"></div>
                  </div>
              </div>

              <div className="budget-item" id="monthly-budget-item">
                  <div className="budget-info">
                      <span className="budget-name">Monthly Limit</span>
                      <span className="budget-amount"><span id="monthly-budget-spent">₹0</span> / <span id="monthly-budget-limit">₹0</span></span>
                  </div>
                  <div className="progress-bar-bg">
                      <div className="progress-bar-fill" id="monthly-budget-progress"></div>
                  </div>
              </div>
          </div>
          <div className="budget-footer">
              <button className="budget-action" id="edit-budgets-btn">
                  Edit Budgets
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              </button>
          </div>
      </section>
  )
}

export default ActiveBudgets