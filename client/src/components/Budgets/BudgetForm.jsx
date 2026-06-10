import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'
import { getBudgets, submitBudgetForm } from '../../APIs/api'

const BudgetForm = () => {
    const { toggleBudgetModal, budgetModal, setBudgets } = useContext(AppContext)
    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await submitBudgetForm(data);
            const latestBudgetData = getBudgets()
            setBudgets(latestBudgetData)
            toggleBudgetModal();
            e.target.reset();
        }
        catch(error) {
            console.error("Budget submit error:", error);
        }
    }
    return (
        <div className={budgetModal ? "modal-overlay active" : "modal-overlay"} id="budget-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Configure Budgets</h3>
                    <button className="modal-close-btn" onClick={toggleBudgetModal} id="close-budget-modal-btn">&times;</button>
                </div>
                <form id="configure-budget-form" onSubmit={handleBudgetSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label for="budget-weekly-input">Budget Name</label>
                            <input type="text" name='budget_name' id="budget-weekly-input" required placeholder="Enter budget name" />
                        </div>
                        <div className="form-group">
                            <label for="budget-weekly-input">Target Amount (₹) *</label>
                            <input type="number" name='target_amount' id="budget-weekly-input" min="0" required placeholder="Enter limit" />
                        </div>
                        <div className="form-group">
                            <label for="budget-monthly-input">Start Date</label>
                            <input type="date" name='start_date' id="budget-monthly-input" min="0" required placeholder="Enter monthly limit" />
                        </div>
                        <div className="form-group">
                            <label for="budget-monthly-input">End Date</label>
                            <input type="date" name='end_date' id="budget-monthly-input" min="0" required placeholder="Enter monthly limit" />
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