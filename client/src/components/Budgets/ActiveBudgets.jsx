import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const ActiveBudgets = () => {
    const { budgets } = useContext(AppContext)
    console.log('budget data ', budgets)

    const activeBudget = budgets.find(b => b.status === "ACTIVE");
    const nextUpcomingBudget = budgets.filter(b => b.status === "UPCOMING").sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
    const budgetToDisplay = activeBudget || nextUpcomingBudget;
    const progressWidth = Math.min(100, (100 * budgetToDisplay?.spent_amount) / budgetToDisplay?.target_amount)
    console.log('width ', progressWidth);
    

  return (
      <section className="dashboard-card card-budgets" id="section-budgets-card">
          <div className="card-header-wrapper">
              <span className="card-title">
                  <svg viewBox="0 0 24 24"><path d="M20 12V8H4v4h16M4 12v4h16v-4H4m16-8H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2z" /></svg>
                  {activeBudget ? 'Active Budgets' : nextUpcomingBudget ? 'Upcoming Budget' : 'No Upcoming Budgets'}
              </span>
          </div>
          {
            budgetToDisplay ? <div className="budget-progress-container">
              <div className="budget-item" id="weekly-budget-item">
                  <div className="budget-info">
                      <span className="budget-name">{budgetToDisplay?.budget_name[0].toUpperCase() + budgetToDisplay?.budget_name.substring(1)}</span>
                  </div>
                  <div className="budget-info">
                      <div className="budget-name"><h3>Valid till : {budgetToDisplay?.end_date}</h3></div>
                  </div>
              </div>
              <div className="budget-item" id="weekly-budget-item">
                  <div className="budget-info">
                      <span className="budget-name">Savings Progress</span>
                      <span className="budget-amount"><span id="weekly-budget-spent">₹ {budgetToDisplay?.spent_amount}</span> / <span id="weekly-budget-limit">₹ {budgetToDisplay?.target_amount}</span></span>
                  </div>
                  <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{width: `${progressWidth}%`}} id="weekly-budget-progress"></div>
                  </div>
              </div>
          </div> : <p>No new budgets</p>
          }
          
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