import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PaymentMethodType } from '../../types';
import {
  ShieldCheck,
  Zap,
  Wallet,
  CheckCircle2,
  Copy,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ResellerActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResellerActivationModal: React.FC<ResellerActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const settings = db.getSettings();
  const activationFeeBDT = settings.resellerActivationFeeBDT || 300;
  const exchangeRate = settings.usdExchangeRate || 120;
  const feeUSD = Number((activationFeeBDT / exchangeRate).toFixed(2));

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    (user?.walletBalance || 0) >= feeUSD ? 'wallet' : 'bkash'
  );
  const [transactionRef, setTransactionRef] = useState('');
  const [senderInfo, setSenderInfo] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const walletBalance = user?.walletBalance || 0;
  const canPayWithWallet = walletBalance >= feeUSD;

  const paymentNumbers: Record<string, { number: string; type: string }> = {
    bkash: { number: '01712-345678', type: 'Personal (Send Money)' },
    nagad: { number: '01812-345678', type: 'Personal (Send Money)' },
    rocket: { number: '01912-345678-9', type: 'Personal (Send Money)' },
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', 'কপি করা হয়েছে!', `${label} ক্লিপবোর্ডে কপি হয়েছে।`);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('error', 'লগইন প্রয়োজন', 'দয়া করে লগইন করুন।');
      return;
    }

    if (paymentMethod !== 'wallet' && !transactionRef.trim()) {
      showToast('error', 'TrxID প্রয়োজন', 'দয়া করে পেমেন্টের Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'wallet') {
        const result = db.activateResellerWithWallet(user.id);
        if (result.success) {
          refreshUser();
          showToast(
            'success',
            'অ্যাকাউন্ট সফলভাবে অ্যাক্টিভ হয়েছে! 🎉',
            `ওয়ালেট থেকে $${feeUSD} (৳${activationFeeBDT}) কর্তন করে আপনার অ্যাকাউন্ট অ্যাক্টিভ করা হয়েছে। এখন আপনি সব অর্ডার করতে পারবেন।`
          );
          if (onSuccess) onSuccess();
          onClose();
        } else {
          showToast('error', 'অ্যাক্টিভেশন ব্যর্থ', result.error || 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।');
        }
      } else {
        // Manual payment submission
        const result = db.submitResellerApplication({
          userId: user.id,
          businessName: user.resellerDetails?.businessName || `${user.name} Digital`,
          name: user.name,
          email: user.email,
          phone: senderInfo || user.phone,
          country: 'Bangladesh',
          expectedVolume: 'Wholesale Standard',
          reason: `Reseller Activation ৳${activationFeeBDT} Fee Payment`,
          paymentMethod,
          transactionRef: transactionRef.trim(),
          senderInfo: senderInfo.trim(),
        });

        refreshUser();
        showToast(
          'success',
          'পেমেন্ট তথ্য জমা দেওয়া হয়েছে!',
          'অ্যাডমিন যাচাই করার পর আপনার অ্যাকাউন্টটি সক্রিয় হয়ে যাবে। আপনি অ্যাডমিনকে সরাসরি মেসেজ দিতে পারেন।'
        );
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      showToast('error', 'ত্রুটি', err.message || 'অ্যাক্টিভেশন সম্পন্ন করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="রিসেলার অ্যাকাউন্ট অ্যাক্টিভ করুন"
      subtitle="Account Active Korun (৳৩০০ ফি)"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleActivate} className="space-y-5 text-xs">
        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>অ্যাকাউন্ট অ্যাক্টিভেশন সংক্রান্ত নিয়মাবলী:</span>
          </div>
          <ul className="list-disc list-inside text-slate-300 light:text-slate-700 space-y-1 leading-relaxed text-[11px]">
            <li>
              রিসেলার অ্যাকাউন্ট অ্যাক্টিভ করতে এককালীন <span className="font-bold text-amber-300">৳৩০০ (300 BDT)</span> ফি প্রয়োজন।
            </li>
            <li>
              <span className="font-bold text-amber-300">অ্যাকাউন্ট অ্যাক্টিভ না করলে কোনো প্রকার অর্ডার করতে পারবেন না।</span>
            </li>
            <li>অ্যাক্টিভেশনের পর আজীবন হোলসেল মূল্য ও ২৫% থেকে ৩৫% কমিশন সুবিধা পাবেন।</li>
          </ul>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/80 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">এককালীন অ্যাক্টিভেশন ফি</span>
            <span className="text-xl font-black font-mono text-emerald-400">
              ৳{activationFeeBDT} <span className="text-xs text-slate-400 font-normal">(${feeUSD.toFixed(2)} USD)</span>
            </span>
          </div>
          <div className="text-right">
            <Badge variant="purple">Lifetime Wholesale Access</Badge>
            <span className="text-[10px] text-slate-400 block mt-1">
              ওয়ালেট ব্যালেন্স: ${walletBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <label className="font-bold text-white light:text-slate-900 block text-xs">
            পেমেন্ট মাধ্যম বেছে নিন:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Wallet Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                paymentMethod === 'wallet'
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                  : 'bg-slate-900/60 light:bg-slate-100 border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs">ওয়ালেট ব্যালেন্স</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {canPayWithWallet ? 'ইনস্ট্যান্ট অ্যাক্টিভ' : 'ব্যালেন্স কম'}
              </span>
            </button>

            {/* bKash */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bkash')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                paymentMethod === 'bkash'
                  ? 'bg-pink-600/20 border-pink-500 text-white shadow-lg'
                  : 'bg-slate-900/60 light:bg-slate-100 border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center font-black text-[10px] text-white">
                b
              </div>
              <span className="font-bold text-xs">bKash</span>
              <span className="text-[10px] text-slate-400">Send Money</span>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setPaymentMethod('nagad')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                paymentMethod === 'nagad'
                  ? 'bg-orange-600/20 border-orange-500 text-white shadow-lg'
                  : 'bg-slate-900/60 light:bg-slate-100 border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center font-black text-[10px] text-white">
                ন
              </div>
              <span className="font-bold text-xs">Nagad</span>
              <span className="text-[10px] text-slate-400">Send Money</span>
            </button>

            {/* Rocket */}
            <button
              type="button"
              onClick={() => setPaymentMethod('rocket')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                paymentMethod === 'rocket'
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                  : 'bg-slate-900/60 light:bg-slate-100 border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center font-black text-[10px] text-white">
                R
              </div>
              <span className="font-bold text-xs">Rocket</span>
              <span className="text-[10px] text-slate-400">Send Money</span>
            </button>
          </div>
        </div>

        {/* Method Specific Instructions */}
        {paymentMethod === 'wallet' ? (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>১-ক্লিকে ইনস্ট্যান্ট অ্যাক্টিভেশন</span>
            </div>
            <p className="text-[11px] text-slate-300 light:text-slate-600">
              আপনার ওয়ালেট ব্যালেন্স (${walletBalance.toFixed(2)}) থেকে সরাসরি ${feeUSD} (৳{activationFeeBDT}) কর্তন করে তৎক্ষণাৎ অ্যাকাউন্ট সক্রিয় হয়ে যাবে।
            </p>
            {!canPayWithWallet && (
              <p className="text-[11px] text-rose-400 font-bold">
                ⚠️ আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। দয়া করে bKash / Nagad নির্বাচন করুন অথবা ওয়ালেটে টাকা রিচার্জ করুন।
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                {paymentMethod.toUpperCase()} নাম্বার ({paymentNumbers[paymentMethod]?.type}):
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white light:text-slate-900 text-sm">
                  {paymentNumbers[paymentMethod]?.number}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      paymentNumbers[paymentMethod]?.number || '',
                      paymentMethod.toUpperCase()
                    )
                  }
                  className="p-1.5 rounded-lg bg-slate-800 light:bg-slate-200 text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 light:border-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 light:text-slate-700">
                  আপনার প্রেরক নাম্বার (Sender Number)
                </label>
                <input
                  type="text"
                  required
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 light:text-slate-700">
                  Transaction ID (TrxID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. 9J28DA12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 font-mono uppercase focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (paymentMethod === 'wallet' && !canPayWithWallet)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            {isSubmitting ? 'প্রসেসিং হচ্ছে...' : `৳${activationFeeBDT} দিয়ে অ্যাক্টিভ করুন`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
