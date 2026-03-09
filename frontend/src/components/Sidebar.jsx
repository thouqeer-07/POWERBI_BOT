import React from 'react';
import { LayoutDashboard, MessageSquareText, Upload, Settings, BarChart3, Database } from 'lucide-react';

const Sidebar = ({ isOpen, activeTab, onTabChange, onUploadClick, onClose }) => {
    const menuItems = [
        { id: 'chat', label: 'AI Chat', icon: MessageSquareText },
        { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
        { id: 'data', label: 'Datasets', icon: Database },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}


            <aside className={`fixed lg:static inset-y-0 left-0 z-40 ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0 lg:-translate-x-full'} bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden`}>

                <div className="p-6 mb-8 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <LayoutDashboard className="text-white" size={24} />
                        </div>
                        <div className={isOpen ? 'opacity-100 transition-opacity duration-300' : 'opacity-0'}>
                            <h1 className="text-white font-bold text-lg leading-tight">BI BOT</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide">BOT</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap ${activeTab === item.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`} />
                            <span className={`font-medium text-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-2">
                    <button
                        onClick={onUploadClick}
                        className="w-full bg-white text-slate-900 group relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-slate-50 active:scale-95 shadow-sm whitespace-nowrap"
                    >
                        <Upload size={18} className="text-slate-600 group-hover:text-primary-600 transition-colors shrink-0" />
                        <span className={isOpen ? 'opacity-100' : 'opacity-0'}>New Upload</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">
                        <Settings size={20} className="shrink-0" />
                        <span className={`text-sm font-medium transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Settings</span>
                    </button>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-1 whitespace-nowrap">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                            IT
                        </div>
                        <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-sm font-semibold text-white truncate">IT Corporate</p>
                            <p className="text-[10px] text-slate-500 truncate">Premium Plan</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>

    );
};

export default Sidebar;
