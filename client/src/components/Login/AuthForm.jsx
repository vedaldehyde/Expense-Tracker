import React, { useState } from 'react'
import SigninForm from './SigninForm'
import SignupForm from './SignupForm'


const AuthForm = () => {
    const [isValidCreds, setIsValidCreds] = useState(true)
    const [isSignIn, setIsSignIn] = useState(true)

    const displayForm = () => {
        setIsSignIn(prev => !prev)
    }
    return (
        <>
            <div className="auth-tabs">
                <button className={`auth-tab ${isSignIn ? "active" : ""}`} onClick={displayForm}>Sign In</button>
                <button className={`auth-tab ${!isSignIn ? "active" : ""}`} onClick={displayForm}>Sign Up</button>
            </div>
            {!isValidCreds && <div className="error-banner" id="error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span id="error-text">Incorrect username or password.</span>
            </div>}
            <form id="auth-form">
                {isSignIn ? <SigninForm /> : <SignupForm />}
                <button type="submit" className="btn btn-primary" id="auth-submit-btn" style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center", height: "48px" }}>
                    {isSignIn ? 'Sign In' : 'Sign Up'}
                </button>
            </form>
        </>
    )
}

export default AuthForm