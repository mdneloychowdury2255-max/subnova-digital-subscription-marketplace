import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  Wallet,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  User,
  Mail,
  Zap,
  Lock,
  AlertCircle,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ResellerActivationModal } from '../../components/reseller/ResellerActivationModal';

export const ResellerPlaceOrderPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { searchParams, navigate } = useNavigation();
  const { showToast } = useToast();

  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  const products = db.getProducts();
  const preSelectedProdId = searchParams.get('productId') || products[0]?.id || '';
  const preSelectedPlanId = searchParams.get('planId') || '';

  const [selectedProductId, setSelectedProductId] = useState<string>(preSelectedProdId);
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    preSelectedPlanId || selectedProduct?.plans[0]?.id || ''
  );
  const selectedPlan =
    selectedProduct?.plans.find((p) => p.id === selectedPlanId) ||
    selectedProduct?.plans[0];

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPrice, setClientPrice] = useState<number>(selectedPlan?.retailPrice || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAccountActive = user?.resellerStatus === 'active';
  const settings = db.getSettings();
  const activationFeeBDT = settings.resellerActivationFeeBDT || 300;

  if (!selectedProduct || !selectedPlan) return null;

  const wholesaleCost = selectedPlan.resellerPrice;
  const netProfit = Number((clientPrice - wholesaleCost).toFixed(2));
  const currentWallet = user?.walletBalance || 0;

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && prod.plans[0]) {
      setSelectedPlanId(prod.plans[0].id);
      setClientPrice(prod.plans[0].retailPrice);
    }
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = selectedProduct.plans.find((p) => p.id === planId);
    if (plan) {
      setClientPrice(plan.retailPrice);
    }
  };

  const handlePlaceClientOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAccountActive) {
      setError(`অ্যাকাউন্ট অ্যাক্টিভ না থাকলে কোনো অর্ডার করা যাবে না। দয়া করে ৳${activationFeeBDT} ফি দিয়ে অ্যাকাউন্ট অ্যাক্টিভ করুন।`);
      setIsActivationModalOpen(true);
      return;
    }

    if (!clientName.trim() || !clientEmail.trim()) {
      setError('Please provide client name and delivery email.');
      return;
    }

    if (currentWallet < wholesaleCost) {
      setError(`Insufficient reseller wallet balance ($${currentWallet.toFixed(2)}). You need $${wholesaleCost.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const result = db.placeOrder({
          customerId: `client-${Date.now()}`,
          customerName: clientName.trim(),
          customerEmail: clientEmail.trim(),
          resellerId: user?.id,
          resellerName: user?.name,
          productId: selectedProduct.id,
          planId: selectedPlan.id,
          paymentMethod: 'wallet',
        });

        setIsSubmitting(false);
        if (result.success && result.order) {
          showToast('success', 'Client License Dispatched!', `Order #${result.order.orderNumber} fulfilled from wallet.`);
          navigate(`/order-success?orderId=${result.order.id}`);
        } else {
          setError(result.error === 'INSUFFICIENT_BALANCE' ? 'Insufficient wallet balance. Please top up your wallet.' : result.error || 'Failed to place order.');
          showToast('error', 'Order Failed', result.error === 'INSUFFICIENT_BALANCE' ? 'Insufficient wallet balance.' : result.error);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err.message === 'INSUFFICIENT_BALANCE' ? 'Insufficient wallet balance. Please top up your wallet.' : err.message || 'Failed to place order.');
        showToast('error', 'Order Failed', err.message === 'INSUFFICIENT_BALANCE' ? 'Insufficient wallet balance.' : err.message);
      }
    }, 500);
  };

  // If Account is NOT active, render the activation gate block
  if (!isAccountActive) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/40">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <Badge variant="warning">Account Activation Required</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
              অ্যাকাউন্ট অ্যাক্টিভ করুন (300tk Fee Required)
            </h1>
            <p className="text-sm text-slate-300 light:text-slate-600 leading-relaxed">
              রিসেলার অ্যাকাউন্ট অ্যাক্টিভ করতে <span className="font-bold text-amber-400">৳৩০০</span> ফি লাগবে।
              <strong className="block text-rose-400 mt-1">অ্যাকাউন্ট অ্যাক্টিভ না করলে কোনো অর্ডার করতে পারবেন না।</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>অ্যাক্টিভেশনের পর যা যা সুবিধা পাবেন:</span>
            </div>
            <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
              <li>ক্লায়েন্টদের জন্য সরাসরি ইনস্ট্যান্ট হোলসেল অর্ডার ও ডেলিভারি</li>
              <li>প্রতিটি সাবস্ক্রিপশন অর্ডারে ২৫% থেকে ৩৫% নিশ্চিত কমিশন</li>
              <li>ক্লায়েন্ট ম্যানেজমেন্ট এবং লাইসেন্স ইনভেন্টরি ট্র্যাকিং</li>
              <li>২৪/৭ অ্যাডমিন ডিরেক্ট চ্যাট ও প্রায়োরিটি সাপোর্ট</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => setIsActivationModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-xl px-8"
              leftIcon={<Zap className="w-5 h-5" />}
            >
              ৳৩০০ দিয়ে এখনই অ্যাকাউন্ট অ্যাক্টিভ করুন
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/reseller')}
              className="border-purple-500/40 text-purple-300"
              leftIcon={<MessageSquare className="w-5 h-5 text-purple-400" />}
            >
              অ্যাডমিনকে মেসেজ দিন
            </Button>
          </div>
        </div>

        <ResellerActivationModal
          isOpen={isActivationModalOpen}
          onClose={() => setIsActivationModalOpen(false)}
          onSuccess={() => {
            refreshUser();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          Place Client Order (Automated Wallet Dispatch)
        </h1>
        <p className="text-xs text-slate-400">
          Select subscription product and enter your client's details. Wholesale cost will be deducted from your wallet balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <form onSubmit={handlePlaceClientOrder} className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              1. Choose Subscription Product
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.categoryName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Subscription Plan Duration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProduct.plans.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handlePlanChange(pl.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                      selectedPlanId === pl.id
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                        : 'bg-slate-950 light:bg-slate-50 border-slate-800 light:border-slate-300 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{pl.name}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ${pl.resellerPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{pl.billingCycle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              2. End-Client Recipient Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Client Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Client Email (for Delivery)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                Client Quoted Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={wholesaleCost}
                  value={clientPrice}
                  onChange={(e) => setClientPrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Wholesale base cost is ${wholesaleCost.toFixed(2)}. You pocket the difference.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
            leftIcon={<Zap className="w-4 h-4" />}
          >
            {isSubmitting
              ? 'Dispatching Automated License...'
              : `Confirm Order & Deduct $${wholesaleCost.toFixed(2)} from Wallet`}
          </Button>
        </form>

        {/* Right Financial Calculation & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Profit & Dispatch Breakdown
            </h3>

            <div className="space-y-3 text-xs divide-y divide-slate-800 light:divide-slate-200">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Client Charged Price:</span>
                <span className="font-mono font-bold text-white light:text-slate-900">
                  ${clientPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Wholesale Base Cost (Deducted):</span>
                <span className="font-mono font-bold text-rose-400">
                  -${wholesaleCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Your Net Profit Margin:
                </span>
                <span className="font-mono text-sm">+${netProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* Wallet status */}
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Your Current Reseller Wallet:</span>
                <span className="font-mono font-bold text-white light:text-slate-900">
                  ${currentWallet.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Balance After Order:</span>
                <span
                  className={`font-mono font-bold ${
                    currentWallet >= wholesaleCost ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${(currentWallet - wholesaleCost).toFixed(2)}
                </span>
              </div>
              {currentWallet < wholesaleCost && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/reseller/wallet')}
                    className="w-full text-purple-400 border-purple-500/30"
                  >
                    Top Up Wallet Now
                  </Button>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              <span>
                Orders are fulfilled instantly with official license keys and activation credentials sent to your client's email.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ResellerActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onSuccess={() => {
          refreshUser();
        }}
      />
    </div>
  );
};
