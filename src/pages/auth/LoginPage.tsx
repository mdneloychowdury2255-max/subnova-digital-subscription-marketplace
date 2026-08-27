import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Store,
  Shield,
  ArrowRight,
  KeyRound,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BRANDING } from '../../config/branding';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'reseller'>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        showToast('success', 'Welcome back!', 'Signed in successfully.');
        if (identifier.includes('admin')) {
          navigate('/admin');
        } else if (activeTab === 'reseller' || identifier.includes('reseller')) {
          navigate('/reseller');
        } else {
          navigate('/dashboard');
        }
      } else {
        showToast('error', 'Login Failed', res.error || 'Please check your credentials or use the Quick Demo shortcuts below.');
      }
    } catch {
      showToast('error', 'Error', 'Failed to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: 'customer' | 'reseller' | 'admin') => {
    switchDemoRole(role);
    showToast('info', 'Demo Mode Active', `Switched to ${role.toUpperCase()} account.`);
    if (role === 'admin') navigate('/admin');
    else if (role === 'reseller') navigate('/reseller');
    else navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-600/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
          Sign In to {BRANDING.name}
        </h1>
        <p className="text-xs text-slate-400">
          Enter your credentials to access your subscriptions & wallet
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'customer'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Customer Login</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reseller')}
          className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reseller'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Reseller Portal</span>
        </button>
      </div>

      {/* Main Login Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 01712345678"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {activeTab === 'reseller' ? 'Sign In to Reseller Hub' : 'Sign In to Account'}
          </Button>
        </form>

        {/* Quick Demo Login Switchers */}
        <div className="pt-4 border-t border-slate-800 light:border-slate-200">
          <p className="text-[11px] font-semibold text-slate-400 light:text-slate-600 mb-2 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-purple-400" />
            Quick Demo Shortcuts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-800 text-[11px] font-semibold border border-slate-700/50 light:border-slate-300 flex items-center justify-center gap-1 transition-colors"
            >
              <UserIcon className="w-3 h-3 text-blue-400" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('reseller')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-800 text-[11px] font-semibold border border-slate-700/50 light:border-slate-300 flex items-center justify-center gap-1 transition-colors"
            >
              <Store className="w-3 h-3 text-purple-400" />
              Reseller
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-800 text-[11px] font-semibold border border-slate-700/50 light:border-slate-300 flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Admin
            </button>
          </div>
        </div>

        {/* Footer Link to Register & Admin */}
        <div className="space-y-3 pt-2 text-center text-xs">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-bold text-purple-400 hover:text-purple-300 hover:underline"
            >
              Register Now
            </button>
          </p>

          <div className="pt-2 border-t border-slate-800/60">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-[11px] text-slate-500 hover:text-purple-400 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
