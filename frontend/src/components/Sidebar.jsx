import React, { useState } from 'react';
import { LayoutDashboard, MessageSquareText, Upload, Settings, BarChart3, Database, History, LogOut, User as UserIcon, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, activeTab, onTabChange, onUploadClick, onClose, user, onLogout, history, currentSessionId, onSessionSelect }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);

    const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        try {
            await onLogout();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };
    const menuItems = [
        { id: 'chat', label: 'AI Chat', icon: MessageSquareText },
        { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
        { id: 'data', label: 'Datasets', icon: Database },
    ];

    const displayName = user?.full_name || user?.email?.split('@')[0];
    const userInitial = displayName?.charAt(0).toUpperCase() || 'U';
    const userName = user?.username || user?.email?.split('@')[0];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}


            <aside className={`fixed lg:static inset-y-0 left-0 z-40 ${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out`}>

                <div className={`p-6 mb-8 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} whitespace-nowrap overflow-hidden`}>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => !isOpen && setIsOpen(true)}
                            onMouseEnter={() => setIsLogoHovered(true)}
                            onMouseLeave={() => setIsLogoHovered(false)}
                            className={`h-10 w-10 shrink-0 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 transition-all ${!isOpen ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}`}
                            disabled={isOpen}
                        >
                            {(!isOpen && isLogoHovered) ? (
                                <PanelLeftOpen className="text-white" size={24} />
                            ) : (
                                <LayoutDashboard className="text-white" size={24} />
                            )}
                        </button>
                        {isOpen && (
                            <div className="opacity-100 transition-opacity duration-300">
                                <h1 className="text-white font-bold text-lg leading-tight uppercase tracking-widest">BI BOT</h1>
                                <p className="text-[10px] text-slate-500 font-black tracking-[0.2em]">AI ANALYTICS</p>
                            </div>
                        )}
                    </div>
                    {isOpen && (
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all active:scale-90"
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose size={20} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="mb-4 pt-2">
                        <p className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ${isOpen ? 'px-4' : 'text-center'}`}>
                            {isOpen ? 'Main Menu' : 'MENU'}
                        </p>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={`w-full flex items-center ${isOpen ? 'px-4 justify-start' : 'px-0 justify-center'} py-3.5 rounded-xl transition-all duration-200 group relative mb-2 ${activeTab === item.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                                title={!isOpen ? item.label : ''}
                            >
                                <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} />
                                {isOpen && <span className="font-bold text-sm tracking-tight ml-3">{item.label}</span>}
                                {!isOpen && activeTab === item.id && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {history && history.length > 0 && (
                        <div className="mt-8">
                            <p className={`text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ${isOpen ? 'px-4' : 'text-center'}`}>
                                {isOpen ? 'Recent Analyses' : 'HIST'}
                            </p>
                            <div className="space-y-2">
                                {history.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => onSessionSelect(session)}
                                        className={`w-full flex items-center ${isOpen ? 'px-4 justify-start' : 'px-0 justify-center'} py-3 rounded-xl transition-all duration-200 group relative ${currentSessionId === session.id
                                            ? 'bg-slate-800 text-primary-400 shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                                            }`}
                                        title={!isOpen ? session.table_name : ''}
                                    >
                                        <History size={18} className={`shrink-0 ${currentSessionId === session.id ? 'text-primary-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                        {isOpen && <span className="font-bold text-xs truncate ml-3">{session.table_name}</span>}
                                        {!isOpen && currentSessionId === session.id && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-500 rounded-l-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 mt-auto space-y-3">
                    <button
                        onClick={onUploadClick}
                        className={`w-full bg-white text-slate-900 flex items-center ${isOpen ? 'px-4 justify-start' : 'px-0 justify-center'} py-3.5 rounded-xl font-black text-xs transition-all hover:bg-slate-50 active:scale-95 shadow-sm whitespace-nowrap uppercase tracking-wider`}
                        title={!isOpen ? 'New Upload' : ''}
                    >
                        <Upload size={18} className="text-slate-600 shrink-0" />
                        {isOpen && <span className="ml-3">Upload</span>}
                    </button>

                    <button 
                        onClick={() => onTabChange('settings')}
                        className={`w-full flex items-center ${isOpen ? 'px-4 justify-start' : 'px-0 justify-center'} py-3.5 rounded-xl transition-all duration-200 group relative ${activeTab === 'settings'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                            }`}
                        title={!isOpen ? 'Settings' : ''}
                    >
                        <Settings size={22} className={`shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} />
                        {isOpen && <span className="font-bold text-sm tracking-tight ml-3">Settings</span>}
                    </button>
                </div>

                <div className="p-4 border-t border-slate-800/50">
                    <div className={`group flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-2 py-1 whitespace-nowrap`}>
                        <div className={`h-10 w-10 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-primary-400 shadow-inner ${!isOpen ? 'group-hover:hidden' : ''}`}>
                            {userInitial}
                        </div>
                        
                        {!isOpen && (
                            <button 
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className={`hidden group-hover:flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 transition-all ${isLoggingOut ? 'text-rose-400 opacity-50' : 'text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30'}`}
                                title="Logout"
                            >
                                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} strokeWidth={2.5} />}
                            </button>
                        )}

                        {isOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate uppercase tracking-tighter">{displayName}</p>
                                <p className="text-[10px] text-slate-500 truncate font-medium">PREMIUM ACCOUNT</p>
                            </div>
                        )}
                        {isOpen && (
                            <button 
                                onClick={handleLogoutClick}
                                disabled={isLoggingOut}
                                className={`p-2 hover:bg-slate-800 rounded-lg transition-all ${isLoggingOut ? 'text-rose-400 opacity-50' : 'text-slate-500 hover:text-rose-400'}`}
                                title="Logout"
                            >
                                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
