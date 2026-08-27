import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  Gift,
  Store,
  Share2,
  Building,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BRANDING } from '../../config/branding';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [regType, setRegType] = useState<'customer' | 'reseller'>('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check URL search params for referral code
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('referral');
      if (ref) {
        setReferralCode(ref.toUpperCase());
        setIsReferralLocked(true);
        showToast('info', 'Referral Code Applied', `Invited with referral code: ${ref.toUpperCase()}`);
      }
    } catch {
      // Ignore in mock environment
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('error', 'Validation Error', 'Password and confirmation password do not match.');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Generate standard email fallback if phone only provided
      const userEmail = email.trim() || `${phone.replace(/\D/g, '')}@subnova.user`;

      const res = await register({
        name,
        email: userEmail,
        phone,
        password,
        referralCode: referralCode.trim() || undefined,
      });

      if (res.success) {
        if (regType === 'reseller') {
          showToast('success', 'Reseller Registered!', 'Your account has been created. Please complete the activation step.');
          navigate('/reseller/apply');
        } else {
          showToast('success', 'Account Created!', 'Welcome to SubNova! $25.00 welcome bonus added.');
          navigate('/dashboard');
        }
      } else {
        showToast('error', 'Registration Error', res.error || 'Could not complete registration.');
      }
    } catch {
      showToast('error', 'Error', 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-600/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
          Create an Account
        </h1>
        <p className="text-xs text-slate-400">
          Join Bangladesh & International premier digital subscription platform
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setRegType('customer')}
          className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
            regType === 'customer'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Customer Account</span>
        </button>

        <button
          type="button"
          onClick={() => setRegType('reseller')}
          className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
            regType === 'reseller'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Reseller Partner</span>
        </button>
      </div>

      {/* Bonus or Benefits Banner */}
      {regType === 'customer' ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/30 flex items-center gap-3 text-xs">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Welcome Offer:</span>
            <p className="text-purple-300">$25.00 Demo Wallet balance credited instantly!</p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-cyan-950/50 border border-indigo-500/30 flex items-center gap-3 text-xs">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Reseller Program:</span>
            <p className="text-indigo-300">Wholesale pricing, 5% referral commissions & client management tools.</p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tanvir Ahmed"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712-345678"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanvir@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {regType === 'reseller' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Business / Agency Name (Optional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Digital Subscriptions BD"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Share2 className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly={isReferralLocked}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. SOUROV_MASTER"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none font-mono ${
                  isReferralLocked
                    ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 font-bold'
                    : 'bg-slate-950/70 light:bg-slate-50 border-slate-800 light:border-slate-300 text-white light:text-slate-900 focus:border-purple-500'
                }`}
              />
            </div>
            {isReferralLocked && (
              <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Referral code automatically attached from invite link
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {regType === 'reseller' ? 'Register & Continue to Reseller Hub' : 'Create Account & Claim $25 Bonus'}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 text-center text-xs space-y-2">
          <p className="text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-purple-400 hover:text-purple-300 hover:underline"
            >
              Sign In
            </button>
          </p>

          <p className="text-[11px] text-slate-500">
            By registering, you agree to SubNova's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
