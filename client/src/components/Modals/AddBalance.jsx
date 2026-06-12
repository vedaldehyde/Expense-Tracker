import React, { useContext } from 'react'
import AppContext from '../../context/AppContext'

const AddBalance = () => {
    const { addBalance, toggleBalanceModal } = useContext(AppContext)
  return (
    <div className={addBalance ? "modal-overlay active" : "modal-overlay"} id="balance-modal">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Add Account Balance</h3>
                    <button className="modal-close-btn" onClick={toggleBalanceModal} id="close-balance-modal-btn">&times;</button>
                </div>
                <form id="add-balance-form">
                    <div className="modal-body">
                        <div className="form-group">
                            <label for="balance-account-select">Select Account *</label>
                            <select id="balance-account-select" required>
                            </select>
                        </div>
                        
                        <div className="form-group" id="new-account-name-group">
                            <label for="new-account-name">New Account Name *</label>
                            <input type="text" id="new-account-name" placeholder="e.g. Axis Bank, Paytm Wallet" />
                        </div>                        
                        <div className="form-group">
                            <label for="balance-amount-input">Amount to Add (₹) *</label>
                            <input type="number" id="balance-amount-input" min="0.01" step="0.01" required placeholder="0.00" />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button"  className="btn btn-secondary" onClick={toggleBalanceModal} id="cancel-balance-btn">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Balance</button>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default AddBalance