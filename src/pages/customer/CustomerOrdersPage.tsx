import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  ShoppingBag,
  Search,
  Key,
  Copy,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Package,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { OrderTimeline } from '../../components/ui/OrderTimeline';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';

export const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = user ? db.getUserOrders(user.id) : [];

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.planName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    showToast('success', 'Copied', 'License key copied to clipboard.');
  };

  const handleDownloadInvoice = (order: Order) => {
    const text = `SUBNOWA INVOICE RECEIPT\nOrder: ${order.orderNumber}\nProduct: ${order.productName} (${order.planName})\nPaid: $${order.totalAmount.toFixed(2)} via ${order.paymentMethod.toUpperCase()}\nLicense: ${order.deliveryDetails?.licenseKey || 'N/A'}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Invoice Downloaded', `Invoice-${order.orderNumber}.txt saved.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900">
            My Subscriptions & Orders
          </h1>
          <p className="text-xs text-slate-400">
            View all your digital subscription orders, licenses, and fulfillment receipts.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/products')}>
          Browse Marketplace
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, product..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'completed', 'processing', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Orders' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white light:text-slate-900">No orders found</h4>
            <p className="text-xs text-slate-400">Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Product & Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white light:text-slate-900">{ord.productName}</p>
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
                      {ord.orderStatus === 'completed' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : ord.orderStatus === 'processing' ? (
                        <Badge variant="warning">Processing</Badge>
                      ) : (
                        <Badge variant="neutral">Pending</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
                        title="View License & Timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(ord)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: #${selectedOrder.orderNumber}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs text-slate-300 light:text-slate-700">
            {/* Top overview */}
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h4 className="text-base font-bold text-white light:text-slate-900">
                  {selectedOrder.productName}
                </h4>
                <p className="text-purple-400 font-semibold">{selectedOrder.planName}</p>
                <p className="text-[11px] text-slate-400">
                  Delivered to: {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black font-mono text-white light:text-slate-900">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
                <span className="block text-[10px] text-emerald-400 font-bold uppercase">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* License Key Reveal */}
            {selectedOrder.credentials?.licenseKey && (
              <div className="space-y-2">
                <label className="font-bold text-white light:text-slate-900 block">
                  Official License Key / Activation Code:
                </label>
                <div className="p-3 rounded-xl bg-slate-950 light:bg-slate-100 border border-purple-500/40 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-400 truncate">
                    {selectedOrder.credentials.licenseKey}
                  </span>
                  <button
                    onClick={() => handleCopyKey(selectedOrder.credentials!.licenseKey!)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                {selectedOrder.credentials.instructions && (
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed bg-slate-900/50 p-3 rounded-xl">
                    {selectedOrder.credentials.instructions}
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <h5 className="font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" /> Fulfillment Timeline
              </h5>
              <OrderTimeline
                timeline={selectedOrder.timeline}
                orderStatus={selectedOrder.orderStatus}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
