import React, { useState } from 'react'
import AuthFooter from './AuthFooter'

const SigninForm = ({ email, setEmail, password, setPassword, keepLoggedIn, setKeepLoggedIn }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
        <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                    type="email" 
                    required 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
        </div>

        <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                    type={showPassword ? "text" : "password"} 
                    id="auth-password" 
                    required 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="button" 
                    className="eye-toggle-btn" 
                    id="password-eye-btn" 
                    title="Toggle Password Visibility"
                    onClick={() => setShowPassword(prev => !prev)}
                >
                    {showPassword ? (
                        <svg className="eye-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    ) : (
                        <svg className="eye-icon-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    )}
                </button>
            </div>
        </div>

        {/* Keep Me Logged In Checkbox */}
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '0.85rem 0 1.25rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                <input 
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    style={{ 
                        accentColor: '#6366f1', 
                        width: '16px', 
                        height: '16px', 
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                />
                <span>Keep me logged in on this browser</span>
            </label>
        </div>

        <AuthFooter/>
    </>
  )
}

export default SigninForm