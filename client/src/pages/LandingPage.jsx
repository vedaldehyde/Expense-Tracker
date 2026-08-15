import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('savings');
    const token = localStorage.getItem('token');
    const keepLoggedIn = localStorage.getItem('keepLoggedIn') === 'true';
    const sessionActive = sessionStorage.getItem('sessionActive') === 'true';
    const isAuthenticated = Boolean(token && (keepLoggedIn || sessionActive));

    const handleEnterApp = () => {
        if (isAuthenticated) {
            navigate('/');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-page-wrapper">
            {/* Ambient Background Glows */}
            <div className="landing-glow-1"></div>
            <div className="landing-glow-2"></div>
            <div className="landing-glow-3"></div>

            {/* Header / Navigation Bar */}
            <header className="landing-header">
                <div className="landing-header-container">
                    <div className="landing-logo" onClick={() => navigate('/welcome')}>
                        <div className="landing-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5-1.5z" />
                            </svg>
                        </div>
                        <span className="landing-logo-text">SpendWise AI</span>
                    </div>

                    <nav className="landing-nav-links">
                        <a href="#features">Features</a>
                        <a href="#savings-vault">Savings Vault</a>
                        <a href="#demo">Live Demo</a>
                        <a href="#stats">Why Us</a>
                        <a href="#ai-insights">AI Intelligence</a>
                    </nav>

                    <div className="landing-header-actions">
                        {isAuthenticated ? (
                            <button className="btn btn-primary btn-glow" onClick={() => navigate('/')}>
                                Enter Dashboard →
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-secondary btn-nav-login" onClick={() => navigate('/login')}>
                                    Sign In
                                </button>
                                <button className="btn btn-primary btn-glow" onClick={() => navigate('/login')}>
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-badge">
                    <span className="badge-sparkle">✨</span>
                    <span>AI-POWERED FINANCIAL INTELLIGENCE & SAVINGS VAULT</span>
                </div>

                <h1 className="hero-title">
                    Master Your Money with <span className="gradient-text">Precision & True Savings</span>
                </h1>

                <p className="hero-subtitle">
                    Experience genuine financial control. Separate variable spending limits from dedicated savings goals, contribute to your <strong>True Savings Vault</strong> with double-entry precision, use unallocated savings for shortfall protection, and receive instant AI coaching.
                </p>

                <div className="hero-cta-group">
                    <button className="btn btn-primary hero-btn-lg" onClick={handleEnterApp}>
                        <span>{token ? 'Launch Budget Tracker' : 'Get Started Free'}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                    <a href="#demo" className="btn btn-secondary hero-btn-lg">
                        <span>Explore Features</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </a>
                </div>

                {/* Hero Showcase Mockup */}
                <div className="hero-mockup-container">
                    <div className="mockup-glass-card">
                        <div className="mockup-header">
                            <div className="mockup-dots">
                                <span className="dot dot-red"></span>
                                <span className="dot dot-yellow"></span>
                                <span className="dot dot-green"></span>
                            </div>
                            <div className="mockup-search">spendwise.ai/dashboard</div>
                            <div className="mockup-badge">SAVINGS VAULT ACTIVE</div>
                        </div>

                        <div className="mockup-body">
                            {/* Mock Stat Pill */}
                            <div className="mockup-stat-row">
                                <div className="mockup-stat-card">
                                    <span className="mockup-stat-label">Accumulated Savings</span>
                                    <span className="mockup-stat-val">₹ 15,000</span>
                                    <span className="mockup-stat-sub text-green">🔒 Verified Vault Reserve</span>
                                </div>
                                <div className="mockup-stat-card">
                                    <span className="mockup-stat-label">Unallocated Savings</span>
                                    <span className="mockup-stat-val">₹ 5,000</span>
                                    <span className="mockup-stat-sub" style={{ color: '#fbbf24' }}>⚡ Available for Shortfalls</span>
                                </div>
                                <div className="mockup-stat-card" style={{ position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="mockup-stat-label">Goal: "Buy Laptop"</span>
                                        <span style={{ fontSize: '0.65rem', background: '#10b981', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>+ Add Savings</span>
                                    </div>
                                    <span className="mockup-stat-val">₹ 10,000 <small>/ ₹10,000</small></span>
                                    <div className="mockup-progress-bar">
                                        <div className="mockup-progress-fill fill-savings" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Mock AI Insight Banner */}
                            <div className="mockup-ai-banner">
                                <div className="mockup-ai-icon">💡</div>
                                <div className="mockup-ai-text">
                                    <strong>Savings Vault Shortfall Protection:</strong> "When a ₹2,000 expense exceeds liquid checking balance (₹1,000), SpendWise AI automatically uses ₹1,000 from Unallocated Savings while keeping Goal Savings 100% protected!"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Showcase Grid */}
            <section className="landing-features" id="features">
                <div className="section-header">
                    <span className="section-tag">ENGINEERED FOR FINANCIAL ACCURACY</span>
                    <h2>Four Pillars of Smart Money Management</h2>
                    <p>Designed with mathematical double-entry accounting to eliminate distorted numbers and build genuine wealth.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <h3>Dual Financial Engine</h3>
                        <p>Track variable daily spending limits alongside dedicated long-term savings goals on the same income account without conflicts.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 11V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                                <path d="M16 11h6V9a2 2 0 0 0-2-2h-4" />
                                <circle cx="9" cy="12" r="1" />
                            </svg>
                        </div>
                        <h3>True Savings Vault</h3>
                        <p>Contribute fresh money into specific goals via <strong>+ Add Savings</strong>. Uses double-entry reserve accounting to transfer funds safely.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <h3>Shortfall Fallback Protection</h3>
                        <p>When an expense exceeds your liquid checking balance, fund shortfalls directly from <strong>Unallocated Savings</strong> while protecting goal savings.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-pink">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <h3>AI Spending Coach</h3>
                        <p>Receive real-time category alerts, goal pace recommendations, and personalized strategies to maximize your monthly savings rate.</p>
                    </div>
                </div>
            </section>

            {/* Deep Dive Section: True Savings Vault Architecture */}
            <section className="landing-features" id="savings-vault" style={{ paddingTop: 0 }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '24px',
                    padding: '3rem 2.5rem'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
                        <span className="section-tag" style={{ color: '#34d399' }}>ACCOUNTING MODEL & VAULT ARCHITECTURE</span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.85rem' }}>How The True Savings Vault Works</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6 }}>
                            Unlike simple calculators that inflate numbers, SpendWise AI uses a <strong>Double-Entry Reserve Accounting Model</strong>. Moving money into your savings vault never changes your overall net tracked cash.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.35rem' }}>
                            <div style={{ fontSize: '1.35rem', marginBottom: '0.6rem' }}>💳 1. Liquid Checking</div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.4rem' }}>Spendable Balance</h4>
                            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Represents available cash in bank accounts (e.g. ICICI Bank). Expenses deduct directly from liquid balance.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.35rem' }}>
                            <div style={{ fontSize: '1.35rem', marginBottom: '0.6rem' }}>🔒 2. Goal Contributions</div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#34d399', marginBottom: '0.4rem' }}>+ Add Savings</h4>
                            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Click <strong>+ Add Savings</strong> on active goal cards. Money moves atomically from liquid checking into your savings vault reserve.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '1.35rem' }}>
                            <div style={{ fontSize: '1.35rem', marginBottom: '0.6rem' }}>🔄 3. Rollover Credits</div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#a855f7', marginBottom: '0.4rem' }}>Budget Expiration</h4>
                            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                When a regular budget period ends, leftover unspent money is automatically credited to your unallocated savings vault.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '16px', padding: '1.35rem' }}>
                            <div style={{ fontSize: '1.35rem', marginBottom: '0.6rem' }}>⚡ 4. Shortfall Protection</div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fbbf24', marginBottom: '0.4rem' }}>Savings Fallback</h4>
                            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                When an expense exceeds liquid balance, fund shortfalls directly from unallocated savings without touching your goal savings!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Live Demo Simulator Section */}
            <section className="landing-demo" id="demo">
                <div className="section-header">
                    <span className="section-tag">INTERACTIVE EXPERIENCE</span>
                    <h2>See How SpendWise AI Works</h2>
                    <p>Click through the tabs below to preview the core workflows in action.</p>
                </div>

                <div className="demo-tabs-nav">
                    <button className={`demo-tab ${activeTab === 'savings' ? 'active' : ''}`} onClick={() => setActiveTab('savings')}>
                        🚀 True Savings Vault & Goals
                    </button>
                    <button className={`demo-tab ${activeTab === 'shortfall' ? 'active' : ''}`} onClick={() => setActiveTab('shortfall')}>
                        ⚡ Savings Shortfall Protection
                    </button>
                    <button className={`demo-tab ${activeTab === 'budgets' ? 'active' : ''}`} onClick={() => setActiveTab('budgets')}>
                        🎯 Regular Budgets
                    </button>
                    <button className={`demo-tab ${activeTab === 'aicoach' ? 'active' : ''}`} onClick={() => setActiveTab('aicoach')}>
                        🤖 AI Coach Intelligence
                    </button>
                </div>

                <div className="demo-preview-card">
                    {activeTab === 'savings' && (
                        <div className="demo-tab-content">
                            <div className="demo-info">
                                <h3>True Savings Vault & Contribution Tracking</h3>
                                <p>Contribute fresh funds toward specific savings goals (e.g., Buy Laptop) directly from your checking account. Every contribution deducts from your liquid checking balance and increases your savings vault atomically.</p>
                                <ul className="demo-checklist">
                                    <li>✓ <strong>+ Add Savings</strong> button for instant goal contributions</li>
                                    <li>✓ Double-entry accounting keeps Net Tracked Cash 100% constant</li>
                                    <li>✓ Inclusive daily, weekly, and monthly goal target calculations</li>
                                    <li>✓ Automatic leftover credits when regular budget cycles expire</li>
                                </ul>
                            </div>
                            <div className="demo-visual">
                                <div className="preview-widget widget-savings">
                                    <div className="preview-widget-header">
                                        <span>Savings Goal: "Buy Laptop"</span>
                                        <button style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                            + Add Savings
                                        </button>
                                    </div>
                                    <div className="preview-widget-amount">₹10,000 <small>saved of ₹10,000 goal</small></div>
                                    <div className="preview-bar"><div className="preview-bar-fill fill-savings" style={{ width: '100%' }}></div></div>
                                    <div className="preview-stat-row">
                                        <div><span>Status:</span> <strong className="text-green">COMPLETED</strong></div>
                                        <div><span>Source Account:</span> <strong className="text-purple">ICICI Bank</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shortfall' && (
                        <div className="demo-tab-content">
                            <div className="demo-info">
                                <h3>Savings-Funded Shortfall Fallback</h3>
                                <p>When an essential expense (e.g. ₹2,000) exceeds your checking balance (₹1,000), SpendWise AI offers to fund the ₹1,000 shortfall from your <strong>Unallocated Savings Vault</strong>.</p>
                                <ul className="demo-checklist">
                                    <li>✓ Automatic detection when expense amount > liquid balance</li>
                                    <li>✓ Explicit confirmation modal dialog before withdrawing</li>
                                    <li>✓ Uses unallocated savings from past budget rollovers</li>
                                    <li>✓ <strong>Goal Savings Protected</strong>: Specific goal funds remain 100% intact</li>
                                </ul>
                            </div>
                            <div className="demo-visual">
                                <div className="preview-widget" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <div className="preview-widget-header">
                                        <span style={{ color: '#fbbf24', fontWeight: '700' }}>⚠️ Shortfall Protection Dialog</span>
                                        <span className="badge-fixed" style={{ background: '#f59e0b', color: '#000' }}>SHORTFALL DETECTED</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                                        Expense <strong>₹2,000</strong> exceeds liquid balance (<strong>₹1,000</strong>).
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '0.6rem' }}>
                                        <div>Liquid: <strong style={{ color: '#fff' }}>₹1,000</strong></div>
                                        <div>Shortfall: <strong style={{ color: '#f43f5e' }}>₹1,000</strong></div>
                                        <div>Unallocated: <strong style={{ color: '#34d399' }}>₹5,000</strong></div>
                                        <div>Goal: <strong style={{ color: '#a855f7' }}>Protected 🔒</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'budgets' && (
                        <div className="demo-tab-content">
                            <div className="demo-info">
                                <h3>Regular Variable Limit Tracking</h3>
                                <p>Set a weekly or monthly variable budget limit (e.g. ₹5,000). Every daily variable expense logged automatically deducts from your remaining limit, letting you know instantly if you're on track.</p>
                                <ul className="demo-checklist">
                                    <li>✓ Automatically excludes fixed expenses like Home Rent</li>
                                    <li>✓ Tracks spent amount vs. budget limit in real time</li>
                                    <li>✓ Displays Overspent alerts while keeping active until expiration</li>
                                </ul>
                            </div>
                            <div className="demo-visual">
                                <div className="preview-widget">
                                    <div className="preview-widget-header">
                                        <span>Personal Budget (Monthly)</span>
                                        <span className="badge-active">ACTIVE</span>
                                    </div>
                                    <div className="preview-widget-amount">₹500 <small>spent of ₹5,000 limit</small></div>
                                    <div className="preview-bar"><div className="preview-bar-fill" style={{ width: '10%' }}></div></div>
                                    <div className="preview-stat-row">
                                        <div><span>Remaining:</span> <strong>₹4,500</strong></div>
                                        <div><span>Target Achieved:</span> <strong className="text-green">YES</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'aicoach' && (
                        <div className="demo-tab-content">
                            <div className="demo-info">
                                <h3>AI Financial Coach Intelligence</h3>
                                <p>Get personalized recommendations powered by AI. Receive alerts on overspending categories, smart daily saving pace tips, and interactive financial guidance tailored to your goals.</p>
                                <ul className="demo-checklist">
                                    <li>✓ Smart category spending alerts & trend analysis</li>
                                    <li>✓ Real-time goal pace calculation</li>
                                    <li>✓ Context-aware conversational AI coach</li>
                                </ul>
                            </div>
                            <div className="demo-visual">
                                <div className="preview-widget">
                                    <div className="preview-widget-header">
                                        <span>AI Financial Insight</span>
                                        <span style={{ color: '#a855f7', fontWeight: '700', fontSize: '0.8rem' }}>🤖 AI COACH</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '0.5rem' }}>
                                        "Great job! You saved ₹5,000 from unspent budget rollover. Your laptop goal is 100% completed!"
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
