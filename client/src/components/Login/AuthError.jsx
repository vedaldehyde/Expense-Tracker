import React from 'react'

const AuthError = () => {
  return (
    <div class="error-banner" id="error-banner" style="display: none;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span id="error-text">Incorrect username or password.</span>
            </div>
  )
}

export default AuthError