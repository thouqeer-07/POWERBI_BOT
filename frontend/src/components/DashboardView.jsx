import React, { useState } from 'react';
import { Maximize2, ExternalLink, BarChart, Info } from 'lucide-react';

const DashboardView = ({ url }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    if (!url) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-6">
                <div className="h-24 w-24 bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200">
                    <BarChart size={40} className="text-slate-300" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-700">No Analytics Loaded</h3>
                    <p className="max-w-md text-sm leading-relaxed">
                        Upload a dataset and use the AI chat to generate visualizations. Once created, they will appear here in high definition.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                        Active Engine
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-600 px-3 py-1 rounded-full border border-primary-100">
                        <Info size={10} />
                        REST Connector
                    </div>
                </div>
            </div>
        );
    }

    // Ensure iframe shows full dashboard in a clean standalone mode
    // We keep standalone=true but ensure filters are available if they exist
    const dashboardUrl = `${url}${url.includes('?') ? '&' : '?'}standalone=true&show_filters=1&expand_filters=1`;

    return (
        <div className="h-full flex flex-col p-6 animate-fade-in translate-y-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                            <BarChart size={18} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Enterprise Dashboard View</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                            <Maximize2 size={18} />
                        </button>
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-100/30">
                    {!isLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-4">
                            <div className="h-10 w-10 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Analytics...</p>
                        </div>
                    )}
                    <iframe
                        src={dashboardUrl}
                        className="w-full h-full border-none"
                        onLoad={() => setIsLoaded(true)}
                        title="Superset Analytics"
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
