import React from 'react'
import { useNavigate } from 'react-router-dom'

const LoginHeader = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-logo-header">
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '1.25rem' }}>
                <button 
                    type="button"
                    onClick={() => navigate('/welcome')}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#94a3b8',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                >
                    <span>←</span> Back to Landing Page
                </button>
            </div>

            <div className="logo-icon" onClick={() => navigate('/welcome')} style={{ cursor: 'pointer' }} title="Go to Landing Page">
                <svg viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
            </div>
            <h2 onClick={() => navigate('/welcome')} style={{ cursor: 'pointer' }} title="Go to Landing Page">SpendWise AI</h2>
            <p>Smart habits start here</p>
        </div>
    )
}

export default LoginHeader