import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'
import { getIncomes, submitIncomeForm, updateIncomeForm } from '../../APIs/api'

const AddBalance = () => {
    const { addBalance, toggleBalanceModal, setIncomes, incomes, selectedAccount, setSelectedAccount } = useContext(AppContext)
    
    const handleBalanceSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('income form entries ',data);
        
        try {

            if (selectedAccount === 'new') {
                await submitIncomeForm(data);   
            }
            else{
                updateIncomeForm(data)
            }
            const latestIncomeData = await getIncomes();
            console.log('income data ',latestIncomeData);
            setIncomes(latestIncomeData);
            toggleBalanceModal();
            e.target.reset();
        }
        catch(error) {
            console.error("Budget submit error:", error);
        }
    }

    return (
        <div className={addBalance ? "modal-overlay active" : "modal-overlay"} id="balance-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Add Account Balance</h3>
                    <button className="modal-close-btn" onClick={toggleBalanceModal} id="close-balance-modal-btn">&times;</button>
                </div>
                <form id="add-balance-form" onSubmit={handleBalanceSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="balance-account-select">Select Account *</label>
                            <select id="balance-account-select" name="account_id" required onChange={(e) => setSelectedAccount(e.target.value)}>
                                <option value="">--Select Income Source --</option>
                                {incomes.incomesList.map(income => (
                                    <option key={income.id} value={income.id}>
                                        {income.source}
                                    </option>
                                ))}
                                <option key={`new`} value={`new`}>Create new source</option>
                            </select>
                        </div>
                        {
                            selectedAccount === 'new' && <div className="form-group" id="new-account-name-group">
                                <label htmlFor="new-account-name">New Account Source *</label>
                                <input type="text" id="new-account-name" name="source" placeholder="e.g. Axis Bank, Paytm Wallet" />
                            </div> 
                        }
                        <div className="form-group">
                            <label htmlFor="balance-amount-input">Amount to Add (₹) *</label>
                            <input type="number" id="balance-amount-input" name="balance" min="0.01" step="0.01" required placeholder="0.00" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={toggleBalanceModal} id="cancel-balance-btn">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Balance</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddBalance