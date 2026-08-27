import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  AlertCircle,
  TrendingUp,
  Package,
  Plus,
  ArrowRight,
  CheckCircle2,
  Key,
  CreditCard,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminOverview: React.FC = () => {
  const { navigate } = useNavigation();

  const orders = db.getOrders();
  const products = db.getProducts();
  const resellers = db.getResellers();
  const tickets = db.getTickets();
  const applications = db.getResellerApplications();

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0),
    0
  );
  const pendingTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Admin Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="purple">Master Administration Console</Badge>
            <span className="text-xs text-emerald-400 font-bold">● System Operational</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Platform Operations & Commerce
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Control marketplace catalog, multi-tier pricing, digital license key fulfillment pools, partner commissions, and customer support.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            size="sm"
            onClick={() => navigate('/admin/products')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Product
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/inventory')}
            leftIcon={<Key className="w-3.5 h-3.5 text-purple-400" />}
          >
            Stock Keys
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Platform Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">● Settled transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Orders Processed</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            {orders.length}
          </p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-[11px] text-blue-400 hover:underline mt-1 block font-medium"
          >
            Manage orders →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Resellers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            {resellers.length}
          </p>
          {pendingApps.length > 0 ? (
            <button
              onClick={() => navigate('/admin/resellers')}
              className="text-[11px] text-amber-400 font-bold hover:underline mt-1 block"
            >
              ⚠ {pendingApps.length} pending application(s)
            </button>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">All partners verified</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Open Support Tickets</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white light:text-slate-900 mt-2">
            {pendingTickets.length}
          </p>
          <button
            onClick={() => navigate('/admin/support')}
            className="text-[11px] text-purple-400 hover:underline mt-1 block font-medium"
          >
            Help desk queue →
          </button>
        </div>
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/resellers')}
          className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400">Reseller Applications</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>
          <h4 className="text-sm font-bold text-white light:text-slate-900">
            {pendingApps.length} Application(s) Awaiting Review
          </h4>
          <p className="text-[11px] text-slate-400">
            Review wholesale partner business credentials and set wholesale margin tiers.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/inventory')}
          className="p-5 rounded-2xl bg-blue-950/30 border border-blue-500/30 hover:border-blue-500 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400">Digital Inventory</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-sm font-bold text-white light:text-slate-900">
            Fulfillment Key Pools
          </h4>
          <p className="text-[11px] text-slate-400">
            Add batch license keys to ensure instant delivery for high-demand subscriptions.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/config-guide')}
          className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Architecture & Deploy</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-white light:text-slate-900">
            Production Configuration Guide
          </h4>
          <p className="text-[11px] text-slate-400">
            Full instructions for connecting real PostgreSQL, Stripe, Resend email & S3.
          </p>
        </div>
      </div>

      {/* Recent Orders Live Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white light:text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            Live Marketplace Orders Stream
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/orders')}
          >
            View All Global Orders
          </Button>
        </div>

        <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer / Reseller</th>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white light:text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">
                        {ord.resellerName ? `Via Reseller: ${ord.resellerName}` : ord.customerEmail}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white light:text-slate-900">{ord.productName}</p>
                      <p className="text-[11px] text-purple-400">{ord.planName}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{ord.paymentMethod}</span>
                      <span className="block text-[10px] text-emerald-400 font-bold uppercase">{ord.paymentStatus}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={ord.orderStatus === 'completed' ? 'success' : 'neutral'}>
                        {ord.orderStatus}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
