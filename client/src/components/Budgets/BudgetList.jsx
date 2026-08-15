import React, { useContext, useState } from 'react'
import AppContext from '../../context/AppContext'

const BudgetList = () => {
    const { budgets, toggleSavingsModal } = useContext(AppContext)
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const statusPriority = {
        ACTIVE: 1,
        UPCOMING: 2,
        COMPLETED: 3,
        "PAST DUE": 4
    };
    
    const sortedBudgets = budgets ? [...budgets].sort((a, b) => {
        const priorityA = statusPriority[a.budget_status?.toUpperCase()] || 99;
        const priorityB = statusPriority[b.budget_status?.toUpperCase()] || 99;
        return priorityA - priorityB;
    }) : [];

    const filteredBudgets = sortedBudgets.filter(budget => {
        const matchesSearch = !searchQuery || 
            (budget.budget_name && budget.budget_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (budget.income_source && budget.income_source.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = typeFilter === 'All' || 
            (budget.budget_type && budget.budget_type.toLowerCase() === typeFilter.toLowerCase());

        const matchesStatus = statusFilter === 'All' || 
            (budget.budget_status && budget.budget_status.toUpperCase() === statusFilter.toUpperCase());

        return matchesSearch && matchesType && matchesStatus;
    });

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "0";
        return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const upper = status?.toUpperCase() || 'UNKNOWN';
        let bg = 'rgba(107, 114, 128, 0.15)';
        let color = '#9ca3af';

        if (upper === 'ACTIVE') {
            bg = 'rgba(16, 185, 129, 0.15)';
            color = '#10b981';
        } else if (upper === 'OVERSPENT' || upper === 'PAST DUE') {
            bg = 'rgba(239, 68, 68, 0.15)';
            color = '#ef4444';
        } else if (upper === 'COMPLETED') {
            bg = 'rgba(139, 92, 246, 0.15)';
            color = '#8b5cf6';
        } else if (upper === 'UPCOMING') {
            bg = 'rgba(59, 130, 246, 0.15)';
            color = '#3b82f6';
        }

        return (
            <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                backgroundColor: bg,
                color: color,
                display: 'inline-block',
                whiteSpace: 'nowrap'
            }}>
                {upper}
            </span>
        );
    };

    const formatBudgetName = (name) => {
        if (!name) return "Budget Cycle";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredBudgets.length / recordsPerPage);
    const activePage = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedBudgets = filteredBudgets.slice((activePage - 1) * recordsPerPage, activePage * recordsPerPage);

    return (
        <section className="dashboard-card card-expenses" id="section-expenses-card">
            <div className="card-header-wrapper">
                <span className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Budget Status
                </span>
            </div>

            <div className="expenses-controls">
                <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input 
                        type="text" 
                        className="input-field" 
                        id="expense-search-input" 
                        placeholder="Search budget name or source..." 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="filter-select-wrapper">
                    <select 
                        className="select-field" 
                        id="expense-category-filter"
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Types</option>
                        <option value="regular">Regular</option>
                        <option value="savings">Savings</option>
                    </select>
                </div>
                <div className="filter-select-wrapper">
                    <select 
                        className="select-field" 
                        id="expense-time-filter"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="OVERSPENT">Overspent</option>
                        <option value="PAST DUE">Past Due</option>
                        <option value="UPCOMING">Upcoming</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="expense-table" style={{ minWidth: '1100px' }}>
                    <thead>
                        <tr>
                            <th>Budget Name</th>
                            <th>Type</th>
                            <th>Frequency</th>
                            <th>Source</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th style={{ textAlign: 'left' }}>Budget / Goal Target</th>
                            <th style={{ textAlign: 'left' }}>Spent</th>
                            <th style={{ textAlign: 'left' }}>Remaining</th>                
                            <th style={{ textAlign: 'left' }}>Saved</th>                
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th>Budget Health</th>
                            {/* <th style={{ textAlign: 'center' }}>Action</th> */}
                        </tr>
                    </thead>
                    <tbody id="expense-list-tbody">
                        {
                            paginatedBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="table-empty-state" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                        No budget logs found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedBudgets.map(budget => {
                                    const isSavings = budget.budget_type?.toLowerCase() === "savings";
                                    const limitOrTarget = isSavings ? (budget.target_amount || budget.budget_amount) : budget.budget_amount;
                                    const spent = isSavings ? 0 : (budget.spent_amount || 0);
                                    const saved = isSavings ? (budget.saved_amount || 0) : (budget.saved_amount || 0); 
                                    const remaining = budget.remaining_amount !== undefined && budget.remaining_amount !== null ? budget.remaining_amount : Math.max(0, limitOrTarget - (isSavings ? saved : spent));
                                    const progressWidth = budget.spending_percentage !== undefined && budget.spending_percentage !== null ? budget.spending_percentage : 0; 

                                    const isDanger = !isSavings && (progressWidth >= 80 || budget.spent_amount > budget.budget_amount);
                                    const progressColor = isSavings ? 'var(--primary)' : (isDanger ? 'var(--danger)' : 'var(--success)');

                                    const daysRemaining = Math.max(1, Math.ceil((new Date(budget.end_date) - new Date()) / (1000 * 60 * 60 * 24)));
                                    const dailyPace = isSavings ? Math.ceil(remaining / daysRemaining) : 0;

                                    const isActiveSavings = isSavings && (budget.is_active || budget.budget_status?.toUpperCase() === 'ACTIVE') && progressWidth < 100;

                                    return (
                                        <tr key={budget.budget_id || budget.id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span className="expense-title-name" style={{ fontWeight: '600' }}>
                                                        {formatBudgetName(budget.budget_name)}
                                                    </span>
                                                    {isActiveSavings && remaining > 0 && (
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>
                                                            💡 Pace: ₹ {formatCurrency(dailyPace)}/day
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                                                    {budget.budget_type || 'regular'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                                                    {budget.frequency || 'monthly'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="expense-title-name" style={{ fontSize: '0.85rem' }}>
                                                    {budget.income_source || 'Personal'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="expense-title-name" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(budget.start_date)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="expense-title-name" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(budget.end_date)}
                                                </span>
                                            </td>
                                            <td className="expense-amount-cell" style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                                                ₹ {formatCurrency(limitOrTarget)}
                                            </td>
                                            <td className="expense-amount-cell" style={{ textAlign: 'left', whiteSpace: 'nowrap', color: isSavings ? 'var(--text-muted)' : 'inherit' }}>
                                                {isSavings ? "₹ 0" : `₹ ${formatCurrency(spent)}`}
                                            </td>
                                            <td className="expense-amount-cell" style={{ textAlign: 'left', whiteSpace: 'nowrap', color: isSavings ? 'var(--primary)' : (isDanger ? 'var(--danger)' : 'var(--success)') }}>
                                                ₹ {formatCurrency(remaining)}
                                            </td>
                                            <td className="expense-amount-cell" style={{ textAlign: 'left', whiteSpace: 'nowrap', color: 'var(--success)' }}>
                                                ₹ {formatCurrency(saved)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {getStatusBadge(budget.budget_status)}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: progressColor }}>
                                                        {progressWidth.toFixed(0)}% {isSavings ? 'saved' : 'spent'}
                                                    </span>
                                                    <div className="progress-bar-bg" style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.05)' }}>
                                                        <div 
                                                            className="progress-bar-fill" 
                                                            style={{ 
                                                                width: `${progressWidth}%`, 
                                                                backgroundColor: progressColor,
                                                                background: progressColor 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {isActiveSavings ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSavingsModal(budget)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '0.3rem 0.65rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap',
                                                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                                                        }}
                                                    >
                                                        + Add Savings
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                                                )}
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

export default BudgetList