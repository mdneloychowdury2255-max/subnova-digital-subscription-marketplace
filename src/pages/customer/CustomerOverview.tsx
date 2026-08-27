import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  Package,
  Wallet,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Key,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Order } from '../../types';

export const CustomerOverview: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const orders = user ? db.getUserOrders(user.id) : [];
  const activeOrders = orders.filter((o) => o.orderStatus === 'completed');
  const transactions = user ? db.getUserTransactions(user.id).slice(0, 5) : [];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    showToast('success', 'Copied', 'License key copied to clipboard.');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Customer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs text-slate-400">
            Manage your digital licenses, subscriptions, wallet balance, and order receipts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/dashboard/wallet')}
            leftIcon={<Plus className="w-3.5 h-3.5 text-purple-400" />}
          >
            Add Funds
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/products')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Marketplace
          </Button>
        </div>
      </div>

      {/* Reseller Upgrade Banner (for non-reseller users) */}
      {user?.role !== 'reseller' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="purple">Reseller Program</Badge>
              <span className="text-xs text-emerald-400 font-bold">One-time ৳300 Activation</span>
            </div>
            <h3 className="text-lg font-bold text-white">Upgrade to SubNova Certified Reseller</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Get up to 25% wholesale discount on all software licenses, client management dashboard, and earn 5% profit referral commission!
            </p>
          </div>
          <Button
            onClick={() => navigate('/reseller/apply')}
            className="shrink-0 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg text-white"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Activate Reseller (৳300)
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Wallet Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            ${user?.walletBalance.toFixed(2) || '0.00'}
          </p>
          <button
            onClick={() => navigate('/dashboard/wallet')}
            className="text-[11px] text-purple-400 hover:underline mt-1 block font-medium"
          >
            Deposit more funds →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Subscriptions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            {activeOrders.length}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">● Instant access active</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            {orders.length}
          </p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="text-[11px] text-blue-400 hover:underline mt-1 block font-medium"
          >
            View history →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Spent</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            ${totalSpent.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Lifetime checkout volume</p>
        </div>
      </div>

      {/* Active Subscriptions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            My Active Subscriptions & Keys
          </h2>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="text-xs text-purple-400 hover:underline font-semibold"
          >
            View All ({orders.length})
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 light:bg-white border border-slate-800 light:border-slate-200 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white light:text-slate-900">No active subscriptions yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any active digital licenses. Explore our marketplace to get started.
            </p>
            <Button size="sm" onClick={() => navigate('/products')}>Browse Marketplace</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="success">Active Key</Badge>
                    <h3 className="text-base font-bold text-white light:text-slate-900 mt-2">
                      {ord.productName}
                    </h3>
                    <p className="text-xs text-slate-400">{ord.planName} • Order #{ord.orderNumber}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-white light:text-slate-900">
                    ${ord.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* License Key Snip */}
                {ord.deliveryDetails?.licenseKey && (
                  <div className="p-3 rounded-xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-emerald-400 truncate">
                      {ord.deliveryDetails.licenseKey}
                    </span>
                    <button
                      onClick={() => handleCopyKey(ord.deliveryDetails!.licenseKey!)}
                      className="p-1.5 rounded-lg bg-slate-800 light:bg-slate-200 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
                      title="Copy Key"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 light:border-slate-200 text-xs">
                  <span className="text-slate-500">
                    Purchased: {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="text-purple-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Ledger Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white light:text-slate-900">
            Recent Wallet Transactions
          </h2>
          <button
            onClick={() => navigate('/dashboard/transactions')}
            className="text-xs text-purple-400 hover:underline font-semibold"
          >
            Full Ledger →
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500 p-6 text-center">No transactions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60 light:divide-slate-200">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.amount > 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-semibold text-white light:text-slate-900">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200 light:text-slate-800'
                      }`}
                    >
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-slate-300 light:text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 space-y-2">
              <div className="flex justify-between font-bold text-sm text-white light:text-slate-900">
                <span>{selectedOrder.productName}</span>
                <span className="font-mono">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-purple-400">{selectedOrder.planName}</p>
            </div>

            {selectedOrder.credentials && (
              <div className="space-y-2">
                <label className="font-bold text-white light:text-slate-900">License Key:</label>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-400 font-bold flex justify-between items-center border border-slate-800">
                  <span>{selectedOrder.credentials.licenseKey}</span>
                  <button
                    onClick={() => handleCopyKey(selectedOrder.credentials!.licenseKey!)}
                    className="p-1.5 rounded-lg bg-slate-800 text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedOrder.credentials.instructions && (
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {selectedOrder.credentials.instructions}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
