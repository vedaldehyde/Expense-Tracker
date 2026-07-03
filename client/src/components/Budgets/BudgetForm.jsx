import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'
import { getBudgets, submitBudgetForm } from '../../APIs/api'
import FixedExpenses from './FixedExpenses'

const BudgetForm = () => {
    const { toggleBudgetModal, budgetModal, setBudgets } = useContext(AppContext)
    const [budgetCategory, setBudgetCategory] = useState('regular')

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await submitBudgetForm(data);
            const latestBudgetData = await getBudgets();
            setBudgets(latestBudgetData);
            toggleBudgetModal();
            e.target.reset();
        }
        catch(error) {
            console.error("Budget submit error:", error);
        }
    }

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const formattedDate = today.toISOString().split("T")[0];

    return (
        <div className={budgetModal ? "modal-overlay active" : "modal-overlay"}>
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Configure Budgets</h3>
                    <button className="modal-close-btn" onClick={toggleBudgetModal}>&times;</button>
                </div>
                <form>
                    <div className="modal-body">
                        {/* Budget Strategy */}
                        <div className="form-group">
                            <label htmlFor="budget-mode-select">Budget Strategy *</label>
                            <select id="budget-mode-select" className="select-field" style={{ width: "100%" }} value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} required>
                                <option value="regular">Regular Limit Budget</option>
                                <option value="savings">Savings Goal Tracker</option>
                            </select>
                        </div>

                        {/* Regular Budget Fields */}
                        {budgetCategory === "regular" && (
                            <div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="budget-period-select">
                                            Budget Period *
                                        </label>
                                        <select
                                            id="budget-period-select"
                                            className="select-field"
                                            style={{ width: "100%" }}
                            
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="budget-total-input">
                                            Total Budget (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            id="budget-total-input"
                                            min="0"
                                            placeholder="e.g. 25000"
                                            className="input-field"
                                            style={{ paddingLeft: "1rem" }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="budget-period-select">
                                            Start Date *
                                        </label>
                                        <input type="date" className="select-field" style={{ width: "100%" }}/>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="budget-total-input">
                                            End Date *
                                        </label>
                                        <input type="date" className="select-field" style={{ width: "100%" }}/>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Goal Budget Fields */}
                        {budgetCategory === "savings" && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="goal-name-input">
                                        Goal Description *
                                    </label>
                                    <input
                                        type="text"
                                        id="goal-name-input"
                                        placeholder="e.g. Save for Wedding"
                                        className="input-field"
                                        style={{ paddingLeft: "1rem" }}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="goal-amount-input">
                                            Target Savings Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            id="goal-amount-input"
                                            min="1"
                                            placeholder="e.g. 500000"
                                            className="input-field"
                                            style={{ paddingLeft: "1rem" }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="goal-date-input">
                                            Target Date *
                                        </label>
                                        <input
                                            type="date"
                                            id="goal-date-input"
                                            className="input-field"
                                            style={{ paddingLeft: "1rem" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <FixedExpenses/>
                    </div>
                    
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            // onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Update Budgets
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )





//     return (
//         <div className={budgetModal ? "modal-overlay active" : "modal-overlay"} id="budget-modal">
//             <div className="modal-box">
//                 <div className="modal-header">
//                     <h3>Configure Budgets</h3>
//                     <button className="modal-close-btn" onClick={toggleBudgetModal} id="close-budget-modal-btn">&times;</button>
//                 </div>
//                 <form id="configure-budget-form" onSubmit={handleBudgetSubmit}>
//                     <div className="modal-body">
//                         <div className="form-group">
//                             <label for="budget-weekly-input">Budget Name</label>
//                             <input type="text" name='budget_name' id="budget-weekly-input" required placeholder="Enter budget name" />
//                         </div>
//                         <div className="form-group">
//                             <label for="budget-weekly-input">Target Amount (₹) *</label>
//                             <input type="number" name='target_amount' id="budget-weekly-input" min="0" required placeholder="Enter limit" />
//                         </div>
//                         <div className="form-group">
//                             <label for="budget-monthly-input">Start Date</label>
//                             <input type="date" name='start_date' defaultValue={formattedDate} required placeholder="Enter start date" />
//                         </div>
//                         <div className="form-group">
//                             <label for="budget-monthly-input">End Date</label>
//                             <input type="date" name='end_date' defaultValue={formattedDate}  required placeholder="Enter end date" />
//                         </div>
//                     </div>
//                     <div className="modal-footer">
//                         <button onClick={toggleBudgetModal} type="button" className="btn btn-secondary" id="cancel-budget-btn">Cancel</button>
//                         <button onClick={() => {
//     console.log(document.querySelector('[name="start_date"]').value);
//     console.log(document.querySelector('[name="end_date"]').value);
//   }} type="submit" className="btn btn-primary">Update Budgets</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//   )
}

export default BudgetForm