import React, { useState, useMemo } from 'react';
import { db } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';
import { CreditCard, CheckCircle2, XCircle, Clock, Search, ExternalLink, Copy, Check, ShieldCheck, AlertCircle, Eye } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [statusFilter, setStatusFilter] = useState<string>('payment_review');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  // Screenshot modal
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; orderNumber: string; trxId?: string } | null>(null);

  // Reject modal
  const [rejectOrderModal, setRejectOrderModal] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Transaction ID not found in receiving statement');

  const refreshOrders = () => {
    setOrders(db.getOrders());
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrx(id);
    showToast('info', 'Copied', text);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const handleApprove = (orderId: string) => {
    const res = db.approveOrderPayment(orderId, 'Verified in account statement');
    if (res.success && res.order) {
      showToast('success', 'Payment Approved & Fulfilled', `Order ${res.order.orderNumber} is now marked COMPLETED and access keys generated.`);
      refreshOrders();
    } else {
      showToast('error', 'Action Failed', res.error || 'Could not approve payment.');
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectOrderModal) return;
    const res = db.rejectOrderPayment(rejectOrderModal.id, rejectReason);
    if (res.success && res.order) {
      showToast('info', 'Payment Rejected', `Order ${res.order.orderNumber} payment marked rejected.`);
      setRejectOrderModal(null);
      refreshOrders();
    } else {
      showToast('error', 'Action Failed', res.error || 'Could not reject payment.');
    }
  };

  // Filtered list
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.paymentDetails?.transactionId && o.paymentDetails.transactionId.toLowerCase().includes(q)) ||
        (o.paymentDetails?.senderNumber && o.paymentDetails.senderNumber.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'payment_review'
          ? o.orderStatus === 'payment_review' || o.paymentStatus === 'pending'
          : statusFilter === 'paid'
          ? o.paymentStatus === 'paid'
          : statusFilter === 'failed'
          ? o.paymentStatus === 'failed'
          : true;

      const matchMethod = methodFilter === 'all' || o.paymentMethod === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [orders, search, statusFilter, methodFilter]);

  const pendingReviewCount = orders.filter((o) => o.orderStatus === 'payment_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 light:text-purple-600 border border-purple-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Payment Review & Verification Queue
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
            Verify manual bKash, Nagad, USDT BEP20, and Binance Pay transaction IDs before fulfilling digital licenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            Pending Review: <strong>{pendingReviewCount} Orders</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="admin-search-payments-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, transaction ID, sender phone number, customer email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-200 light:text-slate-800 text-xs"
          >
            <option value="payment_review">⚠️ Pending Review Only ({pendingReviewCount})</option>
            <option value="all">All Payments ({orders.length})</option>
            <option value="paid">Approved / Paid</option>
            <option value="failed">Rejected / Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-200 light:text-slate-800 text-xs"
          >
            <option value="all">All Gateways</option>
            <option value="bkash">bKash (MFS)</option>
            <option value="nagad">Nagad (MFS)</option>
            <option value="crypto_usdt">USDT BEP20 (Crypto)</option>
            <option value="binance_pay">Binance Pay UID</option>
            <option value="wallet">Internal Wallet Balance</option>
            <option value="stripe">Card / Stripe</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 light:border-slate-200 text-xs font-semibold uppercase text-slate-400 bg-slate-950/40 light:bg-slate-50">
                <th className="py-3.5 px-4">Order / Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Proof / TrxID</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records matching the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const pDet = order.paymentDetails;
                  const isPending = order.orderStatus === 'payment_review';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-800/20 light:hover:bg-slate-50 transition-colors ${
                        isPending ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Order info */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-200 light:text-slate-900 flex items-center gap-1.5">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 light:text-slate-800">{order.customerName}</div>
                        <div className="text-xs text-slate-400">{order.customerEmail}</div>
                      </td>

                      {/* Gateway */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 light:bg-slate-100 text-xs font-medium text-slate-200 light:text-slate-800 border border-slate-700/60">
                          {order.paymentMethod === 'bkash' && <span className="text-pink-400 font-bold">bKash</span>}
                          {order.paymentMethod === 'nagad' && <span className="text-orange-400 font-bold">Nagad</span>}
                          {order.paymentMethod === 'crypto_usdt' && <span className="text-emerald-400 font-bold">USDT (BEP20)</span>}
                          {order.paymentMethod === 'binance_pay' && <span className="text-amber-400 font-bold">Binance Pay</span>}
                          {order.paymentMethod === 'wallet' && <span className="text-cyan-400 font-bold">Wallet</span>}
                          {order.paymentMethod === 'stripe' && <span className="text-indigo-400 font-bold">Card</span>}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-200 light:text-slate-900">
                          {order.currency === 'BDT' || order.totalAmountInBDT ? (
                            <span className="text-pink-400 light:text-pink-600">৳{order.totalAmountInBDT?.toLocaleString() || Math.round(order.totalAmount * 120).toLocaleString()}</span>
                          ) : (
                            <span className="text-cyan-400 light:text-cyan-600">${order.totalAmount.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ${(order.totalAmountInUSD || order.totalAmount).toFixed(2)} USD
                        </div>
                      </td>

                      {/* Proof / TrxID */}
                      <td className="py-3.5 px-4">
                        {pDet ? (
                          <div className="space-y-1 text-xs">
                            {pDet.transactionId && (
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-slate-400">TrxID:</span>
                                <strong className="text-purple-300 light:text-purple-700 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                  {pDet.transactionId}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(pDet.transactionId!, order.id)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedTrx === order.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            )}

                            {pDet.senderNumber && (
                              <div className="text-[11px] text-slate-400">
                                Sender: <span className="font-mono text-slate-200">{pDet.senderNumber}</span>
                              </div>
                            )}

                            {pDet.screenshotUrl && (
                              <button
                                type="button"
                                onClick={() => setSelectedScreenshot({ url: pDet.screenshotUrl!, orderNumber: order.orderNumber, trxId: pDet.transactionId })}
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                              >
                                <Eye className="w-3 h-3" /> View Screenshot Proof
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Automated / Instant</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-spin" /> Needs Verification
                          </span>
                        ) : order.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Verified & Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              id={`admin-approve-payment-${order.id}`}
                              onClick={() => handleApprove(order.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              id={`admin-reject-payment-${order.id}`}
                              onClick={() => setRejectOrderModal(order)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-100">
                  Payment Screenshot Proof — {selectedScreenshot.orderNumber}
                </h3>
                {selectedScreenshot.trxId && (
                  <p className="text-xs text-slate-400 font-mono">TrxID: {selectedScreenshot.trxId}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl bg-slate-950 p-2 flex items-center justify-center">
              <img
                src={selectedScreenshot.url}
                alt="Payment proof screenshot"
                className="max-w-full h-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 light:border-slate-200 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-slate-100 light:text-slate-900">
                Reject Payment for {rejectOrderModal.orderNumber}
              </h3>
            </div>

            <p className="text-xs text-slate-400 light:text-slate-600">
              The order will be transitioned to <strong>Payment Rejected</strong> and the customer will receive an alert explaining the reason.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 light:text-slate-700 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 text-slate-100 light:text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectOrderModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
