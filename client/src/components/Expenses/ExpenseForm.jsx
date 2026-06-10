import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'
import { getBudgets, getExpenses, submitExpenseForm } from '../../APIs/api'

const ExpenseForm = () => {
    const { expenseModal, toggleExpenseModal, expenseCategories, setExpenses, setBudgets } = useContext(AppContext)
    
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Category id', typeof data.expense_category);
        
        try {
            await submitExpenseForm(data);
            const latestExpenses = await getExpenses();
            setExpenses(latestExpenses);
            const latestBudgetData = await getBudgets()
            setBudgets(latestBudgetData)
            toggleExpenseModal();
            e.target.reset();
        }
        catch(error) {
            console.error(error);
        }
    }
  return (
    <div className={ expenseModal ? "modal-overlay active" : "modal-overlay"} id="expense-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3 id="expense-modal-title">Add Expense</h3>
                    <button onClick={toggleExpenseModal} className="modal-close-btn" id="close-expense-modal-btn">&times;</button>
                </div>
                <form id="add-expense-form" onSubmit={handleExpenseSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label for="expense-title">Expense Title *</label>
                            <input type="text" id="expense_title" name='expense_title' required placeholder="e.g., Starbucks Coffee"/>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label for="expense-amount">Amount (₹) *</label>
                                <input type="number" name='expense_amount' id="expense-amount" step="0.01" min="0.01" required placeholder="0.00"/>
                            </div>
                            <div className="form-group">
                                <label for="expense-category">Category *</label>
                                <select id="expense-category" required name='expense_category'>
                                    <option className='expense-category-cell' value="" disabled selected>Select category</option>
                                    {
                                        expenseCategories.map(category => <option className='expense-category-cell' value={category.id}>{category.category_type}</option>)
                                    }
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label for="expense_date">Date *</label>
                                <input type="date" id="expense-date" name='expense_date'/>
                            </div>
                            <div className="form-group">
                                <label for="expense_time">Time</label>
                                <input type="time" id="expense-time" name='expense-time'/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label for="expense-notes">Notes</label>
                            <textarea id="expense-notes" name='expense_notes' placeholder="Any extra details (optional)..."></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={toggleExpenseModal} id="cancel-expense-btn">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default ExpenseForm