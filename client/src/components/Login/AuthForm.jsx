import React, { useState, useEffect } from 'react'
import SigninForm from './SigninForm'
import SignupForm from './SignupForm'
import { loginUser, registerUser } from '../../APIs/api'

const AuthForm = () => {
    const [isSignIn, setIsSignIn] = useState(true)
    const [isValidCreds, setIsValidCreds] = useState(true)
    const [errorMessage, setErrorMessage] = useState("Incorrect username or password.")
    const [loading, setLoading] = useState(false)
    const [keepLoggedIn, setKeepLoggedIn] = useState(false)
    const [sessionExpiredNotice, setSessionExpiredNotice] = useState("")

    useEffect(() => {
        const expiredNotice = sessionStorage.getItem('sessionExpiredMessage');
        if (expiredNotice) {
            setSessionExpiredNotice(expiredNotice);
            sessionStorage.removeItem('sessionExpiredMessage');
        }
    }, []);

    const displayForm = () => {
        setIsSignIn(prev => !prev)
        setIsValidCreds(true)
        setErrorMessage("")
        setSessionExpiredNotice("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsValidCreds(true);
        setLoading(true);

        try {
            if (isSignIn) {
                const response = await loginUser(email, password);
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                localStorage.setItem('keepLoggedIn', keepLoggedIn ? 'true' : 'false');
                sessionStorage.setItem('sessionActive', 'true');
                // Redirect to dashboard page
                window.location.href = "/";
            } else {
                if (password !== confirmPassword) {
                    setErrorMessage("Passwords do not match.");
                    setIsValidCreds(false);
                    setLoading(false);
                    return;
                }
                await registerUser(name, email, password);
                setIsSignIn(true);
                setErrorMessage("");
                setName("");
                setPassword("");
                setConfirmPassword("");
                alert("Registration successful! Please sign in with your email and password.");
            }
        } catch (error) {
            setErrorMessage(error.message || "Something went wrong. Please check your credentials.");
            setIsValidCreds(false);
        } finally {
            setLoading(false);
        }
    };

    // Form field states
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    return (
        <>
            <div className="auth-tabs">
                <button className={`auth-tab ${isSignIn ? "active" : ""}`} onClick={displayForm}>Sign In</button>
                <button className={`auth-tab ${!isSignIn ? "active" : ""}`} onClick={displayForm}>Sign Up</button>
            </div>
            
            {sessionExpiredNotice && (
                <div className="error-banner" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>⏰</span>
                    <span>{sessionExpiredNotice}</span>
                </div>
            )}

            {!isValidCreds && (
                <div className="error-banner" id="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span id="error-text">{errorMessage}</span>
                </div>
            )}

            <form id="auth-form" onSubmit={handleSubmit}>
                {isSignIn ? (
                    <SigninForm 
                        email={email} 
                        setEmail={setEmail} 
                        password={password} 
                        setPassword={setPassword} 
                        keepLoggedIn={keepLoggedIn}
                        setKeepLoggedIn={setKeepLoggedIn}
                    />
                ) : (
                    <SignupForm 
                        name={name} 
                        setName={setName} 
                        email={email} 
                        setEmail={setEmail} 
                        password={password} 
                        setPassword={setPassword} 
                        confirmPassword={confirmPassword} 
                        setConfirmPassword={setConfirmPassword} 
                    />
                )}
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    id="auth-submit-btn" 
                    style={{ 
                        width: "100%", 
                        marginTop: "1.5rem", 
                        justifyContent: "center", 
                        height: "48px", 
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        opacity: loading ? 0.7 : 1 
                    }}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
                </button>
            </form>
        </>
    )
}

export default AuthForm