import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  Package,
  Search,
  Copy,
  Download,
  Eye,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { OrderTimeline } from '../../components/ui/OrderTimeline';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';

export const ResellerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = user ? db.getResellerOrders(user.id) : [];

  const filteredOrders = orders.filter((o) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard?.writeText(key);
    showToast('success', 'Key Copied', 'License key copied to clipboard.');
  };

  const handleDownloadInvoice = (order: Order) => {
    const text = `SUBNOWA RESELLER FULFILLMENT RECEIPT\nOrder: ${order.orderNumber}\nReseller: ${user?.name}\nClient: ${order.customerName} (${order.customerEmail})\nProduct: ${order.productName} (${order.planName})\nWholesale Cost Deducted: $${order.totalAmount.toFixed(2)}\nDelivered License Key: ${order.deliveryDetails?.licenseKey || 'N/A'}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reseller-Order-${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Receipt Downloaded', `Saved Reseller-Order-${order.orderNumber}.txt`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Reseller Client Orders
          </h1>
          <p className="text-xs text-slate-400">
            Track all license credentials fulfilled on behalf of your customers.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/reseller/place-order')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Client Order
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, email, order #..."
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white light:text-slate-900">No client orders recorded</h4>
            <p className="text-xs text-slate-400">Place an order for your client using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Client Name & Email</th>
                  <th className="p-4">Product & Plan</th>
                  <th className="p-4">Wholesale Cost</th>
                  <th className="p-4">Net Profit</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivered License Key</th>
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
                    <td className="p-4 font-mono text-purple-300 truncate max-w-[150px]">
                      {ord.deliveryDetails?.licenseKey || 'N/A'}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(ord)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Download Receipt"
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

      {/* Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Client Order #${selectedOrder.orderNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-slate-300 light:text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-white light:text-slate-900 text-sm">
                  {selectedOrder.productName}
                </p>
                <p className="text-purple-400">{selectedOrder.planName}</p>
                <p className="text-slate-400 mt-1">Client: {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Net Margin:</span>
                <p className="text-lg font-black font-mono text-emerald-400">
                  +${(selectedOrder.resellerProfit || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {selectedOrder.credentials?.licenseKey && (
              <div className="space-y-1.5">
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
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
