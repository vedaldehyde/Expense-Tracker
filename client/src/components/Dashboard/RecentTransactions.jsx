import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AppContext from '../../context/AppContext'
import { getCategoryColor, getCategoryIcon } from '../../utils/categoryHelpers'

const RecentTransactions = ({ style }) => {
    const { expenses } = useContext(AppContext);
    const navigate = useNavigate();

    // Get the 3 most recent expenses
    const recentExpenses = expenses ? expenses.slice(0, 3) : [];

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "0";
        return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', ...style }}>
            <div className="card-header-wrapper" style={{ margin: 0, paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="card-title" style={{ fontSize: '1rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
                        <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    Recent Expenditures
                </span>
                <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => navigate('/expenses')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'fit-content' }}
                >
                    View All
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentExpenses.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                        No transactions recorded yet.
                    </span>
                ) : (
                    recentExpenses.map(expense => {
                        const lowerCat = expense.category_type?.toLowerCase() || '';
                        const predefinedBadges = ['food', 'utilities', 'entertainment', 'transport', 'health', 'others'];
                        const isPredefined = predefinedBadges.includes(lowerCat);
                        
                        const badgeClass = `category-badge-icon ${isPredefined ? `badge-${lowerCat}` : ''}`;
                        const catColor = getCategoryColor(expense.category_type);
                        const badgeStyle = isPredefined ? { width: '36px', height: '36px' } : {
                            width: '36px',
                            height: '36px',
                            backgroundColor: catColor.startsWith('hsl') ? catColor.replace(')', ', 0.15)') : catColor + '26',
                            color: catColor
                        };

                        return (
                            <div 
                                key={expense.expense_id || expense.id}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0.75rem',
                                    background: 'rgba(255, 255, 255, 0.01)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid rgba(255, 255, 255, 0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className={badgeClass} style={badgeStyle}>
                                        {getCategoryIcon(expense.category_type)}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {expense.title}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {expense.category_type} • {formatDate(expense.transaction_date)}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                    ₹ {formatCurrency(expense.amount)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RecentTransactions;
