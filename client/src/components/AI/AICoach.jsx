import React from 'react'

const AICoach = () => {
  return (
    <section className="dashboard-card card-ai-insights" id="section-ai-card">
                    <div className="card-header-wrapper">
                        <span className="card-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                                <path d="M12 2a5 5 0 0 0-5 5c0 2.22 1.21 3.16 2 4 .5.5 1 1.5 1 2.5h4c0-1 .5-2 1-2.5.79-.84 2-1.78 2-4a5 5 0 0 0-5-5zM9 22h6M10 18h4"/>
                            </svg>
                            SpendWise Coach
                        </span>
                        <div className="stat-icon-wrapper" style={{width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)'}}>
                            <span style={{fontSize: '0.65rem', fontWeight: '800'}}>AI</span>
                        </div>
                    </div>
                    
                    <div className="ai-coach-container" id="ai-coach-suggestion-list">
                    </div>
                </section>
  )
}

export default AICoach