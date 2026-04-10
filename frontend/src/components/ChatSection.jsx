import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, CheckCircle2, Maximize2, X, TrendingUp, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Typewriter = ({ text, speed = 2, onUpdate, onComplete }) => {
    const [displayedText, setDisplayedText] = React.useState('');
    const [index, setIndex] = React.useState(0);

    React.useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                const step = 10; // Reveal 10 characters at a time for "flash" speed
                const nextIndex = Math.min(index + step, text.length);
                setDisplayedText(text.substring(0, nextIndex));
                setIndex(nextIndex);
                if (onUpdate) onUpdate();
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, speed, onUpdate, onComplete]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-xs sm:prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-td:border prose-th:border prose-strong:text-slate-900 prose-strong:font-bold prose-headings:text-primary-800 prose-headings:font-black prose-li:my-1"
        >
            {displayedText}
        </ReactMarkdown>
    );
};

const ChatSection = ({
    sessionId,
    setDashboardUrl,
    setFocusedChartUrl, // New prop
    messages,
    setMessages,
    currentPlan,
    setCurrentPlan,
    columns = [],
    isIntegrated = false,
    isLoading,
    setIsLoading,
    insights,
    handleCreateDashboard,
    handleAcceptDashboard,
    handleRejectDashboard,
    isCreatingDashboard
}) => {
    const [input, setInput] = useState('');
    const [fullScreenIdx, setFullScreenIdx] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            // Use longer timeout for chart iframe loading
            setTimeout(() => {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }
    }, [messages]);





    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        // Find the most recent dashboard ID
        const latestDashboardMessage = [...messages].reverse().find(m => m.dashboard_id);
        const currentDashboardId = latestDashboardMessage ? latestDashboardMessage.dashboard_id : null;

        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('prompt', userMsg);
            if (currentDashboardId) {
                formData.append('dashboard_id', currentDashboardId);
            }

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8001/chat', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = response.data;

            if (data.action === 'create_chart') {
                const newChartPlan = {
                    title: data.title || 'New Chart',
                    viz_type: data.viz_type || 'dist_bar',
                    metric: data.metric || 'count',
                    agg_func: data.agg_func || 'COUNT',
                    group_by: data.group_by || null
                };

                // Setup the editable plan UI for this chart
                setCurrentPlan([newChartPlan]);

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: null,
                    isPlan: true
                }]);
            } else if (data.action === 'chart_added_to_dashboard') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.text
                    // chart_url: data.chart_url // REMOVED: Don't show in chat
                }]);

                if (data.chart_url) {
                    setFocusedChartUrl(data.chart_url);
                }
                
                // FORCE REFRESH the main dashboard view to show the new chart
                if (data.dashboard_url || data.chart_url) {
                    const targetUrl = data.dashboard_url || data.chart_url;
                    setDashboardUrl(prev => {
                        const cleanUrl = targetUrl.replace(/&refresh=\d+/, '');
                        return `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}refresh=${Date.now()}`;
                    });
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.text || 'I have analyzed your data and updated the view accordingly. 📊'
                }]);

                if (data.chart_url) {
                    setFocusedChartUrl(data.chart_url);
                }
                
                // Only update dashboard URL if it's actually returned, but DON'T force a refresh timestamp
                // This prevents the iframe from reloading when just asking general questions.
                if (data.dashboard_url) {
                    setDashboardUrl(data.dashboard_url);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!sessionId && messages.length <= 1) {
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="h-20 w-20 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary-50">
                        <Bot size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                        Welcome to BI BOT
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Hello! I am your AI Business Intelligence assistant.<br />
                        Upload a dataset or ask me a question to get started.
                    </p>
                </motion.div>

                <div className="w-full">
                    <form
                        onSubmit={handleSend}
                        className="relative flex items-center bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 pl-6 focus-within:ring-4 ring-primary-500/10 ring-offset-0 transition-all"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Upload a dataset to begin..."
                            disabled={!sessionId || isLoading}
                            className="flex-1 bg-transparent py-4 focus:outline-none text-slate-700 text-lg disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!sessionId || isLoading || !input.trim()}
                            className="bg-primary-600 text-white h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 hover:bg-primary-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-slate-400">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Secure Processing
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                            AI Powered Insights
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Real-time Analytics
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${isIntegrated ? 'w-full' : 'max-w-4xl mx-auto px-4 py-2'} relative w-full`}>
            {isIntegrated && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0 h-16">
                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                        <Bot size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">AI Data Assistant</span>
                </div>
            )}
            {/* Minimal bottom padding (pb-4) to keep content close to input */}
            <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-4 scrollbar-hide pb-4 ${isIntegrated ? 'px-4 pt-4' : ''}`}>
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user'
                                ? 'bg-primary-600 border-primary-500 text-white'
                                : 'bg-white border-slate-200 text-primary-600'
                                }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`${isIntegrated ? 'max-w-[90%]' : 'max-w-[85%]'} space-y-1`}>
                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white shadow-primary-500/10'
                                    : 'bg-white border border-slate-100 text-slate-700 w-full overflow-hidden shadow-slate-200/50'
                                    }`}>
                                    {msg.isInsights ? (
                                        <div className="space-y-4 py-1">
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <Lightbulb size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base text-slate-900">Quick Insights 🚀</h3>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Generated by AI Assistant</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-[14px]">
                                                        <TrendingUp size={16} />
                                                        Top 3 Trends
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {(insights?.trends || []).map((t, i) => (
                                                            <li key={i} className="flex gap-2 text-[12.5px] text-slate-700 leading-snug">
                                                                <span className="text-emerald-500 mt-1">•</span>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-xs">
                                                                    {t}
                                                                </ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-rose-700 font-bold text-[14px]">
                                                        <AlertTriangle size={16} />
                                                        Key Anomalies
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {(insights?.anomalies || []).map((a, i) => (
                                                            <li key={i} className="flex gap-2 text-[12.5px] text-slate-700 leading-snug">
                                                                <span className="text-rose-500 mt-1">•</span>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-xs">
                                                                    {a}
                                                                </ReactMarkdown>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : msg.isPlan ? (
                                        <div className="space-y-3 w-full">
                                            {msg.isDone ? (
                                                <div className="space-y-3 py-1">
                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                        <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <Bot size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-base">Dashboard Created!</h3>
                                                            <p className="text-[10px] text-emerald-600/70 font-medium uppercase tracking-wider">Successfully deployed</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        Your custom dashboard is now ready. I have loaded it into the **main panel** on the left for you to view in full detail.
                                                    </p>

                                                    {!msg.isAccepted ? (
                                                        <div className="flex gap-2 pt-1">
                                                            <button
                                                                onClick={() => handleRejectDashboard(idx, msg.dashboard_id)}
                                                                className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 rounded-xl font-bold transition-all text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcceptDashboard(idx)}
                                                                className="flex-1 bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 py-2 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 text-xs"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 w-full py-2.5 rounded-xl border border-emerald-100">
                                                            <CheckCircle2 size={16} />
                                                            Dashboard Accepted
                                                        </div>
                                                    )}
                                                </div>
                                            ) : msg.isCreating || isCreatingDashboard ? (
                                                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                                    <Loader2 className="animate-spin text-primary-600" size={24} />
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 text-[12px]">Creating Dashboard...</p>
                                                        <p className="text-[10px] text-slate-500">Checking results on the left</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-1">
                                                    <div className="flex items-center gap-2 text-primary-600 mb-2">
                                                        <CheckCircle2 size={18} />
                                                        <h3 className="font-bold text-[14px]">Analysis Plan Ready</h3>
                                                    </div>
                                                    <p className="text-[12px] text-slate-600 mb-3">
                                                        I've generated a suggested visualization plan. You can now **review and edit** it in the panel on your left.
                                                    </p>
                                                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary-600">
                                                            <Sparkles size={16} />
                                                        </div>
                                                        <p className="text-[11px] font-medium text-slate-500 italic">
                                                            "Check the left panel to refine your charts before we build them!"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        msg.role === 'user' ? (
                                            msg.content
                                        ) : (
                                            msg.content && (idx === messages.length - 1 && msg.role === 'assistant' && !msg.isPlan && !msg.isTyped) ? (
                                                <Typewriter
                                                    text={msg.content}
                                                    onUpdate={() => {
                                                        if (scrollRef.current) {
                                                            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                                                        }
                                                    }}
                                                    onComplete={() => {
                                                        const newMessages = [...messages];
                                                        newMessages[idx].isTyped = true;
                                                        setMessages(newMessages);
                                                    }}
                                                />
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    className="prose prose-xs sm:prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-td:border prose-th:border prose-p:my-1 prose-headings:my-2 prose-headings:text-primary-800 prose-headings:font-black prose-strong:text-slate-900 prose-strong:font-bold prose-ul:my-2 prose-li:my-1"
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )
                                        )
                                    )}
                                </div>
                                {/* Visuals removed from chat as per user request. Show only in left panel. */}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-primary-600 flex items-center justify-center shadow-sm">
                            <Loader2 className="animate-spin" size={18} />
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
                            <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`pt-2 mt-auto ${isIntegrated ? 'px-6 pb-6' : ''}`}>
                <form
                    onSubmit={handleSend}
                    className={`relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 ${isIntegrated ? 'pl-3' : 'pl-4'} focus-within:ring-2 ring-primary-500/20 ring-offset-0 transition-all`}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={sessionId ? "Ask about your data..." : "Upload a dataset to begin..."}
                        disabled={!sessionId || isLoading}
                        className="flex-1 bg-transparent py-2.5 focus:outline-none text-slate-700 disabled:opacity-50 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!sessionId || isLoading || !input.trim()}
                        className="bg-primary-600 text-white h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 hover:bg-primary-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-center mt-2 text-slate-400 font-medium">
                    Powered by Enterprise AI • Secure Data Processing
                </p>
            </div>
        </div>
    );
};


export default ChatSection;
