import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  ArrowRight,
  KeyRound,
  Sparkles,
  AlertCircle,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const { navigate } = useNavigation();

  const [username, setUsername] = useState('sourovadmin');
  const [password, setPassword] = useState('sourov22');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 2FA state
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [sessionTempToken, setSessionTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (is2FAStep) {
        // Verify 2FA code
        const res = await fetch('/api/admin/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionTempToken, code: otpCode }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('subnova_admin_token', data.token);
          navigate('/admin');
        } else {
          setErrorMsg(data.error || 'Invalid 2FA verification code.');
        }
        return;
      }

      // Step 1: Username & Password Verification
      const res = await adminLogin(username, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.error || 'Invalid administrator credentials.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during admin authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername('sourovadmin');
    setPassword('sourov22');
    setErrorMsg(null);
    setIs2FAStep(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Top Badge & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-xl shadow-purple-500/20 mb-4 ring-1 ring-white/20">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Admin Portal Access
          </h1>
          <p className="mt-2 text-sm text-slate-400 light:text-slate-600">
            Cryptographically secured control room for SubNova marketplace
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 light:bg-white/90 backdrop-blur-xl border border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 light:text-rose-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="mt-0.5 text-xs opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!is2FAStep ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                    Admin Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-login-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="sourovadmin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700">
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-purple-400 hover:text-purple-300 light:text-purple-600 transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-100 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Quick Demo Credentials Assistant */}
                <div className="p-3 rounded-xl bg-purple-950/30 light:bg-purple-50 border border-purple-800/40 light:border-purple-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-300 light:text-purple-700 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Initial Admin Credentials:
                    </span>
                    <button
                      type="button"
                      onClick={fillDefaultCredentials}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 light:text-purple-700 font-semibold transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto Fill
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 light:text-slate-600 font-mono flex items-center justify-between">
                    <span>User: <strong className="text-slate-200 light:text-slate-800">sourovadmin</strong></span>
                    <span>Pass: <strong className="text-slate-200 light:text-slate-800">sourov22</strong></span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-2">
                  <Smartphone className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Two-Factor Authentication Required</h4>
                  <p className="text-xs text-slate-300">
                    Enter the 6-digit verification code from your authenticator app or emergency admin PIN.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-2xl py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{is2FAStep ? 'Verify & Access Console' : 'Sign In to Admin Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 light:border-slate-200 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-slate-300 light:text-slate-600 hover:underline"
            >
              ← Back to Marketplace Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
