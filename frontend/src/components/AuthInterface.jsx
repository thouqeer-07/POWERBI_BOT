import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Loader2, Database } from 'lucide-react';

const AuthInterface = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            
            if (!isLogin) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match!");
                }
                formData.append('full_name', fullName);
                formData.append('username', username);
            }

            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await fetch(`http://localhost:8001${endpoint}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Authentication failed');
            }

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect or refresh state (App.jsx will handle this)
            window.location.reload();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-in fade-in duration-700">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in slide-in-from-bottom-8 duration-700 ease-out">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-primary-100 text-primary-600 rounded-2xl mb-4 shadow-sm">
                        <Database size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Intelligence BOT</h1>
                    <p className="text-slate-500 mt-2">
                        {isLogin ? 'Welcome back! Please login to your account' : 'Start your analytics journey with us'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Username</label>
                                <div className="relative">
                                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                        placeholder="johndoe123"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all font-medium ${confirmPassword && password !== confirmPassword
                                        ? 'border-rose-300 focus:ring-rose-500'
                                        : 'border-slate-200 focus:ring-primary-500'
                                        }`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : isLogin ? (
                            <>
                                <LogIn size={20} />
                                Login to Dashboard
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-slate-600 font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="mt-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
                    >
                        {isLogin ? 'Create a new account' : 'Log in to existing account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthInterface;
