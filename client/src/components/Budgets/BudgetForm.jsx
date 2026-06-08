import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const BudgetForm = () => {
    const { toggleBudgetModal, budgetModal } = useContext(AppContext)
    return (
        <div className={budgetModal ? "modal-overlay active" : "modal-overlay"} id="budget-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Configure Budgets</h3>
                    <button className="modal-close-btn" onClick={toggleBudgetModal} id="close-budget-modal-btn">&times;</button>
                </div>
                <form id="configure-budget-form">
                    <div className="modal-body">
                        <div className="form-group">
                            <label for="budget-weekly-input">Target Amount (₹) *</label>
                            <input type="number" id="budget-weekly-input" min="0" required placeholder="Enter weekly limit" />
                        </div>
                        <div className="form-group">
                            <label for="budget-monthly-input">Start Date</label>
                            <input type="date" id="budget-monthly-input" min="0" required placeholder="Enter monthly limit" />
                        </div>
                        <div className="form-group">
                            <label for="budget-monthly-input">End Date</label>
                            <input type="date" id="budget-monthly-input" min="0" required placeholder="Enter monthly limit" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button onClick={toggleBudgetModal} type="button" className="btn btn-secondary" id="cancel-budget-btn">Cancel</button>
                        <button type="submit" className="btn btn-primary">Update Budgets</button>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default BudgetForm