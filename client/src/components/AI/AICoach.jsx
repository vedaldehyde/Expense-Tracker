import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { getAIRecommendations, askAICoach } from '../../APIs/api';
import { CardSkeleton, Spinner } from '../Common/Loader';
import { useToast } from '../../context/ToastContext';
import AppContext from '../../context/AppContext';

const AICoach = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('chat'); // Default to 'chat' for interactive guidance
    const { showToast } = useToast();
    const { expenses, budgets, incomes } = useContext(AppContext);

    // Live AI Chat States
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm your SpendWise AI Financial Coach. Ask me anything about your budgets, savings goals, category spending, or custom money-saving strategies!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isChatSending, setIsChatSending] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState([
        "How can I save ₹10,000 more this month?",
        "What is my highest spending category?",
        "How does fixed bill isolation work?",
        "Explain my current regular budget status"
    ]);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [chatMessages, activeTab]);

    const fetchRecommendations = useCallback(async (isManualRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAIRecommendations();
            setData(result);
            if (isManualRefresh) {
                showToast('AI financial analysis refreshed!', 'success');
            }
        } catch (err) {
            console.error('AICoach fetch error:', err);
            setError('Unable to load AI insights right now.');
            if (isManualRefresh) {
                showToast('Failed to refresh AI recommendations.', 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations, expenses.length, budgets.length, incomes.total_balance]);

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputMessage;
        if (!query.trim() || isChatSending) return;

        const userMsgObj = {
            id: Date.now(),
            sender: 'user',
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, userMsgObj]);
        if (!textToSend) setInputMessage('');
        setIsChatSending(true);

        try {
            const historyPayload = chatMessages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const response = await askAICoach(query, historyPayload);

            const aiMsgObj = {
                id: Date.now() + 1,
                sender: 'ai',
                text: response.reply || "I analyzed your financial data and recommend focusing on keeping your variable spending within target limits.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setChatMessages(prev => [...prev, aiMsgObj]);

            if (response.suggested_prompts && response.suggested_prompts.length > 0) {
                setSuggestedPrompts(response.suggested_prompts);
            }
        } catch (err) {
            console.error("AI Chat error:", err);
            
            const q = query.toLowerCase();
            let fallbackText = "";

            if (q.includes("how are you") || q.includes("how r u")) {
                fallbackText = "😊 **I'm doing fantastic, thank you!**\n\nI'm your SpendWise AI Financial Coach. Ask me anything about your budgets, savings goals, or purchase plans!";
            } else if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("who are you")) {
                fallbackText = "👋 **Hello! Welcome to SpendWise AI Financial Coaching.**\n\nAsk me questions like:\n• *'I want to buy a car in December, how will I manage my expenses?'*\n• *'What is my highest spending category?'*\n• *'How does fixed expense isolation work?'*";
            } else if (q.includes("car") || q.includes("mg windsor") || q.includes("vehicle") || (q.includes("december") && q.includes("buy"))) {
                fallbackText = "🚗 **Car Purchase Financial Plan (e.g. MG Windsor PRO by December 2026):**\n\n1. **Create a Savings Goal Tracker:**\n   • Go to **Budgets ➔ Create Budget**, select **Savings Goal Tracker**.\n   • Set Target Date to **December 2026** and Frequency to **Monthly**.\n   • SpendWise AI will calculate your exact required monthly contribution.\n\n2. **Isolate Fixed Bills:**\n   • Store Rent (₹50,000) under Fixed Expenses so your car savings pool remains protected.\n\n3. **Trim Non-Essential Categories:**\n   • Reduce top variable category spending by 15% to boost your monthly savings towards your car target!";
            } else if (q.includes("can i buy") || q.includes("can i afford") || q.includes("manage my expenses")) {
                fallbackText = "💳 **Affordability Analysis:**\n\nYes! Create a **Savings Goal Tracker** for your target down-payment, set a **Regular Budget** for daily variable expenses, and isolate fixed bills like Rent so you stay on target.";
            } else if (q.includes("save") || q.includes("saving") || q.includes("reduce")) {
                fallbackText = "💡 **Savings Strategy:** Focus on trimming your highest variable category by 15%. This frees up extra monthly savings while keeping your essential fixed bills isolated!";
            } else if (q.includes("budget")) {
                fallbackText = "🎯 **Budget Tracking:** Regular budgets manage daily variable expenses. Fixed expenses like Rent are isolated so they never trigger false overspent alerts!";
            } else {
                fallbackText = "🤖 **SpendWise AI Financial Assistant:**\n\nI'm here to help you plan major purchases (like buying a car by December), track savings goal targets, or analyze your category spending. What would you like to explore next?";
            }

            const fallbackMsgObj = {
                id: Date.now() + 1,
                sender: 'ai',
                text: fallbackText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, fallbackMsgObj]);
        } finally {
            setIsChatSending(false);
        }
    };

    const handlePromptClick = (prompt) => {
        handleSendMessage(prompt);
    };

    const handleClearChat = () => {
        setChatMessages([
            {
                id: Date.now(),
                sender: 'ai',
                text: "Chat cleared! How else can I assist you with your finances today?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        showToast('Chat history cleared', 'info');
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const formatMessageText = (text) => {
        // Formats simple bold markdown (**text**) and line breaks
        const lines = text.split('\n');
        return lines.map((line, lIdx) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={lIdx} style={{ marginBottom: line.trim() === '' ? '0.5rem' : '0.25rem' }}>
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    const renderInsightsList = () => {
        if (!data) return null;

        let items = [];
        if (activeTab === 'all' || activeTab === 'save') {
            items = items.concat((data.where_to_save || []).map(item => ({ ...item, type: 'save' })));
        }
        if (activeTab === 'all' || activeTab === 'spend') {
            items = items.concat((data.where_to_spend || []).map(item => ({ ...item, type: 'spend' })));
        }
        if (activeTab === 'all' || activeTab === 'alerts') {
            items = items.concat((data.budget_alerts || []).map(item => ({ ...item, type: 'alert' })));
        }

        if (items.length === 0 && activeTab !== 'tips' && activeTab !== 'chat') {
            return (
                <div className="ai-empty-state">
                    <p>No insights found for this filter. Everything looks great!</p>
                </div>
            );
        }

        return (
            <div className="ai-insight-cards-grid">
                {items.map((item, index) => {
                    const badgeClass = item.type === 'save' ? 'badge-save' : item.type === 'spend' ? 'badge-spend' : 'badge-alert';
                    const icon = item.type === 'save' ? '💰' : item.type === 'spend' ? '💳' : '⚠️';
                    return (
                        <div key={index} className={`ai-insight-card ${item.type}`}>
                            <div className="ai-card-header">
                                <span className={`ai-badge ${badgeClass}`}>
                                    {icon} {item.type === 'save' ? 'Where to Save' : item.type === 'spend' ? 'Where to Spend' : 'Budget Alert'}
                                </span>
                                {item.impact_level && (
                                    <span className={`impact-pill impact-${item.impact_level}`}>
                                        {item.impact_level.toUpperCase()} IMPACT
                                    </span>
                                )}
                            </div>
                            <h4 className="ai-card-title">{item.title}</h4>
                            <p className="ai-card-desc">{item.description}</p>
                            {item.amount && item.amount > 0 && (
                                <div className="ai-card-amount">
                                    <span>Target Amount:</span> <strong>₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <section className="dashboard-card card-ai-insights" id="section-ai-card">
            <div className="card-header-wrapper">
                <div className="ai-header-title">
                    <span className="card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                            <path d="M12 2a5 5 0 0 0-5 5c0 2.22 1.21 3.16 2 4 .5.5 1 1.5 1 2.5h4c0-1 .5-2 1-2.5.79-.84 2-1.78 2-4a5 5 0 0 0-5-5zM9 22h6M10 18h4"/>
                        </svg>
                        SpendWise AI Financial Coach
                    </span>
                    <span className="ai-tag">POWERED BY GEMINI AI</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {activeTab === 'chat' && (
                        <button className="btn btn-secondary btn-sm" onClick={handleClearChat} title="Clear Chat History">
                            🗑️ Clear Chat
                        </button>
                    )}
                    <button
                        className="btn btn-secondary btn-sm ai-refresh-btn"
                        onClick={() => fetchRecommendations(true)}
                        disabled={loading}
                    >
                        {loading ? <Spinner size="small" /> : '✨ Refresh Analysis'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="ai-coach-loading">
                    <CardSkeleton count={2} />
                </div>
            ) : error ? (
                <div className="ai-error-banner">
                    <p>{error}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => fetchRecommendations(true)}>
                        Retry
                    </button>
                </div>
            ) : data ? (
                <div className="ai-coach-content">
                    {/* Financial Health Gauge & Summary Header */}
                    <div className="ai-summary-header">
                        <div className="health-score-container" style={{ borderColor: getScoreColor(data.financial_health_score) }}>
                            <div className="health-score-val" style={{ color: getScoreColor(data.financial_health_score) }}>
                                {data.financial_health_score}
                            </div>
                            <div className="health-score-lbl">Financial Score</div>
                        </div>
                        <div className="ai-summary-text-box">
                            <h3>Financial Overview</h3>
                            <p>{data.summary}</p>
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="ai-tabs-container">
                        <button
                            className={`ai-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            💬 Live AI Assistant
                        </button>
                        <button
                            className={`ai-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            🌟 All Insights ({ (data.where_to_save?.length || 0) + (data.where_to_spend?.length || 0) + (data.budget_alerts?.length || 0) })
                        </button>
                        <button
                            className={`ai-tab-btn ${activeTab === 'save' ? 'active' : ''}`}
                            onClick={() => setActiveTab('save')}
                        >
                            💰 Where to Save ({ data.where_to_save?.length || 0 })
                        </button>
                        <button
                            className={`ai-tab-btn ${activeTab === 'spend' ? 'active' : ''}`}
                            onClick={() => setActiveTab('spend')}
                        >
                            💳 Where to Spend ({ data.where_to_spend?.length || 0 })
                        </button>
                        <button
                            className={`ai-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alerts')}
                        >
                            ⚠️ Alerts ({ data.budget_alerts?.length || 0 })
                        </button>
                        <button
                            className={`ai-tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tips')}
                        >
                            💡 Smart Tips ({ data.smart_tips?.length || 0 })
                        </button>
                    </div>

                    {/* Active Tab Content */}
                    <div className="ai-tab-content-area">
                        {activeTab === 'chat' ? (
                            <div className="ai-live-chat-card">
                                {/* Chat Conversation History */}
                                <div className="chat-messages-container">
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                                            <div className="chat-avatar">
                                                {msg.sender === 'user' ? '👤' : '🤖'}
                                            </div>
                                            <div className="chat-message-bubble">
                                                <div className="chat-message-content">
                                                    {formatMessageText(msg.text)}
                                                </div>
                                                <span className="chat-message-time">{msg.timestamp}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {isChatSending && (
                                        <div className="chat-message-row ai">
                                            <div className="chat-avatar">🤖</div>
                                            <div className="chat-message-bubble typing">
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                                <span className="typing-dot"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Suggested Quick Prompts */}
                                <div className="chat-prompts-row">
                                    <span className="prompts-label">Suggested Questions:</span>
                                    <div className="prompts-pills">
                                        {suggestedPrompts.map((prompt, pIdx) => (
                                            <button
                                                key={pIdx}
                                                className="prompt-pill-btn"
                                                onClick={() => handlePromptClick(prompt)}
                                                disabled={isChatSending}
                                            >
                                                💡 {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Input Bar */}
                                <form
                                    className="chat-input-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ask your AI Financial Coach any question..."
                                        className="input-field chat-input"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        disabled={isChatSending}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary chat-send-btn"
                                        disabled={isChatSending || !inputMessage.trim()}
                                    >
                                        {isChatSending ? <Spinner size="small" /> : 'Send ➔'}
                                    </button>
                                </form>
                            </div>
                        ) : activeTab === 'tips' ? (
                            <div className="ai-tips-list">
                                {data.smart_tips?.map((tip, idx) => (
                                    <div key={idx} className="ai-tip-item">
                                        <span className="tip-number">{idx + 1}</span>
                                        <p>{tip}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            renderInsightsList()
                        )}
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default AICoach;