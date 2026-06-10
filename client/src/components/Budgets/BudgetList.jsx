import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const BudgetList = () => {
    const { budgets } = useContext(AppContext)
    const statusPriority = {
        ACTIVE: 1,
        UPCOMING: 2,
        COMPLETED: 3
    };

    const sortedBudgets = budgets.sort((a, b) => {
        return statusPriority[a.status] - statusPriority[b.status];
    });
    return (
        <section className="dashboard-card card-expenses" id="section-expenses-card">
            <div className="card-header-wrapper">
                <span class="card-title">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    Budget Status
                </span>
            </div>

            <div className="expenses-controls">
                <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" className="input-field" id="expense-search-input" placeholder="Search by name or note..." />
                </div>
                <div className="filter-select-wrapper">
                    <select className="select-field" id="expense-category-filter">
                        <option value="All">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transport">Transport</option>
                        <option value="Health">Health</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div className="filter-select-wrapper">
                    <select className="select-field" id="expense-time-filter">
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Month">This Month</option>
                        <option value="Year">This Year</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="expense-table">
                    <thead>
                        <tr>
                            <th>Budget Name</th>
                            <th>Target Amount</th>
                            <th>Spent Amount</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="expense-list-tbody">
                        {
                          !budgets ? <tr>
                              <td colspan="5" class="table-empty-state">
                                  No transactions found matches your filters.
                              </td>
                          </tr> :
                              sortedBudgets.map(budget => {
                            return(
                                <tr>
                                    <td>
                                        <div className="expense-category-cell">
                                            <span className="category-badge-name">{budget.budget_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="expense-title-desc">
                                            <span className="expense-title-name">₹ {budget.target_amount}</span>
                                        </div>
                                    </td>
                                    <td className="expense-amount-cell">₹ {budget.spent_amount}</td>
                                    <td><span className="expense-title-name">{`${new Date(budget.start_date).getDate()}  ${new Date(budget.start_date).toLocaleString('en-US', { month: 'long' })}  ${new Date(budget.start_date).getFullYear()}`}</span></td>
                                    <td><span className="expense-title-name">{`${new Date(budget.end_date).getDate()}  ${new Date(budget.end_date).toLocaleString('en-US', { month: 'long' })}  ${new Date(budget.end_date).getFullYear()}`}</span></td>
                                    <td className="expense-amount-cell" style={{color: budget.status === 'ACTIVE' ? '#10b981' : budget.status === 'COMPLETED' ? '#ec4899' : 'white'}}>{budget.status}</td>
                                    <td>
                                        <button className="action-delete-btn" data-id="" title="Delete Transaction">
                                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default BudgetList