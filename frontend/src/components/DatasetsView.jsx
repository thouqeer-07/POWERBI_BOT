import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Database, Search, Calendar, Table as TableIcon, RefreshCw, ExternalLink } from 'lucide-react';

const DatasetsView = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8001/datasets');
            const data = await response.json();
            setDatasets(data);
        } catch (error) {
            console.error('Error fetching datasets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreviewData = async (datasetId) => {
        setPreviewLoading(true);
        try {
            const response = await fetch(`http://localhost:8001/datasets/${datasetId}/data`);
            const data = await response.json();
            setPreviewData(data);
        } catch (error) {
            console.error('Error fetching preview data:', error);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDatasetClick = (ds) => {
        setSelectedDataset(ds);
        fetchPreviewData(ds.id);
    };

    const filteredDatasets = datasets.filter(ds =>
        ds.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.schema?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in relative min-h-full">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Datasets</h1>
                    <p className="text-slate-500 mt-1">Manage and analyze your uploaded data sources</p>
                </div>
                <button
                    onClick={fetchDatasets}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search datasets by table name or schema..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 h-48 animate-pulse shadow-sm" />
                    ))}
                </div>

            ) : filteredDatasets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredDatasets.map((ds) => (
                        <div
                            key={ds.id}
                            onClick={() => handleDatasetClick(ds)}
                            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-300 relative overflow-hidden shadow-sm cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={18} className="text-slate-400 hover:text-primary-600" />
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-primary-50 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <Database size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 truncate pr-6 group-hover:text-primary-700 transition-colors">{ds.table_name || 'Unnamed Dataset'}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ds.schema || 'public'}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="h-5 w-5 rounded-md bg-slate-50 flex items-center justify-center">
                                        <TableIcon size={14} className="text-slate-400" />
                                    </div>
                                    <span className="font-medium text-slate-500">ID: {ds.id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="h-5 w-5 rounded-md bg-slate-50 flex items-center justify-center">
                                        <Calendar size={14} className="text-slate-400" />
                                    </div>
                                    <span className="font-medium text-slate-500">Last Modified: {ds.changed_on ? new Date(ds.changed_on).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <button className="w-full py-2.5 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-200 shadow-sm active:scale-95">
                                    Preview Data
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            ) : (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl shadow-sm">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full text-slate-400 mb-4">
                        <Database size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No datasets found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        {searchTerm ? "We couldn't find any datasets matching your search term." : "You haven't uploaded any datasets yet. Click 'New Upload' to get started."}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-primary-600 font-semibold hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {/* Data Preview Modal */}
            {selectedDataset && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 md:p-8">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedDataset(null)}
                    />
                    <div className="bg-white w-full max-w-6xl max-h-[90vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-slide-up">
                        <header className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedDataset.table_name}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Preview • {previewData?.rows?.length || 0} rows shown</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedDataset(null)}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <RefreshCw className="rotate-45" size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-auto p-2 md:p-6 bg-slate-50/50">
                            {previewLoading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 whitespace-nowrap">
                                    <RefreshCw className="animate-spin text-primary-500 mb-4" size={32} />
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading dataset contents...</p>
                                </div>
                            ) : previewData?.rows?.length > 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-full">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    {previewData.columns.map(col => (
                                                        <th key={col} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center border-r border-slate-200 last:border-0">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {previewData.rows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-primary-50/30 transition-colors">
                                                        {previewData.columns.map(col => (
                                                            <td key={col} className="px-6 py-3.5 text-sm text-slate-600 font-medium whitespace-nowrap border-r border-slate-100 last:border-0">
                                                                {String(row[col])}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <p className="text-slate-500 font-bold uppercase tracking-widest">No data available in this preview</p>
                                </div>
                            )}
                        </div>

                        <footer className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-center sticky bottom-0 z-20">
                            <button
                                onClick={() => setSelectedDataset(null)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                Close Preview
                            </button>
                        </footer>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default DatasetsView;
