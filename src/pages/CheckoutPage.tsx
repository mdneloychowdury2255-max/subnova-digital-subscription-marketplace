import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { db } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Tag,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Upload,
  Info,
  ImageIcon,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PaymentMethodType } from '../types';

export const CheckoutPage: React.FC = () => {
  const { searchParams, navigate } = useNavigation();
  const { user, role } = useAuth();
  const { currency, exchangeRate, formatPrice } = useCurrency();
  const { showToast } = useToast();

  const rawSettings = db.getPaymentSettings();
  const paymentSettings = {
    ...rawSettings,
    bdt: rawSettings.bdt || rawSettings.paymentSettings?.bdt || {
      bkashNumber: '01712-345678',
      bkashType: 'Personal' as const,
      nagadNumber: '01812-345678',
      nagadType: 'Personal' as const,
      instructions: 'bKash বা Nagad-এ সেন্ড মানি করুন।',
    },
    usd: rawSettings.usd || rawSettings.paymentSettings?.usd || {
      usdtBep20Address: '0x8f2a1b9c4d3e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      binanceUid: '839201847',
      instructions: 'Send exact payment in USDT via BEP20 network or Binance Pay UID.',
    },
  };

  const productId = searchParams.get('productId');
  const planId = searchParams.get('planId');

  const product = db.getProductById(productId || 'prod-ai-suite');
  const plan = product?.plans.find((p) => p.id === planId) || product?.plans[0];

  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);
  
  // Default payment method: bKash for BDT, USDT BEP-20 for USD (or wallet if funded)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    currency === 'BDT' ? 'bkash' : (user && user.walletBalance > 20 ? 'wallet' : 'usdt_bep20')
  );

  // Manual payment details inputs
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [senderWallet, setSenderWallet] = useState('');
  const [senderBinanceUid, setSenderBinanceUid] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto adjust default payment method when currency toggled
  useEffect(() => {
    setPaymentMethod((prev) => {
      if (currency === 'BDT' && ['usdt_bep20', 'binance_uid', 'crypto', 'bank_transfer'].includes(prev)) {
        return 'bkash';
      }
      if (currency === 'USD' && ['bkash', 'nagad'].includes(prev)) {
        return 'usdt_bep20';
      }
      return prev;
    });
  }, [currency]);

  if (!product || !plan) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Invalid Checkout Selection</h2>
        <Button onClick={() => navigate('/products')}>Return to Marketplace</Button>
      </div>
    );
  }

  const isReseller = role === 'reseller';
  const unitPriceUSD = isReseller ? plan.resellerPrice : plan.retailPrice;
  const subtotalUSD = unitPriceUSD;
  const discountAmountUSD = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmountUSD = Math.max(0, Number((subtotalUSD - discountAmountUSD).toFixed(2)));
  const totalAmountBDT = Number((totalAmountUSD * exchangeRate).toFixed(2));
  const totalDisplay = currency === 'BDT' ? `৳${totalAmountBDT.toLocaleString('en-US')}` : `$${totalAmountUSD.toFixed(2)}`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('info', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Invalid File', 'Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setScreenshotPreview(result);
      setScreenshotUrl(result);
      showToast('success', 'Screenshot Attached', 'Payment receipt image uploaded.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotUrl('');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = db.validateCoupon(couponCode, subtotalUSD, product.id, product.categoryId);
    if (result.valid && (result.discountAmount !== undefined || result.discount !== undefined)) {
      const disc = result.discountAmount ?? result.discount ?? 0;
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount: disc,
        message: result.message || `Saved $${disc.toFixed(2)}`,
      });
      showToast('success', 'Coupon Applied', result.message || 'Coupon applied successfully!');
      setErrorMessage(null);
    } else {
      const errMsg = result.error || result.message || 'Invalid coupon code';
      showToast('error', 'Invalid Coupon', errMsg);
      setErrorMessage(errMsg);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerEmail.trim()) {
      setErrorMessage('Please provide a valid recipient email address for license delivery.');
      return;
    }

    if (paymentMethod === 'wallet') {
      const payerBalance = user?.walletBalance || 0;
      if (payerBalance < totalAmountUSD) {
        setErrorMessage(`Insufficient wallet balance ($${payerBalance.toFixed(2)}). Please deposit funds or select bKash, Nagad, USDT, or Binance UID.`);
        return;
      }
    }

    // Validation for manual payments
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!senderNumber.trim() || !transactionId.trim()) {
        setErrorMessage(`Please enter your ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Sender Number and Transaction ID (TrxID).`);
        return;
      }
    }

    if (paymentMethod === 'usdt_bep20') {
      if (!transactionId.trim()) {
        setErrorMessage('Please provide the USDT BEP-20 Transaction Hash (TXID).');
        return;
      }
    }

    if (paymentMethod === 'binance_uid') {
      if (!senderBinanceUid.trim()) {
        setErrorMessage('Please enter your Binance Pay UID or Account Nickname.');
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      const orderResult = db.placeOrder({
        customerId: user?.id || `user-guest-${Date.now()}`,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        resellerId: isReseller ? user?.id : undefined,
        resellerName: isReseller ? user?.name : undefined,
        productId: product.id,
        planId: plan.id,
        quantity: 1,
        currency,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        paymentDetails: {
          senderNumber: senderNumber.trim() || undefined,
          transactionId: transactionId.trim() || undefined,
          senderWallet: senderWallet.trim() || undefined,
          senderBinanceUid: senderBinanceUid.trim() || undefined,
          screenshotUrl: (screenshotUrl.trim() || screenshotPreview || undefined),
        },
      });

      setIsProcessing(false);

      if (orderResult.success && orderResult.order) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas blocked
        }

        if (orderResult.order.orderStatus === 'payment_review') {
          showToast('success', 'Order Submitted for Verification', `Order #${orderResult.order.orderNumber} received. Admin will verify payment and release keys.`);
        } else {
          showToast('success', 'Order Confirmed!', 'Your subscription license has been delivered.');
        }

        navigate(`/order-success?orderId=${orderResult.order.id}`);
      } else {
        setErrorMessage(orderResult.error || 'Failed to place order.');
        showToast('error', 'Checkout Error', orderResult.error);
      }
    }, 900);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/products/${product.id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change Selection
        </button>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer Details & Payment Method */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Info */}
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-mono">1</span>
              Recipient & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Full Name / Contact
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Delivery Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +880 1712 345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              License credentials and activation instructions will be dispatched to this email immediately upon verification.
            </p>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                Choose Manual Payment Method
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                Active Currency: {currency}
              </span>
            </div>

            {/* Payment Options Grid - Strictly bKash, Nagad, USDT BEP20, Binance UID, SubNova Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* bKash */}
              <div
                id="select-method-bkash"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-950/40 border-pink-500 light:bg-pink-50 ring-2 ring-pink-500/20 shadow-lg shadow-pink-500/10'
                    : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg">
                    ৳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white light:text-slate-900">bKash (বিকাশ)</p>
                    <p className="text-[10px] text-slate-400">{paymentSettings.bdt.bkashType} Send Money</p>
                  </div>
                </div>
              </div>

              {/* Nagad */}
              <div
                id="select-method-nagad"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-950/40 border-orange-500 light:bg-orange-50 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10'
                    : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg">
                    ৳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white light:text-slate-900">Nagad (নগদ)</p>
                    <p className="text-[10px] text-slate-400">{paymentSettings.bdt.nagadType} Send Money</p>
                  </div>
                </div>
              </div>

              {/* USDT BEP20 */}
              <div
                id="select-method-usdt"
                onClick={() => setPaymentMethod('usdt_bep20')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'usdt_bep20'
                    ? 'bg-emerald-950/40 border-emerald-500 light:bg-emerald-50 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    ₮
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white light:text-slate-900">USDT (BEP-20)</p>
                    <p className="text-[10px] text-slate-400">BNB Smart Chain</p>
                  </div>
                </div>
              </div>

              {/* Binance Pay UID */}
              <div
                id="select-method-binance"
                onClick={() => setPaymentMethod('binance_uid')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'binance_uid'
                    ? 'bg-amber-950/40 border-amber-500 light:bg-amber-50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white light:text-slate-900">Binance Pay (UID)</p>
                    <p className="text-[10px] text-slate-400">0% Gas Fee Transfer</p>
                  </div>
                </div>
              </div>

              {/* Wallet Balance (Optional if user has balance) */}
              <div
                id="select-method-wallet"
                onClick={() => setPaymentMethod('wallet')}
                className={`sm:col-span-2 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-purple-950/40 border-purple-500 light:bg-purple-50 ring-2 ring-purple-500/20'
                    : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white light:text-slate-900">Pay with SubNova Wallet</p>
                      <p className="text-[10px] text-slate-400">Instant Automated Fulfill (No admin review wait)</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    Balance: ${user?.walletBalance.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Payment Instructions & Input Panels */}
            {paymentMethod === 'bkash' && (
              <div className="p-5 rounded-2xl bg-pink-950/20 light:bg-pink-50/60 border border-pink-500/30 space-y-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-pink-300 light:text-pink-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> bKash {paymentSettings.bdt.bkashType} Account
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-pink-400 bg-pink-950/60 px-3 py-1 rounded-xl border border-pink-500/30">
                      {paymentSettings.bdt.bkashNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.bdt.bkashNumber, 'bkash')}
                      className="px-3 py-1 rounded-xl bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'bkash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200 light:text-pink-900 leading-relaxed">
                  📌 <strong>Send Money</strong> করুন ঠিক <strong>৳{totalAmountBDT.toLocaleString()}</strong> টাকা। পাঠানোর পর প্রাপ্ত <strong>Sender Number</strong> এবং <strong>TrxID</strong> নিচে দিয়ে অর্ডার সাবমিট করুন।
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      Sender bKash Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      bKash TrxID (Transaction ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 9K8J2LM3Q1"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 uppercase focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'nagad' && (
              <div className="p-5 rounded-2xl bg-orange-950/20 light:bg-orange-50/60 border border-orange-500/30 space-y-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-orange-300 light:text-orange-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Nagad {paymentSettings.bdt.nagadType} Account
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-orange-400 bg-orange-950/60 px-3 py-1 rounded-xl border border-orange-500/30">
                      {paymentSettings.bdt.nagadNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.bdt.nagadNumber, 'nagad')}
                      className="px-3 py-1 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'nagad' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'nagad' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/20 text-xs text-orange-200 light:text-orange-900 leading-relaxed">
                  📌 নগদ অ্যাপ থেকে <strong>Send Money</strong> করুন ঠিক <strong>৳{totalAmountBDT.toLocaleString()}</strong> টাকা। সফল হওয়ার পর <strong>Sender Number</strong> এবং <strong>TrxID</strong> নিচে দিন।
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      Sender Nagad Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      Nagad TrxID (Transaction ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. 7N3A9K2B1C"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 uppercase focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'usdt_bep20' && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 light:bg-emerald-50/60 border border-emerald-500/30 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 light:text-emerald-800">
                    USDT Deposit Address (BEP-20 / BNB Chain)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentSettings.usd.usdtBep20Address, 'usdt')}
                    className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 flex items-center gap-1"
                  >
                    {copiedKey === 'usdt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'usdt' ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 font-mono text-xs text-emerald-400 break-all select-all">
                  {paymentSettings.usd.usdtBep20Address}
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 light:text-emerald-900">
                  📌 Send exactly <strong>${totalAmountUSD.toFixed(2)} USDT</strong> on <strong>BNB Smart Chain (BEP-20)</strong>. Then provide your Transaction Hash (TXID) below.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      Sender Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={senderWallet}
                      onChange={(e) => setSenderWallet(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                      Transaction Hash (TXID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="0x8f2a7b3..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'binance_uid' && (
              <div className="p-5 rounded-2xl bg-amber-950/20 light:bg-amber-50/60 border border-amber-500/30 space-y-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 light:text-amber-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" /> Official Binance Pay UID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/30">
                      {paymentSettings.usd.binanceUid}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.usd.binanceUid, 'buid')}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1"
                    >
                      {copiedKey === 'buid' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'buid' ? 'Copied' : 'Copy UID'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200 light:text-amber-900">
                  📌 Binance App &gt; <strong>Pay</strong> &gt; <strong>Send</strong> &gt; UID: <strong className="font-mono text-amber-300">{paymentSettings.usd.binanceUid}</strong> (Amount: <strong>${totalAmountUSD.toFixed(2)}</strong>). Enter your sender UID or Nickname below.
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] text-slate-300 light:text-slate-700 font-semibold mb-1">
                    Your Binance Pay UID or Binance Nickname *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderBinanceUid}
                    onChange={(e) => setSenderBinanceUid(e.target.value)}
                    placeholder="e.g. 192847192 or AlexCrypto"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 text-xs font-mono text-white light:text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Optional Screenshot Upload Section for all manual methods */}
            {paymentMethod !== 'wallet' && (
              <div className="p-4 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 light:text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-400" /> Payment Screenshot Proof (Optional but Recommended)
                  </label>
                  {screenshotPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {screenshotPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-slate-900 p-2 flex items-center gap-3">
                    <img
                      src={screenshotPreview}
                      alt="Receipt preview"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-800"
                    />
                    <div className="text-xs text-slate-300">
                      <p className="font-semibold text-emerald-400">Payment Proof Attached</p>
                      <p className="text-[10px] text-slate-400">Admin will inspect this during manual verification.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 cursor-pointer bg-slate-900/40 light:bg-white hover:bg-slate-900/80 transition-all text-xs text-slate-300">
                      <Upload className="w-4 h-4 text-purple-400" />
                      <span>Click to upload image receipt</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isProcessing}
            className="w-full text-base font-bold py-4 shadow-xl shadow-purple-600/20"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Submit Order for Verification ({totalDisplay})
          </Button>
        </form>

        {/* Right Summary Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl p-6 sm:p-7 bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-6">
            <h4 className="text-base font-bold text-white light:text-slate-900 pb-3 border-b border-slate-800 light:border-slate-200">
              Order Summary
            </h4>

            {/* Product item */}
            <div className="flex gap-3.5">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-white light:text-slate-900">{product.name}</p>
                <p className="text-xs text-purple-400 font-semibold">{plan.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Billing: {plan.billingCycle}</p>
              </div>
            </div>

            {/* Coupon input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs font-mono text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Try demo coupon: <span className="font-mono text-purple-400">WELCOME10</span> or <span className="font-mono text-purple-400">SUBNOWA20</span></p>
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800 light:border-slate-200 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({plan.billingCycle}):</span>
                <span className="font-mono font-medium text-white light:text-slate-900">
                  {formatPrice(subtotalUSD)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span className="font-mono font-medium">-{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Instant Delivery Dispatch Fee:</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-800 light:border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white light:text-slate-900">Total Payable:</span>
                <span className="text-2xl font-black font-mono text-white light:text-slate-900">
                  {totalDisplay}
                </span>
              </div>

              {currency === 'BDT' && (
                <p className="text-[10px] text-slate-500 font-mono text-right">
                  Rate: 1 USD = ৳{exchangeRate} BDT (${totalAmountUSD.toFixed(2)})
                </p>
              )}
            </div>

            {/* Guarantees & Verification Notice */}
            <div className="p-4 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 light:text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Manual verification queue with fast approval</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 light:text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Official legitimate activation credentials</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 light:text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Credentials delivered directly to your email and dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
