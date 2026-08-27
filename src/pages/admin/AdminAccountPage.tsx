import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  UserCheck,
  Lock,
  LogOut,
  Save,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  History,
} from 'lucide-react';
import { db } from '../../services/api';

export const AdminAccountPage: React.FC = () => {
  const { adminAccount, adminChangeUsername, adminChangePassword, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useNavigation();

  // Username form state
  const [username, setUsername] = useState(adminAccount.username);
  const [usernamePasswordConfirm, setUsernamePasswordConfirm] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(adminAccount.is2FAEnabled || false);
  const [twoFAPasswordConfirm, setTwoFAPasswordConfirm] = useState('');
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim().length < 4) {
      showToast('error', 'Validation Error', 'Admin username must be at least 4 characters long.');
      return;
    }
    if (!usernamePasswordConfirm) {
      showToast('error', 'Validation Error', 'Please enter your administrator password to confirm.');
      return;
    }

    setIsUpdatingUsername(true);
    try {
      const isCorrect = await db.verifyAdminPassword(usernamePasswordConfirm);
      if (!isCorrect) {
        showToast('error', 'Password Incorrect', 'Could not verify admin password.');
        return;
      }
      const res = await adminChangeUsername(username);
      if (res.success) {
        setUsernamePasswordConfirm('');
        showToast('success', 'Username Updated', `Admin username successfully changed to ${username}`);
      } else {
        showToast('error', 'Failed', res.error || 'Could not change username.');
      }
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Validation Error', 'Please enter your current password for verification.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Validation Error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Validation Error', 'New password and confirmation password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await adminChangePassword(currentPassword, newPassword);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('success', 'Password Changed', 'Administrator password updated and re-hashed with cryptographic salt.');
      } else {
        showToast('error', 'Password Verification Failed', res.error || 'Current password incorrect.');
      }
    } catch {
      showToast('error', 'Error', 'An unexpected error occurred.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFAPasswordConfirm) {
      showToast('error', 'Validation Error', 'Password confirmation is required to update 2FA configuration.');
      return;
    }

    setIsUpdating2FA(true);
    try {
      const isCorrect = await db.verifyAdminPassword(twoFAPasswordConfirm);
      if (!isCorrect) {
        showToast('error', 'Password Incorrect', 'Could not verify admin password.');
        return;
      }

      const res = db.toggleAdmin2FA(!is2FAEnabled, twoFAPasswordConfirm);
      if (res.success) {
        setIs2FAEnabled(!is2FAEnabled);
        setTwoFAPasswordConfirm('');
        showToast('success', '2FA Settings Saved', `Two-Factor Authentication is now ${!is2FAEnabled ? 'ENABLED' : 'DISABLED'}.`);
      } else {
        showToast('error', 'Error', res.error || 'Failed to update 2FA.');
      }
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 light:text-purple-600 border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Admin Account Credentials & Security
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
            Manage administrator username, SHA-256 salted password hashing, 2FA authentication, and session tokens
          </p>
        </div>

        <button
          id="admin-account-logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 light:text-rose-600 border border-rose-500/30 text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout of Admin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username Card */}
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 light:border-slate-200">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-semibold text-slate-100 light:text-slate-900">
              Change Admin Username
            </h2>
          </div>

          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Current Active Username
              </label>
              <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 text-xs font-mono text-purple-400 light:text-purple-600 font-bold">
                {adminAccount.username}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                New Admin Username
              </label>
              <input
                id="admin-change-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sourovadmin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Confirm with Admin Password
              </label>
              <input
                type="password"
                required
                value={usernamePasswordConfirm}
                onChange={(e) => setUsernamePasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <button
              id="admin-save-username-btn"
              type="submit"
              disabled={isUpdatingUsername || (username === adminAccount.username && !usernamePasswordConfirm)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Update Username</span>
            </button>
          </form>
        </div>

        {/* 2FA Card */}
        <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 light:border-slate-200">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-100 light:text-slate-900">
              Two-Factor Authentication (2FA)
            </h2>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white light:text-slate-900">
                2FA Status: {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
              </p>
              <p className="text-[11px] text-slate-400">
                {is2FAEnabled ? 'Requires 6-digit OTP token on every admin login' : 'Only username & password required'}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
              is2FAEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {is2FAEnabled ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          <form onSubmit={handleToggle2FA} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Admin Password to Confirm Toggle
              </label>
              <input
                type="password"
                required
                value={twoFAPasswordConfirm}
                onChange={(e) => setTwoFAPasswordConfirm(e.target.value)}
                placeholder="Enter password to change 2FA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating2FA || !twoFAPasswordConfirm}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 ${
                is2FAEnabled ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{is2FAEnabled ? 'Disable 2FA Security' : 'Enable 2FA Protection'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 light:border-slate-200">
          <Lock className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-semibold text-slate-100 light:text-slate-900">
            Change Administrator Password
          </h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
              Current Admin Password
            </label>
            <input
              id="admin-change-pass-current"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                New Password
              </label>
              <input
                id="admin-change-pass-new"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="admin-change-pass-confirm"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <button
            id="admin-save-password-btn"
            type="submit"
            disabled={isUpdatingPassword}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isUpdatingPassword ? 'Hashing & Saving...' : 'Save New Encrypted Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
