import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UploadModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [tableName, setTableName] = useState('');
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [error, setError] = useState('');

    const handleUpload = async () => {
        if (!file || !tableName) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', tableName);

        try {
            const response = await axios.post('http://localhost:8001/upload', formData);
            setStatus('success');
            setTimeout(() => {
                onSuccess(response.data);
            }, 1500);
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.detail || 'Upload failed');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">New Import</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${file ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {file ? <FileText size={32} /> : <Upload size={32} />}
                        </div>

                        <p className="text-sm font-semibold text-slate-700">
                            {file ? file.name : 'Tap to select file'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Excel (XLSX) or CSV (Max 50MB)</p>

                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const f = e.target.files[0];
                                if (f) {
                                    setFile(f);
                                    setTableName(f.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'));
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage ID</label>
                        <input
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 ring-primary-500/10 text-slate-700 font-medium"
                            placeholder="e.g. sales_data_2024"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || !tableName || status === 'uploading'}
                        className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:bg-slate-800 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-95 translate-y-0"
                    >
                        {status === 'uploading' ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Processing Engine...</span>
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle2 size={20} className="text-emerald-400" />
                                <span>Imported Successfully</span>
                            </>
                        ) : (
                            <span>Start Analysis</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
