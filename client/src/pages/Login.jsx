import React from 'react'
import '../css/auth.css'
import LoginHeader from '../components/Login/LoginHeader'
import AuthForm from '../components/Login/AuthForm'

const Login = () => {
  return (
    <>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
        <div className="auth-container">
            <div class="auth-card">
                <LoginHeader/>
                <AuthForm/>
            </div>  
        </div>
    </>
  )
}

export default Login