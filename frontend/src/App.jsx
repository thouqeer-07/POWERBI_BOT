import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatSection from './components/ChatSection';
import DashboardView from './components/DashboardView';
import DatasetsView from './components/DatasetsView';
import UploadModal from './components/UploadModal';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('chat');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [initialPlan, setInitialPlan] = useState(null);
    const [dashboardUrl, setDashboardUrl] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    // Lifted Chat State
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Business Intelligence assistant. Upload a dataset or ask me a question to get started.' }
    ]);
    const [currentPlan, setCurrentPlan] = useState([]);

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


    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'chat': return 'AI Assistant';
            case 'dashboard': return 'Data Insight Dashboard';
            case 'data': return 'Data Inventory';
            default: return 'BI BOT';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden text-sm md:text-base">
            <Sidebar
                isOpen={isSidebarOpen}
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
            />


            <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-0' : ''}`}>

                <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 active:scale-95"
                            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            {getHeaderTitle()}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Online</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    {activeTab === 'chat' && (
                        <ChatSection
                            sessionId={sessionId}
                            initialPlan={initialPlan}
                            setDashboardUrl={setDashboardUrl}
                            messages={messages}
                            setMessages={setMessages}
                            currentPlan={currentPlan}
                            setCurrentPlan={setCurrentPlan}
                        />
                    )}
                    {activeTab === 'dashboard' && <DashboardView url={dashboardUrl} />}
                    {activeTab === 'data' && <DatasetsView />}
                </div>
            </main>

            {isUploadOpen && (
                <UploadModal
                    onClose={() => setIsUploadOpen(false)}
                    onSuccess={(data) => {
                        setSessionId(data.session_id);
                        setMessages(prev => [...prev, { role: 'assistant', content: null, isPlan: true }]);
                        setCurrentPlan(data.plan);
                        setIsUploadOpen(false);
                        setActiveTab('chat');
                    }}
                />
            )}
        </div>
    );
}

export default App;
