import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Phone, Lock, Bell, Shield, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Profile Updated', 'Your contact preferences have been saved.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPassword('');
    setNewPassword('');
    showToast('success', 'Password Changed', 'Your security password has been updated.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900">
          Account Profile & Security
        </h1>
        <p className="text-xs text-slate-400">
          Manage your personal details, security credentials, and notifications.
        </p>
      </div>

      {/* Profile Info Form */}
      <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40"
            />
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">{user?.name}</h3>
              <span className="text-[11px] text-purple-400 font-bold uppercase">{user?.role} Account</span>
            </div>
          </div>
          <Badge variant="purple">Active Verified</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-800 light:border-slate-200">
          <Lock className="w-4 h-4 text-purple-400" />
          Update Security Password
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" variant="outline">
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};
