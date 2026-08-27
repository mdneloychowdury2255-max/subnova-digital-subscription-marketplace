import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('success', 'Reset Link Sent', 'If an account exists, instructions have been emailed.');
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-8">
      <button
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sign In
      </button>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
          Reset Password
        </h1>
        <p className="text-xs text-slate-400">
          Enter your registered email and we will send you a recovery link
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-5">
        {sent ? (
          <div className="text-center space-y-4 py-4">
            <p className="text-sm font-semibold text-emerald-400">
              ✓ Password reset email sent!
            </p>
            <p className="text-xs text-slate-400">
              Please check your inbox at <span className="font-mono text-purple-400">{email}</span> and follow the instructions to set a new password.
            </p>
            <Button size="sm" onClick={() => navigate('/login')} className="w-full">
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold py-3" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Send Recovery Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
