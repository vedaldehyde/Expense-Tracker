import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';

const ActiveBudgets = ({ style }) => {
    const { budgets, toggleSavingsModal } = useContext(AppContext);
    const navigate = useNavigate();

    // Filter budgets to get active ones by is_active status or ACTIVE/OVERSPENT budget_status
    const activeBudgets = budgets ? budgets.filter(b => 
        (b.is_active === true || b.budget_status?.toUpperCase() === "ACTIVE" || b.budget_status?.toUpperCase() === "OVERSPENT") &&
        b.budget_status?.toUpperCase() !== "COMPLETED" &&
        b.budget_status?.toUpperCase() !== "PAST DUE" &&
        b.budget_status?.toUpperCase() !== "UPCOMING"
    ) : [];
    
    // Filter and sort upcoming budgets
    const upcomingBudgets = budgets 
        ? budgets.filter(b => b.budget_status?.toUpperCase() === "UPCOMING").sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        : [];

    const budgetsToDisplay = activeBudgets.length > 0 ? activeBudgets : (upcomingBudgets.length > 0 ? upcomingBudgets : (budgets || []));

    const formatBudgetName = (name) => {
        if (!name) return "Budget Cycle";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "0";
        return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    const getPeriodTracking = (budget) => {
        if (!budget || budget.budget_type?.toLowerCase() !== 'savings') return null;

        const freq = (budget.frequency || 'monthly').toLowerCase();
        const periodTarget = budget.budget_amount > 0 ? budget.budget_amount : budget.target_amount;
        const totalSaved = budget.saved_amount || budget.spent_amount || 0;
        
        let status = 'Not Started';
        if (totalSaved >= budget.target_amount) {
            status = 'Completed';
        } else if (totalSaved >= periodTarget && periodTarget > 0) {
            status = 'On Track';
        } else if (totalSaved > 0) {
            status = 'Behind';
        }

        const periodRemaining = Math.max(0, periodTarget - Math.min(totalSaved, periodTarget));

        return {
            frequency: freq,
            periodTarget,
            periodSaved: totalSaved,
            periodRemaining,
            status
        };
    };

    return (
        <section className="dashboard-card card-budgets" id="section-budgets-card" style={style}>
            <div className="card-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                        <path d="M20 12V8H4v4h16M4 12v4h16v-4H4m16-8H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2z" />
                    </svg>
                    {activeBudgets.length > 0 ? 'Ongoing Budgets' : upcomingBudgets.length > 0 ? 'Upcoming Budgets' : 'Budget Tracker'}
                </span>
            </div>

            {budgetsToDisplay.length > 0 ? (
                <div className="budget-progress-container" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {budgetsToDisplay.map((budget, index) => {
                        const isSavings = budget.budget_type?.toLowerCase() === "savings";
                        
                        const limitOrTarget = isSavings ? (budget.target_amount || budget.budget_amount) : budget.budget_amount;
                        const spentOrSaved = isSavings ? (budget.saved_amount || 0) : (budget.spent_amount || 0); 
                        const remaining = budget.remaining_amount !== undefined && budget.remaining_amount !== null ? budget.remaining_amount : Math.max(0, limitOrTarget - spentOrSaved);
                        const progressWidth = budget.spending_percentage !== undefined && budget.spending_percentage !== null ? budget.spending_percentage : (limitOrTarget > 0 ? (spentOrSaved / limitOrTarget) * 100 : 0); 

                        const isOverspent = !isSavings && budget.spent_amount > budget.budget_amount;
                        const overspentAmount = isOverspent ? (budget.spent_amount - budget.budget_amount) : 0;
                        const isDanger = !isSavings && (progressWidth >= 80 || isOverspent);
                        const progressClass = isDanger ? "danger" : "safe";
                        const isPastDue = budget.budget_status?.toUpperCase() === 'PAST DUE';
                        const isAchieved = isSavings && (remaining <= 0 || progressWidth >= 100);

                        const periodInfo = isSavings ? getPeriodTracking(budget) : null;

                        return (
                            <div 
                                key={budget.budget_id || budget.id || index} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.75rem',
                                    borderBottom: index < budgetsToDisplay.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                    paddingBottom: index < budgetsToDisplay.length - 1 ? '1.25rem' : '0'
                                }}
                            >
                                {/* Budget Metadata */}
                                <div className="budget-header-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="budget-name" style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                                            {formatBudgetName(budget.budget_name)}
                                            <span className={`ai-badge ${isSavings ? (isAchieved ? 'badge-save' : 'badge-spend') : (isDanger ? 'badge-alert' : 'badge-save')}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                                                {isSavings ? (isAchieved ? 'ACHIEVED' : isPastDue ? 'PAST DUE' : 'SAVINGS GOAL') : (isOverspent ? 'OVERSPENT' : isDanger ? 'CRITICAL' : 'HEALTHY')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            Source: <strong style={{ color: '#cbd5e1' }}>{budget.income_source || 'Checking'}</strong>
                                        </div>
                                    </div>

                                    {/* Action Button for Savings Goal */}
                                    {isSavings && !isAchieved && !isPastDue && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                console.log("[ActiveBudgets] + Add Savings clicked for:", budget);
                                                toggleSavingsModal(budget);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.45rem 0.9rem',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                position: 'relative',
                                                zIndex: 10,
                                                pointerEvents: 'auto'
                                            }}
                                        >
                                            + Add Savings
                                        </button>
                                    )}
                                </div>

                                {/* Main Stats Display */}
                                <div style={{
                                    background: isOverspent ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    border: isOverspent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.85rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.4rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {isSavings ? 'Remaining to Goal' : 'Remaining Spend Limit'}
                                        </span>
                                        {isOverspent && (
                                            <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: '700' }}>
                                                ⚠️ Overspent by ₹{formatCurrency(overspentAmount)}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '800',
                                        color: isSavings ? 'var(--primary)' : (isDanger ? 'var(--danger)' : 'var(--success)')
                                    }}>
                                        ₹ {formatCurrency(remaining)}
                                    </div>
                                    <div className="budget-stat-meta-row">
                                        <span>{isSavings ? 'Total Saved:' : 'Spent:'} <strong>₹ {formatCurrency(spentOrSaved)}</strong></span>
                                        <span>{isSavings ? 'Goal Target:' : 'Budget Limit:'} <strong>₹ {formatCurrency(limitOrTarget)}</strong></span>
                                    </div>
                                </div>

                                {/* Period Progress Section for Savings Budget */}
                                {isSavings && periodInfo && (
                                    <div style={{
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '10px',
                                        padding: '0.75rem 0.9rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', textTransform: 'capitalize' }}>
                                                {periodInfo.frequency} Period Progress
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '6px',
                                                background: periodInfo.status === 'Completed' || periodInfo.status === 'On Track'
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : periodInfo.status === 'Behind'
                                                    ? 'rgba(245, 158, 11, 0.2)'
                                                    : 'rgba(148, 163, 184, 0.2)',
                                                color: periodInfo.status === 'Completed' || periodInfo.status === 'On Track'
                                                    ? '#34d399'
                                                    : periodInfo.status === 'Behind'
                                                    ? '#fbbf24'
                                                    : '#94a3b8',
                                                border: `1px solid ${
                                                    periodInfo.status === 'Completed' || periodInfo.status === 'On Track'
                                                        ? 'rgba(52, 211, 153, 0.4)'
                                                        : periodInfo.status === 'Behind'
                                                        ? 'rgba(251, 191, 36, 0.4)'
                                                        : 'rgba(148, 163, 184, 0.4)'
                                                }`
                                            }}>
                                                {periodInfo.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                                            <div>Period Target: <strong style={{ color: '#f8fafc' }}>₹{formatCurrency(periodInfo.periodTarget)}</strong></div>
                                            <div>Saved This Period: <strong style={{ color: '#38bdf8' }}>₹{formatCurrency(periodInfo.periodSaved)}</strong></div>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar Item */}
                                <div className={`budget-item ${progressClass}`}>
                                    <div className="progress-bar-bg" style={{ height: '8px' }}>
                                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, progressWidth)}%` }}></div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.75rem',
                                        marginTop: '0.25rem'
                                    }}>
                                        <span style={{ color: isDanger ? 'var(--danger)' : 'var(--text-muted)' }}>
                                            {progressWidth.toFixed(1)}% {isSavings ? 'goal saved' : 'limit utilized'}
                                        </span>
                                        <span style={{ color: isSavings ? 'var(--primary)' : (isDanger ? 'var(--danger)' : 'var(--success)'), fontWeight: '600' }}>
                                            {isSavings 
                                                ? (isAchieved ? 'Goal Achieved!' : 'On Track') 
                                                : (isOverspent ? `Overspent by ₹${formatCurrency(overspentAmount)}` : isDanger ? 'Warning: High Spending' : 'Spending is on track')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2.5rem 1rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    gap: '0.5rem'
                }}>
                    <span>No active or upcoming budget cycles found.</span>
                    <button 
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => navigate('/budgets')}
                    >
                        Create Budget
                    </button>
                </div>
            )}
            
            <div className="budget-footer" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button 
                    className="budget-action" 
                    id="edit-budgets-btn"
                    onClick={() => navigate('/budgets')}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Manage Budgets
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px' }}>
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default ActiveBudgets;