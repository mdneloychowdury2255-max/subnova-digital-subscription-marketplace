import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Download,
  Filter,
  Users,
  Percent,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = db.getOrders();
  const commissions = db.getCommissions();

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        (o.resellerName && o.resellerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUpdateStatus = (orderId: string, status: 'completed' | 'processing' | 'cancelled' | 'refunded') => {
    const updated = db.updateOrderStatus(orderId, status);
    if (updated) {
      setSelectedOrder(updated);
      showToast('success', 'Order Status Updated', `Order #${updated.orderNumber} set to ${status}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            Global Orders & Commission Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Inspect all customer orders, wholesale reseller checkouts, and 5% profit referral commissions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, reseller..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'completed', 'processing', 'pending', 'refunded', 'cancelled'].map((st) => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer & Buyer Type</th>
                <th className="p-4">Product / Subscription</th>
                <th className="p-4">Customer Price</th>
                <th className="p-4">Reseller Profit Spread</th>
                <th className="p-4">Referral 5% Commission</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
              {filteredOrders.map((ord) => {
                const comm = commissions.find((c) => c.orderId === ord.id);
                return (
                  <tr key={ord.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white light:text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400">
                        {ord.resellerName ? (
                          <span className="text-purple-400 font-semibold">Reseller: {ord.resellerName}</span>
                        ) : (
                          'Direct Retail Customer'
                        )}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white light:text-slate-900">{ord.productName}</p>
                      <p className="text-[11px] text-purple-400">{ord.planName}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-white light:text-slate-900">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 font-mono">
                      {ord.resellerProfit ? (
                        <span className="text-emerald-400 font-bold">+${ord.resellerProfit.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {comm ? (
                        <div>
                          <span className="text-emerald-400 font-bold">+${comm.commissionAmount.toFixed(4)}</span>
                          <span className="block text-[10px] text-purple-300">To: {comm.referrerName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          ord.orderStatus === 'completed'
                            ? 'emerald'
                            : ord.orderStatus === 'processing'
                            ? 'warning'
                            : ord.orderStatus === 'refunded'
                            ? 'rose'
                            : 'neutral'
                        }
                      >
                        {ord.orderStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white"
                        title="Inspect & Override"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Inspect Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Manage Order #${selectedOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-slate-300 light:text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 flex justify-between items-center">
              <div>
                <h4 className="text-base font-bold text-white light:text-slate-900">
                  {selectedOrder.productName} ({selectedOrder.planName})
                </h4>
                <p className="text-slate-400 mt-1">Recipient: {selectedOrder.customerEmail}</p>
                <p className="text-slate-400">Buyer Name: {selectedOrder.customerName}</p>
              </div>
              <span className="font-mono text-xl font-bold text-white light:text-slate-900">
                ${selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Profit & Referral breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold">Payment Method & Status</span>
                <p className="font-bold text-white uppercase mt-0.5">{selectedOrder.paymentMethod}</p>
                <p className="text-emerald-400 font-semibold">{selectedOrder.paymentStatus.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-bold">Wholesale Reseller Profit</span>
                <p className="font-mono text-emerald-400 font-bold text-sm mt-0.5">
                  {selectedOrder.resellerProfit ? `+$${selectedOrder.resellerProfit.toFixed(2)}` : 'N/A (Direct Retail)'}
                </p>
              </div>
            </div>

            {selectedOrder.deliveryDetails && (
              <div className="space-y-1.5">
                <label className="font-bold text-white light:text-slate-900">Assigned License Key:</label>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-emerald-400 font-bold border border-slate-800">
                  {selectedOrder.deliveryDetails.licenseKey || 'No key generated yet'}
                </div>
              </div>
            )}

            {/* Status Overrides */}
            <div className="space-y-2 pt-2 border-t border-slate-800 light:border-slate-200">
              <label className="font-bold text-white light:text-slate-900 block">
                Administrative Override Status (Auto-updates Commissions):
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedOrder.orderStatus === 'completed' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                >
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant={selectedOrder.orderStatus === 'processing' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                >
                  Mark Processing
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'refunded')}
                >
                  Refund & Revert Commission
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
