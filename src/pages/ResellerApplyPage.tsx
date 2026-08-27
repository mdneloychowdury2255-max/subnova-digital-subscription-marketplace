import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PaymentMethodType } from '../types';
import {
  Store,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Globe,
  Wallet,
  CreditCard,
  QrCode,
  Copy,
  AlertCircle,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ResellerApplyPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const settings = db.getSettings();
  const activationFeeBDT = settings.resellerActivationFeeBDT || 300;
  const exchangeRate = settings.usdExchangeRate || 120;
  const feeUSD = Number((activationFeeBDT / exchangeRate).toFixed(2));

  const [businessName, setBusinessName] = useState('');
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState('Bangladesh');
  const [monthlyVolume, setMonthlyVolume] = useState('৳10,000 - ৳50,000');
  const [website, setWebsite] = useState('');
  const [reason, setReason] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    (user?.walletBalance || 0) >= feeUSD ? 'wallet' : 'bkash'
  );
  const [senderInfo, setSenderInfo] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{ isApproved: boolean; app: any } | null>(null);

  // Profit Simulator
  const [simRetail, setSimRetail] = useState(2500);
  const [simTier, setSimTier] = useState(0.25); // 25% discount

  const wholesaleCost = simRetail * (1 - simTier);
  const simulatedProfit = simRetail - wholesaleCost;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', 'Copied!', `${label} copied to clipboard.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('error', 'Login Required', 'Please login or create an account to activate Reseller features.');
      navigate('/login');
      return;
    }

    if (paymentMethod !== 'wallet' && !transactionRef) {
      showToast('error', 'Transaction ID Required', 'Please enter your Transaction ID (TrxID) or payment reference.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = db.submitResellerApplication({
        userId: user.id,
        businessName: businessName || `${applicantName} Agency`,
        name: applicantName,
        email: applicantEmail,
        phone,
        country,
        expectedVolume: monthlyVolume,
        website: website || undefined,
        reason: reason || `Reseller activation application fee payment: ৳${activationFeeBDT}`,
        paymentMethod,
        transactionRef: paymentMethod === 'wallet' ? `WALLET-ACT-${Date.now()}` : transactionRef,
        screenshotUrl,
        senderInfo,
      });

      if (result.autoApproved) {
        refreshUser();
        setSubmittedApp({ isApproved: true, app: result.application });
        showToast('success', 'Reseller Account Activated!', '৳300 deducted from wallet. Wholesale dashboard unlocked!');
      } else {
        refreshUser();
        setSubmittedApp({ isApproved: false, app: result.application });
        showToast('success', 'Activation Submitted!', 'Payment submitted for admin verification.');
      }
    } catch (err: any) {
      showToast('error', 'Application Error', err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === 'reseller' && user.resellerStatus === 'active') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <Badge variant="emerald">Active Reseller Partner</Badge>
        <h2 className="text-3xl font-black text-white light:text-slate-900">
          Your Reseller Account is Active!
        </h2>
        <p className="text-sm text-slate-300 light:text-slate-600 leading-relaxed">
          You have full access to wholesale price discounts, instant automated license fulfillment, client management, and referral commission tracking.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button onClick={() => navigate('/reseller')}>Go to Reseller Dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/reseller/orders')}>View Reseller Orders</Button>
        </div>
      </div>
    );
  }

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          submittedApp.isApproved
            ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
            : 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
        }`}>
          {submittedApp.isApproved ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
        </div>
        <Badge variant={submittedApp.isApproved ? 'emerald' : 'purple'}>
          {submittedApp.isApproved ? 'Account Activated' : 'Payment Under Review'}
        </Badge>
        <h2 className="text-3xl font-black text-white light:text-slate-900">
          {submittedApp.isApproved ? 'Welcome to SubNova Reseller Network!' : 'Activation Payment Submitted!'}
        </h2>
        <p className="text-sm text-slate-300 light:text-slate-600 leading-relaxed">
          {submittedApp.isApproved
            ? 'Your ৳300 activation fee has been settled directly from your wallet balance. You can now access exclusive wholesale subscription pricing.'
            : `We have received your ৳${activationFeeBDT} activation payment details (TrxID: ${submittedApp.app.transactionRef || 'Pending'}). Our admin team will verify it promptly and activate your account.`}
        </p>
        <div className="pt-4 flex justify-center gap-3">
          {submittedApp.isApproved ? (
            <Button onClick={() => navigate('/reseller')}>Open Reseller Dashboard</Button>
          ) : (
            <Button onClick={() => navigate('/customer/overview')}>My Account Overview</Button>
          )}
          <Button variant="outline" onClick={() => navigate('/products')}>Browse Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Store className="w-3.5 h-3.5 text-purple-400" />
          <span>Official B2B Reseller & Partner Program</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white light:text-slate-900 tracking-tight">
          Become a Certified Reseller
        </h1>
        <p className="text-sm sm:text-base text-slate-300 light:text-slate-600 leading-relaxed">
          Unlock up to <strong className="text-purple-400 font-bold">25% - 40% wholesale discounts</strong> on AI tools, developer software, and premium digital licenses with instantaneous wallet automated fulfillment.
        </p>
      </div>

      {/* Activation Fee Highlight Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="purple">One-Time Activation Fee</Badge>
            <span className="text-xs text-slate-400">Lifetime Partner Access</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Reseller Account Activation: <span className="text-emerald-400">৳{activationFeeBDT} BDT</span>{' '}
            <span className="text-xs font-normal text-slate-400">($ {feeUSD.toFixed(2)} USD)</span>
          </h3>
          <p className="text-xs text-slate-300 light:text-slate-600 max-w-2xl">
            After paying the ৳{activationFeeBDT} activation fee, your account will be verified by the admin or instantly activated via your SubNova wallet balance.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
          <Wallet className="w-8 h-8 text-purple-400" />
          <div>
            <div className="text-xs text-slate-400">Your Wallet Balance</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              ${(user?.walletBalance || 0).toFixed(2)}{' '}
              <span className="text-xs text-slate-400 font-normal">
                (≈ ৳{Math.round((user?.walletBalance || 0) * exchangeRate)})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white light:text-slate-900 pb-3 border-b border-slate-800 light:border-slate-200 flex items-center justify-between">
            <span>1. Agency & Contact Info</span>
            <span className="text-xs font-normal text-purple-400">Step 1 of 2</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Agency / Business Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Digital Bangladesh"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="reseller@agency.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Phone Number / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01712-345678"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Bangladesh">Bangladesh</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="India">India</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Other">Other Region</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Estimated Monthly Sales
              </label>
              <select
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Under ৳10,000">Under ৳10,000 / mo</option>
                <option value="৳10,000 - ৳50,000">৳10,000 - ৳50,000 / mo</option>
                <option value="৳50,000 - ৳200,000">৳50,000 - ৳200,000 / mo</option>
                <option value="৳200,000+">৳200,000+ / mo (High Volume VIP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
              Store / Page URL (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://facebook.com/yourpage or https://yourshop.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Payment Section for ৳300 Activation */}
          <div className="pt-4 border-t border-slate-800 light:border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white light:text-slate-900 flex items-center justify-between">
              <span>2. Pay ৳{activationFeeBDT} Activation Fee</span>
              <Badge variant="purple">৳{activationFeeBDT} BDT / ${feeUSD.toFixed(2)} USD</Badge>
            </h3>

            {/* Method Chooser */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold">Main Wallet</span>
                <span className="text-[10px] text-emerald-400">Instant Activation</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-600/20 border-pink-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold">bKash Personal</span>
                <span className="text-[10px] text-slate-400">Send Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-600/20 border-orange-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold">Nagad Personal</span>
                <span className="text-[10px] text-slate-400">Send Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('usdt_bep20')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                  paymentMethod === 'usdt_bep20'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">USDT / Binance</span>
                <span className="text-[10px] text-slate-400">BEP-20 Network</span>
              </button>
            </div>

            {/* Wallet Deduct Option */}
            {paymentMethod === 'wallet' && (
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Your Current Wallet Balance:</span>
                  <span className="font-mono font-bold text-emerald-400">${(user?.walletBalance || 0).toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Required Activation Fee:</span>
                  <span className="font-mono font-bold text-white">${feeUSD.toFixed(2)} USD (৳{activationFeeBDT} BDT)</span>
                </div>

                {(user?.walletBalance || 0) >= feeUSD ? (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sufficient balance available. Clicking submit will instantly activate your Reseller account!</span>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-purple-500/20">
                    <div className="text-xs text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Insufficient wallet balance. Please add deposit to your wallet or pay via bKash/Nagad.</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/customer/wallet')}
                    >
                      Deposit Funds to Wallet
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* bKash Payment Details */}
            {paymentMethod === 'bkash' && (
              <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 uppercase">bKash Personal Number:</span>
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-pink-500/30 font-mono text-xs font-bold text-white">
                    <span>{settings.paymentSettings.bdt.bkashNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.paymentSettings.bdt.bkashNumber, 'bKash Number')}
                      className="hover:text-pink-400"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  bKash অ্যাপ থেকে <strong>Send Money</strong> করে <strong>৳{activationFeeBDT}</strong> টাকা পাঠান। এরপর নিচের ঘরে আপনার bKash Sender Number এবং TrxID লিখুন।
                </p>
              </div>
            )}

            {/* Nagad Payment Details */}
            {paymentMethod === 'nagad' && (
              <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase">Nagad Personal Number:</span>
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-orange-500/30 font-mono text-xs font-bold text-white">
                    <span>{settings.paymentSettings.bdt.nagadNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.paymentSettings.bdt.nagadNumber, 'Nagad Number')}
                      className="hover:text-orange-400"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Nagad অ্যাপ থেকে <strong>Send Money</strong> করে <strong>৳{activationFeeBDT}</strong> টাকা পাঠান। এরপর Sender Number ও TrxID জমা দিন।
                </p>
              </div>
            )}

            {/* USDT Payment Details */}
            {paymentMethod === 'usdt_bep20' && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase">USDT (BEP-20) Address:</span>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 font-mono text-xs text-emerald-300 break-all">
                    <span>{settings.paymentSettings.usd.usdtBep20Address}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.paymentSettings.usd.usdtBep20Address, 'USDT Address')}
                      className="hover:text-white shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Binance UID: <strong className="text-white font-mono">{settings.paymentSettings.usd.binanceUid}</strong></span>
                  <span>Amount: <strong className="text-emerald-400 font-mono">${feeUSD.toFixed(2)} USDT</strong></span>
                </div>
              </div>
            )}

            {/* Manual Payment Inputs */}
            {paymentMethod !== 'wallet' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                    Sender Mobile No / Wallet Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderInfo}
                    onChange={(e) => setSenderInfo(e.target.value)}
                    placeholder="017xxxxxxxx or 0x..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                    Transaction ID (TrxID / TXID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. 9K8J2LM3Q1"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 font-mono font-bold uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                    Payment Screenshot URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://imgur.com/..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            disabled={paymentMethod === 'wallet' && (user?.walletBalance || 0) < feeUSD}
            className="w-full font-bold py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {paymentMethod === 'wallet'
              ? `Pay ৳${activationFeeBDT} from Wallet & Activate Now`
              : `Submit ৳${activationFeeBDT} Payment & Request Activation`}
          </Button>
        </form>

        {/* Right Info: Interactive Profit Simulator & Tiers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Calculator */}
          <div className="p-6 rounded-3xl bg-slate-900/90 light:bg-white border border-purple-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 light:border-slate-200">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Reseller Profit Calculator
              </span>
              <Badge variant="purple">{Math.round(simTier * 100)}% Margin Tier</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Customer Selling Price:</span>
                  <span className="font-mono font-bold text-white">৳{simRetail} BDT</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={simRetail}
                  onChange={(e) => setSimRetail(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-xs text-slate-300 mb-1.5">Wholesale Tier Discount:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Bronze 20%', val: 0.20 },
                    { label: 'Silver 25%', val: 0.25 },
                    { label: 'Gold 35%', val: 0.35 },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setSimTier(t.val)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        simTier === t.val
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Math breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Wholesale Cost (Deducted from Wallet):</span>
                  <span className="font-mono text-slate-200">৳{wholesaleCost.toFixed(0)} BDT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Customer Paid Total:</span>
                  <span className="font-mono text-slate-200">৳{simRetail.toFixed(0)} BDT</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Your Pure Profit:</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    +৳{simulatedProfit.toFixed(0)} BDT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="p-5 rounded-3xl bg-slate-900/40 light:bg-white border border-slate-800 light:border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reseller System Features</h4>
            <div className="space-y-2.5 text-xs text-slate-300 light:text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant automated API license generation upon order</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seamless wallet balance deduction with zero transaction fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>5% Referral Commission on every referred customer order profit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 VIP priority support desk on WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
