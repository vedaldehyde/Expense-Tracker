import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'
import { getCategoryColor, getCategoryIcon } from '../../utils/categoryHelpers'

const Expenses = () => {
    const { expenses } = useContext(AppContext)
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "0.00";
        return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Pagination calculations
    const totalPages = expenses ? Math.ceil(expenses.length / recordsPerPage) : 0;
    const activePage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedExpenses = expenses ? expenses.slice((activePage - 1) * recordsPerPage, activePage * recordsPerPage) : [];

    return (
        <section className="dashboard-card card-expenses" id="section-expenses-card">
            <div className="card-header-wrapper">
                <span className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Expense Log
                </span>
            </div>

            <div className="expenses-controls">
                <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
                            <th style={{ width: '25%' }}>Category</th>
                            <th style={{ width: '45%' }}>Description</th>
                            <th style={{ width: '18%' }}>Date</th>
                            <th style={{ width: '12%', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="expense-list-tbody">
                        {
                            paginatedExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="table-empty-state" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedExpenses.map(expense => {
                                    const lowerCat = expense.category_type?.toLowerCase() || '';
                                    const predefinedBadges = ['food', 'utilities', 'entertainment', 'transport', 'health', 'others'];
                                    const isPredefined = predefinedBadges.includes(lowerCat);
                                    
                                    const badgeClass = `category-badge-icon ${isPredefined ? `badge-${lowerCat}` : ''}`;
                                    const catColor = getCategoryColor(expense.category_type);
                                    const badgeStyle = isPredefined ? {} : {
                                        backgroundColor: catColor.startsWith('hsl') ? catColor.replace(')', ', 0.15)') : catColor + '26',
                                        color: catColor
                                    };

                                    return (
                                        <tr key={expense.expense_id || expense.id}>
                                            <td>
                                                <div className="expense-category-cell">
                                                    <div className={badgeClass} style={badgeStyle}>
                                                        {getCategoryIcon(expense.category_type)}
                                                    </div>
                                                    <span className="category-badge-name" style={{ fontWeight: '600' }}>
                                                        {expense.category_type || 'General'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="expense-title-desc">
                                                    <span className="expense-title-name">{expense.title}</span>
                                                    {expense.description && (
                                                        <span className="expense-desc-text">{expense.description}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="expense-title-name" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(expense.transaction_date)}
                                                </span>
                                            </td>
                                            <td className="expense-amount-cell" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                ₹ {formatCurrency(expense.amount)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.85rem'
                }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={activePage === 1}
                        style={{ padding: '0.25rem 0.75rem', opacity: activePage === 1 ? 0.4 : 1, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    <span style={{ color: 'var(--text-muted)' }}>
                        Page <strong>{activePage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={activePage === totalPages}
                        style={{ padding: '0.25rem 0.75rem', opacity: activePage === totalPages ? 0.4 : 1, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    )
}

export default Expenses