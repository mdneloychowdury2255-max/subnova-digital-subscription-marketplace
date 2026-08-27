import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Users,
  Share2,
  Sparkles,
  ArrowRight,
  Package,
  Plus,
  Percent,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ResellerActivationModal } from '../../components/reseller/ResellerActivationModal';
import { ResellerAdminChatSection } from '../../components/reseller/ResellerAdminChatSection';

export const ResellerOverview: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');

  const settings = db.getSettings();
  const activationFeeBDT = settings.resellerActivationFeeBDT || 300;

  const isAccountActive = user?.resellerStatus === 'active';
  const isPendingApproval = user?.resellerStatus === 'pending_approval';

  const orders = user ? db.getResellerOrders(user.id) : [];
  const clients = user ? db.getResellerClients(user.id) : [];

  // Calculate profit
  const totalWholesaleSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRetailValue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalNetProfit = orders.reduce((sum, o) => sum + (o.resellerProfit || 0), 0);

  const handleOrderClick = () => {
    if (!isAccountActive) {
      showToast(
        'error',
        'অ্যাকাউন্ট অ্যাক্টিভ করুন',
        `রিসেলার অ্যাকাউন্ট অ্যাক্টিভ না থাকলে কোনো অর্ডার করা যাবে না। দয়া করে ৳${activationFeeBDT} ফি প্রদান করে অ্যাকাউন্ট অ্যাক্টিভ করুন।`
      );
      setIsActivationModalOpen(true);
      return;
    }
    navigate('/reseller/place-order');
  };

  const handleToggleDemoStatus = () => {
    if (!user) return;
    const newStatus = isAccountActive ? 'inactive' : 'active';
    db.toggleResellerStatus(user.id, newStatus);
    refreshUser();
    showToast(
      'info',
      `Status Switched: ${newStatus.toUpperCase()}`,
      `Reseller account is now ${newStatus}.`
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. MANDATORY ACTIVATION NOTICE BANNER (When Account is Inactive) */}
      {!isAccountActive && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 border-2 border-amber-500/50 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  {isPendingApproval ? 'অ্যাক্টিভেশন ভেরিফিকেশন পেন্ডিং' : 'অ্যাকাউন্ট অ্যাক্টিভ করুন (Account Active Korun)'}
                </span>
                <span className="text-xs text-rose-400 font-bold">● অর্ডার সুবিধা লক করা</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white light:text-slate-900">
                {isPendingApproval
                  ? 'আপনার ৳৩০০ পেমেন্ট পর্যালোচনায় আছে'
                  : 'রিসেলার অ্যাকাউন্ট অ্যাক্টিভ করতে ৳৩০০ ফি প্রদান করুন'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 max-w-2xl leading-relaxed">
                {isPendingApproval
                  ? 'আপনার ৳৩০০ অ্যাক্টিভেশন পেমেন্টটি অ্যাডমিন হেল্পডেস্কে জমা হয়েছে। অ্যাডমিন ভেরিফাই করলে আপনার অর্ডার ও হোলসেল সুবিধা সক্রিয় হয়ে যাবে। প্রয়োজনে নিচে অ্যাডমিনকে সরাসরি মেসেজ দিন।'
                  : 'রিসেলার সুবিধা পেতে এবং ক্লায়েন্ট অর্ডার করতে এককালীন ৳৩০০ (300 BDT) অ্যাক্টিভেশন ফি প্রদান করা বাধ্যতামূলক। অ্যাকাউন্ট অ্যাক্টিভ না করলে কোনো প্রকার অর্ডার করতে পারবেন না।'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                size="md"
                onClick={() => setIsActivationModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-lg"
                leftIcon={<Zap className="w-4 h-4" />}
              >
                {isPendingApproval ? 'পেমেন্ট স্ট্যাটাস দেখুন' : '৳৩০০ দিয়ে অ্যাকাউন্ট অ্যাক্টিভ করুন'}
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => setActiveTab('chat')}
                className="border-purple-500/40 text-purple-300 hover:bg-purple-600/20"
                leftIcon={<MessageSquare className="w-4 h-4 text-purple-400" />}
              >
                অ্যাডমিনকে মেসেজ দিন
              </Button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>নিরাপত্তা বিধিনিষেধ:</strong> অ্যাকাউন্ট অ্যাক্টিভ না থাকলে প্রোডাক্ট ক্যাটালগ ও ডিসপ্যাচ ফর্ম সুরক্ষিত থাকবে।
              </span>
            </div>
            <button
              onClick={handleToggleDemoStatus}
              className="text-[11px] text-purple-400 hover:underline font-semibold"
            >
              [Demo: Toggle Active/Inactive]
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Navigation Tabs: Dashboard Overview & Live Admin Messenger */}
      <div className="flex items-center gap-3 border-b border-slate-800 light:border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 light:bg-slate-100 text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          রিসেলার ড্যাশবোর্ড ওভারভিউ
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900/60 light:bg-slate-100 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-400" />
          অ্যাডমিন সরাসরি চ্যাট ও মেসেজ
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {activeTab === 'chat' ? (
        /* LIVE ADMIN CHAT & MESSAGING CENTER */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white light:text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                অ্যাডমিনের সাথে সরাসরি বার্তালাপ (Live Messaging)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                যেকোনো মেসেজ পাঠালে অ্যাডমিনের কাছে তাৎক্ষণিকভাবে পৌঁছে যাবে এবং এখান থেকেই কথা বলতে পারবেন।
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ← ওভারভিউতে ফিরুন
            </Button>
          </div>
          <ResellerAdminChatSection />
        </div>
      ) : (
        /* OVERVIEW DASHBOARD VIEW */
        <div className="space-y-8">
          {/* Reseller Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="purple">Silver Partner Tier (25% Wholesale Spread)</Badge>
                {isAccountActive ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> ● Account Active (সক্রিয়)
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> ● Account Inactive (নিষ্ক্রিয়)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
                {user?.name || 'Reseller Hub'} {user?.resellerDetails?.businessName ? `(${user.resellerDetails.businessName})` : ''}
              </h1>
              <p className="text-xs text-slate-300 light:text-slate-600 max-w-xl">
                ক্লায়েন্টদের জন্য হোলসেল দামে ডিজিটাল লাইসেন্স অর্ডার করুন। অর্ডারকৃত পণ্যের মূল্য স্বয়ংক্রিয়ভাবে আপনার ওয়ালেট থেকে কর্তন হবে।
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                size="md"
                onClick={handleOrderClick}
                className={isAccountActive ? 'bg-purple-600' : 'bg-slate-800 text-slate-400 border border-slate-700'}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {isAccountActive ? 'Order for Client' : '🔒 অর্ডার লক করা'}
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => navigate('/reseller/wallet')}
                leftIcon={<Plus className="w-4 h-4 text-purple-400" />}
              >
                Fund Wallet
              </Button>
              <Button
                size="md"
                variant="outline"
                onClick={() => setActiveTab('chat')}
                className="border-purple-500/40 text-purple-300"
                leftIcon={<MessageSquare className="w-4 h-4 text-purple-400" />}
              >
                Message Admin
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wallet Balance */}
            <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Reseller Wallet</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
                ${user?.walletBalance.toFixed(2) || '0.00'}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">● Instant deduction ready</p>
            </div>

            {/* Total Profit Earned */}
            <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Net Profit Earned</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-purple-400 mt-2">
                +${totalNetProfit.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">From wholesale spreads</p>
            </div>

            {/* Client Orders */}
            <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Client Orders Fulfilled</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
                {orders.length}
              </p>
              <button
                onClick={() => navigate('/reseller/orders')}
                className="text-[11px] text-blue-400 hover:underline mt-1 block font-medium"
              >
                View all orders →
              </button>
            </div>

            {/* Managed Clients */}
            <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Managed Clients</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
                {clients.length}
              </p>
              <button
                onClick={() => navigate('/reseller/customers')}
                className="text-[11px] text-amber-400 hover:underline mt-1 block font-medium"
              >
                Manage client book →
              </button>
            </div>
          </div>

          {/* Quick Reseller Admin Chat Widget */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white light:text-slate-900">
                  অ্যাডমিন লাইভ চ্যাট ও সাপোর্ট ডেস্ক
                </h2>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Support Online
              </span>
            </div>
            <ResellerAdminChatSection />
          </div>

          {/* Tier Progress Bar to Gold Tier (35%) */}
          <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white light:text-slate-900">
                Current Tier: Silver Partner (25% Discount)
              </span>
              <span className="text-purple-400 font-semibold font-mono">
                $3,450 / $10,000 to Gold Tier (35%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 light:bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: '34.5%' }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Reach $10,000 in lifetime volume to automatically unlock 35% wholesale margins on all digital licenses.
            </p>
          </div>

          {/* Recent Reseller Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white light:text-slate-900">
                Recent Client Orders & Dispatches
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reseller/orders')}
              >
                View All Reseller Orders
              </Button>
            </div>

            <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
              {orders.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">No reseller orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                      <tr>
                        <th className="p-4">Order #</th>
                        <th className="p-4">Client Name & Email</th>
                        <th className="p-4">Subscription</th>
                        <th className="p-4">Wholesale Cost</th>
                        <th className="p-4">Your Profit</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">License Key</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                            {ord.orderNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white light:text-slate-900">{ord.customerName}</p>
                            <p className="text-[11px] text-slate-400">{ord.customerEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-white light:text-slate-900">{ord.productName}</p>
                            <p className="text-[11px] text-purple-400">{ord.planName}</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                            ${ord.totalAmount.toFixed(2)}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            +${(ord.resellerProfit || 0).toFixed(2)}
                          </td>
                          <td className="p-4">
                            <Badge variant="success">Dispatched</Badge>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-purple-300 truncate max-w-[140px]">
                            {ord.deliveryDetails?.licenseKey || 'Generating'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reseller Activation Modal */}
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
