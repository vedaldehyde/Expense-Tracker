import React from 'react'

const FixedExpenses = () => {
  return (
      <>
          <div className="form-group" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem",}}>
              <label style={{ marginBottom: "0.5rem", display: "block",}}>Fixed Expenditures & Monthly Bills</label>
              <div id="modal-recurring-list" style={{ marginBottom: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.5rem", maxHeight: "150px", overflowY: "auto",}}>
                  {/* Recurring bills listed dynamically here */}
              </div>

              <div
                  className="modal-add-recurring-inline"
                  style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px dashed var(--border-color)",
                  }}
              >
                  <span
                      style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "var(--text-muted)",
                          display: "block",
                      }}
                  >
                      Add Itemized Fixed Expense:
                  </span>

                  <div
                      className="form-row"
                      style={{
                          gridTemplateColumns: "2fr 1fr",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                      }}
                  >
                      <input
                          type="text"
                          id="modal-rec-title"
                          placeholder="e.g. Rent, Gym"
                          className="input-field"
                          style={{
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.85rem",
                              paddingLeft: "0.75rem",
                          }}
                      />

                      <input
                          type="number"
                          id="modal-rec-amount"
                          min="1"
                          placeholder="Amount (₹)"
                          className="input-field"
                          style={{
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.85rem",
                              paddingLeft: "0.75rem",
                          }}
                      />
                  </div>

                  <div
                      className="form-row"
                      style={{
                          gridTemplateColumns: "1.5fr 1fr",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                      }}
                  >
                      <select
                          id="modal-rec-category"
                          className="select-field"
                          defaultValue="Others"
                          style={{
                              padding: "0.5rem 2rem 0.5rem 0.75rem",
                              fontSize: "0.85rem",
                              width: "100%",
                          }}
                      >
                          <option value="Utilities">Utilities</option>
                          <option value="Food">Food</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Transport">Transport</option>
                          <option value="Health">Health</option>
                          <option value="Others">Others</option>
                      </select>

                      <input
                          type="number"
                          id="modal-rec-due"
                          min="1"
                          max="28"
                          placeholder="Due Day (1-28)"
                          className="input-field"
                          style={{
                              padding: "0.5rem 0.75rem",
                              fontSize: "0.85rem",
                              paddingLeft: "0.75rem",
                          }}
                      />
                  </div>

                  <button
                      type="button"
                      id="modal-rec-add-btn"
                      className="btn btn-secondary"
                      style={{
                          width: "100%",
                          padding: "0.4rem",
                          fontSize: "0.8rem",
                          height: "34px",
                      }}
                  >
                      + Add Item
                  </button>
              </div>

              <div
                  style={{
                      marginTop: "0.5rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textAlign: "right",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                  }}
              >
                  <span
                      style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: "normal",
                      }}
                  >
                      Will show in Monthly Bills card
                  </span>

                  <span>
                      Total Fixed:{" "}
                      <span
                          id="modal-fixed-total-display"
                          style={{
                              color: "var(--primary)",
                              fontWeight: 700,
                          }}
                      >
                          ₹0
                      </span>
                  </span>
              </div>
          </div>
      </>
  )
}

export default FixedExpenses