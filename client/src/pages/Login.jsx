import React from 'react'
import '../css/auth.css'
import LoginHeader from '../components/Login/LoginHeader'
import AuthForm from '../components/Login/AuthForm'

const Login = () => {
  return (
    <div className="auth-page-wrapper">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="auth-container">
            <div className="auth-card">
                <LoginHeader/>
                <AuthForm/>
            </div>  
        </div>
    </div>
  )
}

export default Login