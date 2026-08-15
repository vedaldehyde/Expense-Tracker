import { useState, useEffect, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AppContext from '../context/AppContext'

const SideNav = () => {
  const { toggleFeedbackModal, isAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const displayName = user ? user.name : "Guest User";
  const displayEmail = user ? user.email : "Smart Spender";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const isUserAdmin = isAdmin || (user?.email && user.email.toLowerCase().includes('vedant'));

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(prev => !prev);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset local app data? This will sign you out and clear local cache.")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('keepLoggedIn');
    sessionStorage.removeItem('sessionActive');
    window.location.href = "/welcome";
  };

  return (
    <>
      {/* Top Header Bar for Mobile Devices */}
      <div className="mobile-top-bar">
        <div className="mobile-top-logo" onClick={() => navigate('/welcome')}>
          <div className="logo-icon small">
            <svg viewBox="0 0 24 24">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <span className="mobile-logo-text">SpendWise AI</span>
        </div>

        <div className="mobile-top-actions">
          <button className="mobile-action-btn" onClick={toggleTheme} title="Toggle Theme">
            {isLightMode ? '🌙' : '☀️'}
          </button>
          <div className="avatar small-avatar">{avatarLetter}</div>
          <button className="mobile-action-btn logout-color" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Sidebar (Desktop / Tablet & Bottom Bar on Mobile) */}
      <aside className="sidebar">
          <div className="sidebar-logo" onClick={() => navigate('/welcome')}>
              <div className="logo-icon">
                  <svg viewBox="0 0 24 24">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
              </div>
              <span className="logo-text">SpendWise AI</span>
          </div>

          <nav className="sidebar-nav">
              <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} to='/'>
                  <svg viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="9" rx="1" />
                      <rect x="14" y="3" width="7" height="5" rx="1" />
                      <rect x="14" y="12" width="7" height="9" rx="1" />
                      <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                  <span>Dashboard</span>
              </NavLink>
              <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-section="expenses" to='/expenses'>
                  <svg viewBox="0 0 24 24">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>Expenses</span>
              </NavLink>
              <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-section="budgets" to='/budgets'>
                  <svg viewBox="0 0 24 24">
                      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
                      <path d="M16 11h4v2h-4z" />
                  </svg>
                  <span>Budgets</span>
              </NavLink>
              <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-section="ai-insights" to='/aicoach'>
                  <svg viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span>AI Coach</span>
              </NavLink>
              <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} data-section="app-intro" to='/welcome'>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>App Intro</span>
              </NavLink>
              <button 
                  type="button" 
                  className="nav-item" 
                  onClick={toggleFeedbackModal}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Give Feedback</span>
              </button>

              {isUserAdmin && (
                  <NavLink className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} to='/admin/feedback' style={{ color: '#f59e0b', fontWeight: '700' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span>Admin Portal</span>
                  </NavLink>
              )}
          </nav>

          <div className="sidebar-footer">
              <button id="theme-toggle-btn" className="btn btn-secondary" onClick={toggleTheme} style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  {isLightMode ? (
                    <>
                      <svg className="sun-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                          <circle cx="12" cy="12" r="5"></circle>
                          <line x1="12" y1="1" x2="12" y2="3"></line>
                          <line x1="12" y1="21" x2="12" y2="23"></line>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                          <line x1="1" y1="12" x2="3" y2="12"></line>
                          <line x1="21" y1="12" x2="23" y2="12"></line>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="moon-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <span>Light Mode</span>
                    </>
                  )}
              </button>
              <button
                  id="reset-app-btn"
                  className="btn btn-secondary"
                  onClick={handleResetData}
                  style={{
                      width: '100%',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                      padding: '0.5rem 1rem',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f43f5e'
                  }}
              >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                  </svg>
                  Reset Demo Data
              </button>
              <div className="user-profile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar">{avatarLetter}</div>
                      <div className="user-info">
                          <span className="user-name">{displayName}</span>
                          <span className="user-role" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{displayEmail}</span>
                      </div>
                  </div>
                  <button
                      id="logout-btn"
                      title="Logout"
                      onClick={handleLogout}
                      style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition-fast)'
                      }}
                  >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                  </button>
              </div>
          </div>
      </aside>
    </>
  )
}

export default SideNav