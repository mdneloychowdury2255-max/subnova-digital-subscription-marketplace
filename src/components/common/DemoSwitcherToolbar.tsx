import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  User as UserIcon,
  Store,
  Shield,
  Sun,
  Moon,
  RotateCcw,
  Wallet,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const DemoSwitcherToolbar: React.FC = () => {
  const { user, role, switchDemoRole } = useAuth();
  const { navigate } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all demo orders, wallet deposits, and products to initial state?')) {
      db.resetToFactoryDefaults();
      showToast('info', 'Database Reset', 'Demo database restored to default factory state.');
      setTimeout(() => window.location.reload(), 300);
    }
  };

  return (
    <div className="bg-slate-950/95 border-b border-purple-500/20 text-xs py-1.5 px-4 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Role Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold text-purple-400 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Live Demo Roles:
          </span>

          {/* Customer Button */}
          <button
            onClick={() => {
              switchDemoRole('customer');
              navigate('/dashboard');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Switch to Customer view (Alex Rivera)"
          >
            <UserIcon className="w-3 h-3 text-blue-400" />
            <span>Customer</span>
          </button>

          {/* Reseller Button */}
          <button
            onClick={() => {
              switchDemoRole('reseller');
              navigate('/reseller/dashboard');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              role === 'reseller'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Switch to Reseller view (Apex Digital Hub)"
          >
            <Store className="w-3 h-3 text-purple-400" />
            <span>Reseller</span>
          </button>

          {/* Admin Button */}
          <button
            onClick={() => {
              switchDemoRole('admin');
              navigate('/admin');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Switch to Admin Management Panel (Elena Vance)"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Right: Wallet Balance & Tools */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Wallet:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                ${user.walletBalance.toFixed(2)}
              </span>
            </div>
          )}

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Reset demo database to defaults"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
