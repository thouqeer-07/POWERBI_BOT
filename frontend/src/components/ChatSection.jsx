import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, CheckCircle2, Maximize2, X } from 'lucide-react';
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
    messages,
    setMessages,
    currentPlan,
    setCurrentPlan,
    columns = []
}) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fullScreenIdx, setFullScreenIdx] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleCreateDashboard = async (planToSubmit) => {
        const plan = planToSubmit || currentPlan;
        if (!sessionId || !plan || plan.length === 0) return;

        // Find the index of the plan message to update it in-place
        const planIdx = messages.findIndex(m => m.isPlan);
        if (planIdx !== -1) {
            const newMessages = [...messages];
            newMessages[planIdx] = { ...newMessages[planIdx], isCreating: true };
            setMessages(newMessages);
        }

        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('plan', JSON.stringify(plan));

            const response = await axios.post('http://localhost:8001/create-dashboard', formData);
            const data = response.data;

            if (planIdx !== -1) {
                setMessages(prev => {
                    const next = [...prev];
                    next[planIdx] = {
                        ...next[planIdx],
                        isCreating: false,
                        isDone: true,
                        chart_url: data.dashboard_url,
                        dashboard_id: data.dashboard_id
                    };
                    return next;
                });
            }

            if (data.dashboard_url) {
                setDashboardUrl(data.dashboard_url);
            }
        } catch (error) {
            if (planIdx !== -1) {
                setMessages(prev => {
                    const next = [...prev];
                    next[planIdx] = { ...next[planIdx], isCreating: false, error: true };
                    return next;
                });
            }
        }
    };

    const updatePlanItem = (idx, field, value) => {
        const newPlan = [...currentPlan];
        newPlan[idx] = { ...newPlan[idx], [field]: value };
        setCurrentPlan(newPlan);
    };

    const removePlanItem = (idx) => {
        setCurrentPlan(currentPlan.filter((_, i) => i !== idx));
    };

    const addPlanItem = () => {
        setCurrentPlan([...currentPlan, {
            title: "New Chart",
            viz_type: "dist_bar",
            metric: "count",
            agg_func: "COUNT",
            group_by: null
        }]);
    };

    const handleAcceptDashboard = (msgIdx) => {
        setMessages(prev => {
            const next = [...prev];
            next[msgIdx] = { ...next[msgIdx], isAccepted: true };
            return next;
        });
    };

    const handleRejectDashboard = async (msgIdx, dashboardId) => {
        if (!dashboardId) {
            resetPlanMessage(msgIdx);
            return;
        }

        setMessages(prev => {
            const next = [...prev];
            next[msgIdx] = { ...next[msgIdx], isCreating: true, isDone: false };
            return next;
        });

        try {
            await axios.delete(`http://localhost:8001/delete-dashboard/${dashboardId}`);
            resetPlanMessage(msgIdx);
            setDashboardUrl(null);
        } catch (error) {
            console.error("Failed to delete dashboard:", error);
            setMessages(prev => {
                const next = [...prev];
                next[msgIdx] = { ...next[msgIdx], isCreating: false, isDone: true, error: true };
                return next;
            });
        }
    };

    const resetPlanMessage = (msgIdx) => {
        setMessages(prev => {
            const next = [...prev];
            next[msgIdx] = {
                ...next[msgIdx],
                isCreating: false,
                isDone: false,
                chart_url: null,
                dashboard_id: null,
                isAccepted: false
            };
            return next;
        });
    };



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

            const response = await axios.post('http://localhost:8001/chat', formData);
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
                    content: data.text,
                    chart_url: data.chart_url
                }]);
                // We purposefully DO NOT call setDashboardUrl(data.chart_url) 
                // because we want the main view to remain the full dashboard.
                // Optionally force refresh the main dashboard URL to pick up the new chart
                setDashboardUrl(prev => {
                    if (!prev) return prev;
                    // Remove any existing refresh param to avoid endless appending
                    const cleanUrl = prev.replace(/&refresh=\d+/, '');
                    return `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}refresh=${Date.now()}`;
                });
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.text || 'I have analyzed your data and updated the view accordingly. 📊',
                    chart_url: data.chart_url
                }]);

                // We NO LONGER setDashboardUrl(data.chart_url) here because we want 
                // the main Analytics view to remain the full dashboard. 
                // The user can see the individual chart in the chat bubble.
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
        <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-2 relative w-full">
            {/* Minimal bottom padding (pb-4) to keep content close to input */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pb-4">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user'
                                ? 'bg-primary-600 border-primary-500 text-white'
                                : 'bg-white border-slate-200 text-primary-600'
                                }`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={`max-w-[85%] space-y-1`}>
                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white shadow-primary-500/10'
                                    : 'bg-white border border-slate-100 text-slate-700 w-full overflow-hidden shadow-slate-200/50'
                                    }`}>
                                    {msg.isPlan ? (
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
                                                        Your custom dashboard is now ready. You can interact with it in the <strong>Data Insight Dashboard</strong> tab.
                                                    </p>
                                                    {msg.chart_url && (
                                                        <div className={fullScreenIdx === idx ? "fixed inset-0 z-50 flex flex-col bg-slate-100 p-2 md:p-6" : "rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2 relative group"}>
                                                            {fullScreenIdx === idx ? (
                                                                <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm shrink-0">
                                                                    <h3 className="font-bold text-lg text-slate-800">Full Screen Dashboard</h3>
                                                                    <button
                                                                        onClick={() => setFullScreenIdx(null)}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors"
                                                                    >
                                                                        <X size={18} /> Close
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setFullScreenIdx(idx)}
                                                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 hover:bg-white text-slate-700 transition-all z-10 opacity-0 group-hover:opacity-100"
                                                                    title="Full Screen Dashboard"
                                                                >
                                                                    <Maximize2 size={16} />
                                                                </button>
                                                            )}
                                                            <iframe
                                                                src={`${msg.chart_url}${msg.chart_url.includes('?') ? '&' : '?'}standalone=true&show_filters=0&expand_filters=0`}
                                                                className={fullScreenIdx === idx ? "w-full flex-1 rounded-xl bg-white" : "w-full min-h-[500px] h-[60vh] rounded-xl bg-slate-50"}
                                                                title="Dashboard Preview"
                                                            />
                                                        </div>
                                                    )}

                                                    {!msg.isAccepted ? (
                                                        <div className="flex gap-2 pt-1">
                                                            <button
                                                                onClick={() => handleRejectDashboard(idx, msg.dashboard_id)}
                                                                className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 rounded-xl font-bold transition-all text-xs"
                                                            >
                                                                Reject & Edit Plan
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcceptDashboard(idx)}
                                                                className="flex-1 bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 py-2 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 text-xs"
                                                            >
                                                                Accept Dashboard
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 w-full py-2.5 rounded-xl border border-emerald-100">
                                                            <CheckCircle2 size={16} />
                                                            Dashboard Accepted
                                                        </div>
                                                    )}
                                                </div>
                                            ) : msg.isCreating ? (
                                                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                    <Loader2 className="animate-spin text-primary-600" size={32} />
                                                    <div className="text-center">
                                                        <p className="font-bold text-slate-800 text-sm">Creating Dashboard...</p>
                                                        <p className="text-[10px] text-slate-500">Connecting to Superset</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-primary-600">
                                                            <Bot size={18} />
                                                            <h3 className="font-bold text-base">Dashboard Plan</h3>
                                                        </div>
                                                        <button
                                                            onClick={addPlanItem}
                                                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg font-bold transition-colors"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {currentPlan.map((item, idx) => (
                                                            <div key={idx} className="group relative bg-slate-50 border border-slate-200 p-3 rounded-xl hover:border-primary-200 transition-all shadow-sm">
                                                                <button
                                                                    onClick={() => removePlanItem(idx)}
                                                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-600"
                                                                >
                                                                    <span className="text-base leading-none">&times;</span>
                                                                </button>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                                                    <div className="space-y-0.5">
                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Title</label>
                                                                        <input
                                                                            type="text"
                                                                            value={item.title}
                                                                            onChange={(e) => updatePlanItem(idx, 'title', e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 ring-primary-500/10 focus:border-primary-500"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Viz</label>
                                                                        <select
                                                                            value={item.viz_type}
                                                                            onChange={(e) => updatePlanItem(idx, 'viz_type', e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 ring-primary-500/10 focus:border-primary-500"
                                                                        >
                                                                            <option value="dist_bar">Bar</option>
                                                                            <option value="line">Line</option>
                                                                            <option value="pie">Pie</option>
                                                                            <option value="big_number_total">Number</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                                    <div className="space-y-0.5">
                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Metric</label>
                                                                        <select
                                                                            value={item.metric}
                                                                            onChange={(e) => updatePlanItem(idx, 'metric', e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 ring-primary-500/10 focus:border-primary-500"
                                                                        >
                                                                            <option value="count">Count (*)</option>
                                                                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Agg</label>
                                                                        <select
                                                                            value={item.agg_func}
                                                                            onChange={(e) => updatePlanItem(idx, 'agg_func', e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 ring-primary-500/10 focus:border-primary-500"
                                                                        >
                                                                            <option value="SUM">SUM</option>
                                                                            <option value="AVG">AVG</option>
                                                                            <option value="COUNT">COUNT</option>
                                                                            <option value="MIN">MIN</option>
                                                                            <option value="MAX">MAX</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Group By</label>
                                                                        <select
                                                                            value={item.group_by || ''}
                                                                            onChange={(e) => updatePlanItem(idx, 'group_by', e.target.value || null)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 ring-primary-500/10 focus:border-primary-500 font-medium"
                                                                        >
                                                                            <option value="">None</option>
                                                                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {msg.error && (
                                                        <p className="text-[10px] text-rose-500 font-medium">Error creating dashboard. Try again.</p>
                                                    )}
                                                    <button
                                                        onClick={() => handleCreateDashboard()}
                                                        disabled={currentPlan.length === 0}
                                                        className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none text-sm"
                                                    >
                                                        Create Dashboard
                                                    </button>
                                                 </>
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
                                {msg.chart_url && !msg.isPlan && (
                                    <div className={fullScreenIdx === idx ? "fixed inset-0 z-50 flex flex-col bg-slate-100 p-2 md:p-6" : "rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2 relative group mt-1"}>
                                        {fullScreenIdx === idx ? (
                                            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm shrink-0">
                                                <h3 className="font-bold text-lg text-slate-800">Full Screen Dashboard</h3>
                                                <button
                                                    onClick={() => setFullScreenIdx(null)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors"
                                                >
                                                    <X size={18} /> Close
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setFullScreenIdx(idx)}
                                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-200 hover:bg-white text-slate-700 transition-all z-10 opacity-0 group-hover:opacity-100"
                                                title="Full Screen Dashboard"
                                            >
                                                <Maximize2 size={16} />
                                            </button>
                                        )}
                                        <iframe
                                            src={`${msg.chart_url}${msg.chart_url.includes('?') ? '&' : '?'}standalone=true&show_filters=0&expand_filters=0`}
                                            className={fullScreenIdx === idx ? "w-full flex-1 rounded-xl bg-white" : "w-full min-h-[400px] h-[50vh] rounded-xl bg-slate-50"}
                                            title="Dashboard Preview"
                                        />
                                    </div>
                                )}
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

            <div className="pt-2 mt-auto">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 pl-4 focus-within:ring-2 ring-primary-500/20 ring-offset-0 transition-all"
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
