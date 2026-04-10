import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatSection from './components/ChatSection';
import DashboardView from './components/DashboardView';
import DatasetsView from './components/DatasetsView';
import UploadModal from './components/UploadModal';
import AuthInterface from './components/AuthInterface';
import SettingsView from './components/SettingsView';
import { Menu, PanelLeftClose, PanelLeftOpen, LogOut, User, Loader2, Database, CheckCircle2, WifiOff } from 'lucide-react';
import axios from 'axios';

function App() {
    const [activeTab, setActiveTab] = useState('chat');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [initialPlan, setInitialPlan] = useState(null);
    const [dashboardUrl, setDashboardUrl] = useState(null);
    const [focusedChartUrl, setFocusedChartUrl] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [session, setSession] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const initialLoadRef = useRef(true);

    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Business Intelligence assistant. Upload a dataset or ask me a question to get started.' }
    ]);
    const [currentPlan, setCurrentPlan] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
    const [insights, setInsights] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const checkHealth = async () => {
            // 1. Check basic browser connectivity
            if (!navigator.onLine) {
                setIsOnline(false);
                return;
            }

            try {
                // 2. Parallel check: Backend reachability AND Internet connectivity
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                
                // We attempt to ping the local backend
                const backendPromise = fetch('http://localhost:8001/health', { 
                    signal: controller.signal,
                    cache: 'no-store'
                });

                // We also attempt to ping a reliable public endpoint to verify actual internet
                const internetPromise = fetch('https://8.8.8.8', { 
                    mode: 'no-cors', 
                    signal: controller.signal,
                    cache: 'no-store'
                });

                // Wait for both. If either fails, we consider it a "Network Issue" for the AI app
                const results = await Promise.allSettled([backendPromise, internetPromise]);
                
                clearTimeout(timeoutId);
                
                const bothSuccessful = results.every(res => res.status === 'fulfilled');
                setIsOnline(bothSuccessful);
            } catch (err) {
                setIsOnline(false);
            }
        };

        const handleOnline = () => {
            setIsOnline(true);
            checkHealth();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkHealth();

        // Poll every 5 seconds
        const interval = setInterval(checkHealth, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleCreateDashboard = async (planToSubmit) => {
        const plan = planToSubmit || currentPlan;
        if (!sessionId || !plan || plan.length === 0) return;

        setIsCreatingDashboard(true);
        // Find the index of the plan message to update it in-place
        const planIdx = messages.findIndex(m => m.isPlan);
        if (planIdx !== -1) {
            const newMessages = [...messages];
            newMessages[planIdx] = { ...newMessages[planIdx], isCreating: true };
            setMessages(newMessages);
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('plan', JSON.stringify(plan));
            
            const response = await axios.post('http://localhost:8001/create-dashboard', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
                // Also focus the latest one for the view panel
                if (data.chart_url) {
                    setFocusedChartUrl(data.chart_url);
                }
            }
        } catch (error) {
            if (planIdx !== -1) {
                setMessages(prev => {
                    const next = [...prev];
                    next[planIdx] = { ...next[planIdx], isCreating: false, error: true };
                    return next;
                });
            }
        } finally {
            setIsCreatingDashboard(false);
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
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8001/delete-dashboard/${dashboardId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && isSidebarOpen) {
                setIsSidebarOpen(false);
            } else if (window.innerWidth >= 1024 && !isSidebarOpen) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (!token) {
                setSession(null);
                setIsInitialLoading(false);
                return;
            }

            try {
                // Verify token with backend
                const response = await fetch('http://localhost:8001/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setSession({ user: userData });
                } else {
                    // Token invalid or expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setSession(null);
                }
            } catch (err) {
                console.error('Session check failed:', err);
                // Fallback to local storage if offline or server down, for better UX
                if (savedUser) {
                    setSession({ user: JSON.parse(savedUser) });
                }
            } finally {
                setIsInitialLoading(false);
                initialLoadRef.current = false;
                if (token) fetchRecentSessions();
            }
        };

        checkSession();
    }, []);

    const fetchRecentSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRecentSessions(data);
            }
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        }
    };

    const handleSessionSelect = async (session) => {
        setSessionId(session.id);
        setDashboardUrl(session.dashboard_url);
        setCurrentPlan(session.plan || []);
        setInsights(session.insights); // RESTORE INSIGHTS
        setActiveTab('chat');
        setIsChatVisible(true);
        
        // CLEAR PREVIOUS MESSAGES IMMEDIATELY to prevent "collapsed" or bleeding history
        setMessages([
            { role: 'assistant', content: `🔄 Loading history for **${session.table_name}**...` }
        ]);
        
        // Clear focused chart when switching sessions
        setFocusedChartUrl(null);
        
        // Load history from DB - Pass specific session data to ensure immediate injection
        await fetchSessionHistory(session.id, session.insights, session.plan, session.dashboard_id);
    };

    const [chatWidth, setChatWidth] = useState(400);
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (e) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 300 && newWidth < 800) {
                setChatWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);
    
    // NEW: Handle dataset deletion cleanup
    const handleDatasetDeleted = (datasetId) => {
        // Clear active session and dashboard to prevent "Not Found" errors
        setDashboardUrl(null);
        setSessionId(null);
        setInitialPlan(null);
        setCurrentPlan([]);
        setColumns([]);
        setMessages([
            { role: 'assistant', content: 'Dataset deleted successfully. You can upload a new dataset or select another one from your inventory.' }
        ]);
        fetchRecentSessions(); // Update history list
    };

    const handleLogout = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // RESET ALL SESSION STATE
            setSession(null);
            setSessionId(null);
            setMessages([
                { role: 'assistant', content: 'Hello! I am your AI Business Intelligence assistant. Upload a dataset or ask me a question to get started.' }
            ]);
            setCurrentPlan([]);
            setColumns([]);
            setDashboardUrl(null);
            setFocusedChartUrl(null); // Clear on logout
            setInitialPlan(null);
            setActiveTab('chat');
            
            setIsTransitioning(false);
        }, 600);
    };

    const [isResumed, setIsResumed] = useState(false);

    const fetchSessionHistory = async (id, sessionInsights = null, sessionPlan = null, dashboardId = null) => {
        console.log("Fetching history for session:", id, "With insights?", !!sessionInsights);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8001/sessions/${id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data && response.data.length > 0) {
                // Check if we need to re-inject insights/plan markers if they are missing from retrieved history
                let fullHistory = [...response.data];
                const hasInsights = fullHistory.some(m => m.isInsights);
                const hasPlan = fullHistory.some(m => m.isPlan);

                // Inject insights and plan at the ABSOLUTE TOP of history
                // We add them in reverse order of how we want them to appear at the top (Plan first, then Insights above it)
                
                // 1. Prepare Plan message
                const planToUse = sessionPlan || currentPlan;
                if (!hasPlan && planToUse && planToUse.length > 0) {
                    const planMsg = { 
                        role: 'assistant', 
                        content: null, 
                        isPlan: true,
                        isDone: !!dashboardId, 
                        isAccepted: !!dashboardId, 
                        dashboard_id: dashboardId
                    };
                    fullHistory.unshift(planMsg);
                }

                // 2. Prepare Insights message
                if (!hasInsights && (sessionInsights || insights)) {
                    const insightsMsg = { role: 'assistant', content: null, isInsights: true };
                    fullHistory.unshift(insightsMsg);
                }

                setMessages(fullHistory);
                setIsResumed(true);
                setTimeout(() => setIsResumed(false), 5000); // Hide toast after 5s
            } else {
                // If history is empty, show insights + plan + greeting at the top
                const initialMsgs = [];
                
                if (sessionInsights || insights) {
                    initialMsgs.push({ role: 'assistant', content: null, isInsights: true });
                }
                if (sessionPlan && sessionPlan.length > 0) {
                    initialMsgs.push({ 
                        role: 'assistant', 
                        content: null, 
                        isPlan: true,
                        isDone: !!dashboardId,
                        isAccepted: !!dashboardId,
                        dashboard_id: dashboardId
                    });
                }
                
                initialMsgs.push({ role: 'assistant', content: `Session resumed. How can I help you analyze **${sessionInsights ? 'your dataset' : 'the data'}** today?` });
                
                setMessages(initialMsgs);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
            setMessages([{ role: 'assistant', content: "Error loading history. You can still start a new conversation." }]);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
                <div className="h-16 w-16 bg-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/20 animate-bounce">
                    <Database size={32} className="text-white" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight">BI BOT</h2>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm font-medium">Initializing secure connection...</span>
                    </div>
                </div>
            </div>
        );
    }


    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'chat': return 'AI Assistant';
            case 'dashboard': return 'Data Insight Dashboard';
            case 'data': return 'Data Inventory';
            case 'settings': return 'Account Settings';
            default: return 'BI BOT';
        }
    };

    const isIntegrated = (activeTab === 'chat' || activeTab === 'dashboard') && sessionId;

    return (
        <div className={`overflow-hidden ${isTransitioning ? 'transition-all duration-700 ease-in-out opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {isResumed && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400">
                        <CheckCircle2 size={20} />
                        <span className="font-bold whitespace-nowrap">Previous Session Resumed!</span>
                    </div>
                </div>
            )}
            {!session ? (
                <AuthInterface />
            ) : (
                <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden text-sm md:text-base selection:bg-primary-100 selection:text-primary-900" onMouseMove={resize} onMouseUp={stopResizing}>
                    <Sidebar
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        onUploadClick={() => {
                            setIsUploadOpen(true);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        onClose={() => setIsSidebarOpen(false)}
                        user={session.user}
                        onLogout={handleLogout}
                        history={recentSessions}
                        currentSessionId={sessionId}
                        onSessionSelect={handleSessionSelect}
                    />


                    <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out`}>

                        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-30 shrink-0 shadow-sm backdrop-blur-md bg-white/80">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    <span className="hidden md:inline text-primary-600">
                                        <Database size={24} />
                                    </span>
                                    {getHeaderTitle()}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4">
                                {isIntegrated && activeTab === 'chat' && (
                                    <button
                                        onClick={() => setIsChatVisible(!isChatVisible)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                            isChatVisible 
                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20'
                                        }`}
                                    >
                                        <Loader2 className={isLoading ? "animate-spin" : "hidden"} size={14} />
                                        {isChatVisible ? 'Close Assistant' : 'Open AI Assistant'}
                                    </button>
                                )}
                                {isOnline ? (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100 animate-pulse">
                                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                        <div className="flex items-center gap-1.5">
                                            <WifiOff size={10} className="text-rose-600" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Network Issue</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </header>

                                <div className="flex-1 overflow-hidden bg-slate-50/50 flex">
                            {isIntegrated ? (
                                <>
                                    <div className={`flex-1 transition-all duration-500 ease-in-out relative ${activeTab === 'chat' && !sessionId ? 'w-0 opacity-0 pointer-events-none' : 'w-full opacity-100 border-r border-slate-100'}`}>
                                        <DashboardView 
                                            url={dashboardUrl} 
                                            focusedUrl={activeTab === 'chat' ? focusedChartUrl : null}
                                            isIntegrated={true} 
                                            currentPlan={currentPlan}
                                            addPlanItem={addPlanItem}
                                            removePlanItem={removePlanItem}
                                            updatePlanItem={updatePlanItem}
                                            handleCreateDashboard={handleCreateDashboard}
                                            columns={columns}
                                            isCreatingDashboard={isCreatingDashboard}
                                        />
                                        {/* Overlay to prevent iframe from capturing mouse move during resize */}
                                        {isResizing && <div className="absolute inset-0 z-50 cursor-col-resize pointer-events-auto" />}
                                    </div>

                                    {(isChatVisible && activeTab === 'chat') && (
                                        <>
                                            {/* Resize Handle with Visual Indicator */}
                                            <div 
                                                onMouseDown={startResizing}
                                                className={`w-1.5 hover:w-2 cursor-col-resize bg-slate-200 hover:bg-primary-400 transition-all z-30 relative flex items-center justify-center ${isResizing ? 'bg-primary-500 w-2' : ''}`}
                                                title="Drag to resize panel"
                                            >
                                                <div className={`w-[2px] h-8 rounded-full bg-slate-400/50 ${isResizing ? 'bg-white' : ''}`} />
                                            </div>
                                            
                                            <div 
                                                style={{ width: chatWidth }}
                                                className={`border-l bg-white overflow-hidden flex flex-col shadow-2xl z-20 ${!isResizing ? 'transition-[width] duration-300 ease-in-out' : ''}`}
                                            >
                                                <ChatSection
                                                    sessionId={sessionId}
                                                    initialPlan={initialPlan}
                                                    setDashboardUrl={setDashboardUrl}
                                                    setFocusedChartUrl={setFocusedChartUrl} // Share setter
                                                    messages={messages}
                                                    setMessages={setMessages}
                                                    currentPlan={currentPlan}
                                                    setCurrentPlan={setCurrentPlan}
                                                    columns={columns}
                                                    isIntegrated={true}
                                                    isLoading={isLoading}
                                                    setIsLoading={setIsLoading}
                                                    insights={insights}
                                                    handleCreateDashboard={handleCreateDashboard}
                                                    handleAcceptDashboard={handleAcceptDashboard}
                                                    handleRejectDashboard={handleRejectDashboard}
                                                    isCreatingDashboard={isCreatingDashboard}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    {activeTab === 'chat' && (
                                        <ChatSection
                                            sessionId={sessionId}
                                            initialPlan={initialPlan}
                                            setDashboardUrl={setDashboardUrl}
                                            messages={messages}
                                            setMessages={setMessages}
                                            currentPlan={currentPlan}
                                            setCurrentPlan={setCurrentPlan}
                                            columns={columns}
                                            isLoading={isLoading}
                                            setIsLoading={setIsLoading}
                                            insights={insights}
                                        />
                                    )}
                                    {activeTab === 'dashboard' && <DashboardView url={dashboardUrl} />}
                                    {activeTab === 'data' && (
                                        <DatasetsView 
                                            userId={session.user.id} 
                                            onDatasetDeleted={handleDatasetDeleted}
                                        />
                                    )}
                                    {activeTab === 'settings' && (
                                        <SettingsView 
                                            user={session.user} 
                                            onUserUpdate={(updatedUser) => {
                                                setSession({ ...session, user: updatedUser });
                                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </main>

                    {isUploadOpen && (
                        <UploadModal
                            userId={session.user.id}
                            onClose={() => setIsUploadOpen(false)}
                            onSuccess={(data) => {
                                setSessionId(data.session_id);
                                setDashboardUrl(data.dashboard_url);
                                setColumns(data.columns || []);
                                
                                if (data.resumed) {
                                    // Fetch and set history
                                    setInsights(data.insights); // RESTORE INSIGHTS ON RESUME
                                    setCurrentPlan(data.plan || []); // RESTORE PLAN ON RESUME
                                    fetchSessionHistory(data.session_id, data.insights, data.plan, data.dashboard_id);
                                    setActiveTab('chat');
                                    setIsChatVisible(true);
                                } else {
                                    setCurrentPlan(data.plan || []);
                                    setInsights(data.insights);
                                    setActiveTab('chat');
                                    setIsChatVisible(true);
                                    setMessages([
                                        { role: 'assistant', content: `👋 Analysis ready! I've loaded **${data.table_name || 'your dataset'}**. I've also generated some **Quick Insights** for you below.` },
                                        { role: 'assistant', content: null, isInsights: true },
                                        { role: 'assistant', content: "Would you like to see the suggested analysis plan or start with a specific question?", isPlan: true }
                                    ]);
                                }
                                setIsUploadOpen(false);
                                fetchRecentSessions(); // Refresh history
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
