import { NavLink } from 'react-router-dom'

const SideNav = () => {
  return (
      <aside className="sidebar">
          <div className="sidebar-logo">
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
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
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
          </nav>

          <div className="sidebar-footer">
              <button id="theme-toggle-btn" className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                  <svg className="sun-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
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
                  <svg className="moon-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span id="theme-toggle-text">Light Mode</span>
              </button>
              <button
                  id="reset-app-btn"
                  className="btn btn-secondary"
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
                      <div className="avatar">G</div>
                      <div className="user-info">
                          <span className="user-name">Guest User</span>
                          <span className="user-role">Smart Spender</span>
                      </div>
                  </div>
                  <button
                      id="logout-btn"
                      title="Logout"
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
  )
}

export default SideNav