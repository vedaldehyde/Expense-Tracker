import React, { useContext } from 'react';
import AppContext from '../../context/AppContext';

const TransferHistoryList = () => {
    const { accountTransfers } = useContext(AppContext);

    if (!accountTransfers || accountTransfers.length === 0) {
        return null; // Don't render card if no transfers exist yet
    }

    return (
        <div className="recent-expenditures-card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>💸</span> Recent Account Transfers
                    </h3>
                    <span className="card-subtitle">Inter-account fund movements (Net wealth neutral)</span>
                </div>
            </div>

            <div className="expenditure-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {accountTransfers.slice(0, 5).map((t) => (
                    <div 
                        key={t.id} 
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: '#818cf8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}>
                                ⇄
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>{t.from_account_name}</span>
                                    <span style={{ color: '#818cf8', fontSize: '0.8rem' }}>➔</span>
                                    <span>{t.to_account_name}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                    {t.description || 'Account Transfer'} • {new Date(t.transferred_on).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8' }}>
                                ₹{t.amount.toLocaleString('en-IN')}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Transfer
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransferHistoryList;
