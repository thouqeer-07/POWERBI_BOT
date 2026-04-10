import React, { useState, useEffect } from 'react';
import {
    User, Mail, Bell, Shield, UserCircle, Globe,
    Moon, Sun, Monitor, ChevronRight, Info,
    Eye, EyeOff, Save, Trash2, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
const SettingsView = ({ user, onUserUpdate }) => {
    const [notifications, setNotifications] = useState({
        push: true,
        email: false,
        alerts: true,
    });

    const [appearance, setAppearance] = useState('dark');
    const [activeSection, setActiveSection] = useState('profile');

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [userName, setUserName] = useState(user?.username || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    
    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
    useEffect(() => {
        setFullName(user?.full_name || '');
        setUserName(user?.username || '');
        setPhoneNumber(user?.phone_number || '');
    }, [user]);

    const userInitial = fullName.charAt(0).toUpperCase() || 'U';

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('username', userName);
            formData.append('phone_number', phoneNumber);

            const response = await fetch('http://localhost:8001/api/auth/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Update failed');
            }

            const updatedUser = await response.json();
            if (onUserUpdate) onUserUpdate(updatedUser);
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'Profile Settings', icon: UserCircle },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Moon },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'about', label: 'About BI BOT', icon: Info },
    ];

    const SettingToggle = ({ label, description, enabled, onChange }) => (
        <div className="flex items-center justify-between py-4">
            <div>
                <h4 className="text-sm font-semibold text-slate-100">{label}</h4>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-primary-600' : 'bg-slate-700'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-gray">Settings</h1>
                <p className="text-slate-500 mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSection === section.id
                                ? 'bg-white shadow-md text-primary-600 font-bold'
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                }`}
                        >
                            <section.icon size={20} />
                            <span className="text-sm">{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Settings Area */}
                <div className="lg:col-span-9 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        {activeSection === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                        <p className="text-sm text-slate-500">Update your account details and public profile.</p>
                                    </div>
                                    {saveStatus === 'success' && (
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in zoom-in duration-300">
                                            <CheckCircle2 size={16} />
                                            <span className="text-sm font-semibold">Changes saved!</span>
                                        </div>
                                    )}
                                    {saveStatus === 'error' && (
                                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg animate-in fade-in zoom-in duration-300">
                                            <AlertCircle size={16} />
                                            <span className="text-sm font-semibold">Failed to save</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                                    <div className="h-24 w-24 rounded-2xl bg-primary-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-500/20">
                                        {userInitial}
                                    </div>
                                    <div className="space-y-2">
                                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                                            Change Avatar
                                        </button>
                                        <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Username</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                                            <input
                                                type="text"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+91 1234567890"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Language</label>
                                        <input
                                            type="text"
                                            value="English (US)"
                                            disabled
                                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setFullName(user?.full_name || '');
                                            setUserName(user?.username || '');
                                            setPhoneNumber(user?.phone_number || '');
                                        }}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                                    <p className="text-sm text-slate-500">Choose how you want to be notified about updates.</p>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">Push Notifications</h4>
                                            <p className="text-xs text-slate-500">Receive real-time alerts on your device.</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">Email Updates</h4>
                                            <p className="text-xs text-slate-500">Weekly summaries and reports delivered to your inbox.</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-900">Security Alerts</h4>
                                            <p className="text-xs text-slate-500">Get notified about suspicious login attempts.</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(n => ({ ...n, alerts: !n.alerts }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.alerts ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.alerts ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
                                    <p className="text-sm text-slate-500">Customize how BI BOT looks on your screen.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'light', label: 'Light', icon: Sun },
                                        { id: 'dark', label: 'Dark', icon: Moon },
                                        { id: 'system', label: 'System', icon: Monitor },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setAppearance(mode.id)}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${appearance === mode.id
                                                ? 'border-primary-600 bg-primary-50/50 text-primary-600'
                                                : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                                }`}
                                        >
                                            <mode.icon size={32} />
                                            <span className="text-sm font-bold">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex gap-3">
                                        <Info className="text-amber-600 shrink-0" size={18} />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Note</p>
                                            <p className="text-xs text-amber-700">Some components are optimized for Dark Mode. Switching to Light Mode may affect visual clarity of certain charts.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Security</h2>
                                    <p className="text-sm text-slate-500">Keep your account safe and secure.</p>
                                </div>

                                <div className="space-y-4">
                                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Shield size={18} className="text-slate-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-semibold text-slate-900">Change Password</h4>
                                                <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    </button>

                                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Shield size={18} className="text-slate-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-semibold text-slate-900">Two-Factor Authentication</h4>
                                                <p className="text-xs text-rose-500 font-medium">Currently disabled</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                    </button>
                                </div>

                                <div className="pt-8 mt-8 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-rose-600 mb-2">Danger Zone</h4>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors">
                                        <Trash2 size={16} />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'about' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col items-center text-center py-8">
                                    <div className="h-20 w-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary-500/20 mb-6 transform hover:rotate-12 transition-transform duration-500">
                                        <Globe className="text-white" size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">BI BOT</h2>
                                    <p className="text-slate-500">Version 1.0.0</p>

                                    <div className="mt-8 flex gap-4">
                                        <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Terms of Service</a>
                                        <span className="text-slate-300">•</span>
                                        <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Privacy Policy</a>
                                        <span className="text-slate-300">•</span>
                                        <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Documentation</a>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4">What's New</h4>
                                    <ul className="space-y-3">
                                        {[
                                            'Added deep insight generation using GPT-4o',
                                            'Enhanced CSV/Excel parsing engine',
                                            'Real-time dashboard synchronization',
                                            'New interactive settings interface'
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
