import React, { useState } from 'react';
import { Maximize2, ExternalLink, BarChart, Info, Plus, Trash2, LayoutList, Rocket, PieChart, LineChart, Hash, ChevronDown, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const DashboardView = ({ 
    url, 
    focusedUrl, 
    isIntegrated = false,
    currentPlan = [],
    addPlanItem,
    removePlanItem,
    updatePlanItem,
    handleCreateDashboard,
    columns = [],
    isCreatingDashboard
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFocusedLoaded, setIsFocusedLoaded] = useState(false);

    if (!url && !focusedUrl && (!currentPlan || currentPlan.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-6 flex-1 bg-slate-50/30">
                <div className="h-28 w-28 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/40 relative">
                    <BarChart size={44} className="text-primary-500 animate-pulse" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-4 border-white animate-bounce" />
                </div>
                <div className="text-center space-y-3 max-w-sm">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Live Analytics View</h3>
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waiting for data upload</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!url && !focusedUrl && currentPlan && currentPlan.length > 0) {
        return (
            <div className="h-full flex flex-col bg-slate-50/50 overflow-hidden">
                <header className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <LayoutList size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Configuration</h2>
                            <p className="text-sm text-slate-500 font-medium">Review and refine your AI-suggested analysis plan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={addPlanItem}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Plus size={18} />
                            Add Chart
                        </button>
                        <button 
                            onClick={() => handleCreateDashboard()}
                            disabled={isCreatingDashboard}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-primary-600 rounded-xl text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-lg overflow-hidden relative ${isCreatingDashboard ? 'opacity-70' : ''}`}
                        >
                            {isCreatingDashboard ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Deploying...</span>
                                </>
                            ) : (
                                <>
                                    <Rocket size={18} />
                                    <span>Create Dashboard</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-primary-600 bg-primary-50 px-4 py-2 rounded-xl border border-primary-100 w-fit">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Suggested Preview</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentPlan.map((item, idx) => (
                                <div key={idx} className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                                    <button
                                        onClick={() => removePlanItem(idx)}
                                        className="absolute top-4 right-4 h-10 w-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500 border border-slate-100"
                                        title="Remove chart"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <div className="flex items-start gap-4 mb-6">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                            item.viz_type === 'dist_bar' ? 'bg-blue-100 text-blue-600' :
                                            item.viz_type === 'line' ? 'bg-emerald-100 text-emerald-600' :
                                            item.viz_type === 'pie' ? 'bg-amber-100 text-amber-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            {item.viz_type === 'dist_bar' ? <BarChart size={24} /> :
                                             item.viz_type === 'line' ? <LineChart size={24} /> :
                                             item.viz_type === 'pie' ? <PieChart size={24} /> :
                                             <Hash size={24} />}
                                        </div>
                                        <div className="flex-1 pr-10">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Chart Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updatePlanItem(idx, 'title', e.target.value)}
                                                className="w-full bg-transparent text-lg font-bold text-slate-800 focus:outline-none border-b border-transparent focus:border-primary-500 pb-1"
                                                placeholder="Enter chart name..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Visualization Type</label>
                                            <div className="relative">
                                                <select
                                                    value={item.viz_type}
                                                    onChange={(e) => updatePlanItem(idx, 'viz_type', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:ring-4 ring-primary-500/5 focus:border-primary-500 transition-all cursor-pointer"
                                                >
                                                    <option value="dist_bar">📊 Bar Chart</option>
                                                    <option value="line">📈 Line Chart</option>
                                                    <option value="pie">🥧 Pie Chart</option>
                                                    <option value="big_number_total">🔢 Big Number</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Aggregation</label>
                                            <div className="relative">
                                                <select
                                                    value={item.agg_func}
                                                    onChange={(e) => updatePlanItem(idx, 'agg_func', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:ring-4 ring-primary-500/5 focus:border-primary-500 transition-all cursor-pointer"
                                                >
                                                    <option value="SUM">Sum (Σ)</option>
                                                    <option value="AVG">Average (x̄)</option>
                                                    <option value="COUNT">Count (n)</option>
                                                    <option value="MIN">Minimum (↓)</option>
                                                    <option value="MAX">Maximum (↑)</option>
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Metric Column</label>
                                            <div className="relative">
                                                <select
                                                    value={item.metric}
                                                    onChange={(e) => updatePlanItem(idx, 'metric', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:ring-4 ring-primary-500/5 focus:border-primary-500 transition-all cursor-pointer"
                                                >
                                                    <option value="count">Count (*)</option>
                                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Group By</label>
                                            <div className="relative">
                                                <select
                                                    value={item.group_by || ''}
                                                    onChange={(e) => updatePlanItem(idx, 'group_by', e.target.value || null)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:ring-4 ring-primary-500/5 focus:border-primary-500 transition-all cursor-pointer"
                                                >
                                                    <option value="">(None)</option>
                                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {isCreatingDashboard && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="relative mb-8">
                            <div className="h-24 w-24 border-8 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Rocket className="text-primary-600 animate-pulse" size={32} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Deploying your Analytics</h3>
                        <p className="text-slate-500 max-w-sm font-medium">We're synchronizing your data with Superset and building your custom dashboard. This usually takes 10-15 seconds.</p>
                        <div className="mt-8 flex gap-2">
                            <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Prepare URLs with standalone mode
    const mainDashboardUrl = url ? `${url}${url.includes('?') ? '&' : '?'}standalone=true&show_filters=1&expand_filters=1` : null;
    const focusedChartUrl = focusedUrl ? `${focusedUrl}${focusedUrl.includes('?') ? '&' : '?'}standalone=true&show_filters=0&expand_filters=0` : null;

    return (
        <div className={`h-full flex flex-col ${isIntegrated ? 'p-0' : 'p-6'} animate-fade-in translate-y-0 w-full bg-slate-50/50`}>
            {/* Main scrollable container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 p-4 md:p-6 pb-20">
                
                {/* 1. FOCUSED CHART SECTION (Only if focusedUrl is provided) */}
                {focusedChartUrl && (
                    <div className="space-y-3 animate-slide-up">
                        <div className="flex items-center gap-2 px-2">
                            <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Recently Created Chart</span>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
                            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={focusedUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 hover:text-primary-600 transition-colors">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                            <div className="min-h-[450px] h-[60vh] relative">
                                {!isFocusedLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-4">
                                        <div className="h-12 w-12 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deploying Chart...</p>
                                    </div>
                                )}
                                <iframe
                                    src={focusedChartUrl}
                                    className="w-full h-full border-none"
                                    onLoad={() => setIsFocusedLoaded(true)}
                                    title="Focused Chart"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. FULL DASHBOARD SECTION */}
                {mainDashboardUrl && (
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <BarChart size={16} className="text-slate-400" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Dashboard Context</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                    Live Refresh Active
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                            {!isLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-4">
                                    <div className="h-10 w-10 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 text-center">Synchronizing Dashboard...</p>
                                </div>
                            )}
                            <div className="min-h-[800px] h-auto lg:h-[120vh]">
                                <iframe
                                    src={mainDashboardUrl}
                                    className="w-full h-full border-none"
                                    onLoad={() => setIsLoaded(true)}
                                    title="Superset Analytics"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom padding for better scroll feel */}
                <div className="h-12" />
            </div>
        </div>
    );
};

export default DashboardView;
