import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { db } from '../services/api';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Key,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { OrderTimeline } from '../components/ui/OrderTimeline';

export const OrderSuccessPage: React.FC = () => {
  const { searchParams, navigate } = useNavigation();
  const { showToast } = useToast();
  const orderId = searchParams.get('orderId');

  const order = db.getOrderById(orderId || '');
  const [showKey, setShowKey] = useState(true);

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
        <Button onClick={() => navigate('/products')}>Browse Marketplace</Button>
      </div>
    );
  }

  const handleCopyKey = () => {
    if (order.deliveryDetails?.licenseKey) {
      navigator.clipboard?.writeText(order.deliveryDetails.licenseKey);
      showToast('success', 'License Key Copied', 'Copied activation key to clipboard.');
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `================================================
SUBNOWA OFFICIAL INVOICE / RECEIPT
================================================
Invoice No:    INV-${order.orderNumber}
Date:          ${new Date(order.createdAt).toLocaleString()}
Customer:      ${order.customerName} (${order.customerEmail})

Product:       ${order.productName}
Plan:          ${order.planName}
Quantity:      ${order.quantity}
Subtotal:      $${order.subtotal.toFixed(2)}
Discount:      -$${order.discountAmount.toFixed(2)}
TOTAL PAID:    $${order.totalAmount.toFixed(2)}
Payment:       ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})

DELIVERED CREDENTIALS:
License Key:   ${order.deliveryDetails?.licenseKey || 'N/A'}
Activation:    ${order.deliveryDetails?.instructions || 'Instant'}
================================================
Thank you for your business. Legitimately fulfilled by SubNova.`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Invoice Downloaded', `Saved Invoice-${order.orderNumber}.txt`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Celebration Header Card */}
      <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <Badge variant="success">Order #{order.orderNumber} Completed</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-white light:text-slate-900">
          Thank you for your order!
        </h1>
        <p className="text-sm text-slate-300 light:text-slate-600 max-w-md mx-auto">
          Your digital license credentials have been generated and dispatched to{' '}
          <span className="font-semibold text-purple-400">{order.customerEmail}</span>.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Invoice Receipt
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/orders')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View in Dashboard
          </Button>
        </div>
      </div>

      {/* Delivered License Credentials Box */}
      {order.deliveryDetails && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 light:bg-white border border-purple-500/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white light:text-slate-900">
                  Delivered License Credentials
                </h3>
                <p className="text-xs text-slate-400">Ready for instant redemption</p>
              </div>
            </div>

            <Badge variant="purple">Active Official Key</Badge>
          </div>

          {/* Key Copy Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">
              Your License / Activation Key
            </label>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 light:bg-slate-100 border border-slate-800 light:border-slate-300">
              <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 flex-1 truncate px-2">
                {showKey
                  ? order.deliveryDetails.licenseKey
                  : '••••••••••••••••••••••••••••••••••••••••'}
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
            </div>
          </div>

          {/* Instructions */}
          {order.deliveryDetails.instructions && (
            <div className="p-4 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                How to Activate Your Subscription
              </h4>
              <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed whitespace-pre-line">
                {order.deliveryDetails.instructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Order Tracking Timeline & Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-6">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Fulfillment Lifecycle Timeline
          </h3>
          <OrderTimeline timeline={order.timeline} orderStatus={order.orderStatus} />
        </div>

        <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900">
            Order Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Item:</span>
              <span className="font-semibold text-white light:text-slate-900">{order.productName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Plan:</span>
              <span className="font-semibold text-white light:text-slate-900">{order.planName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Mode:</span>
              <span className="font-mono text-purple-400 uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Status:</span>
              <span className="text-emerald-400 font-bold uppercase">{order.paymentStatus}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 light:border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-white light:text-slate-900">Amount Paid:</span>
              <span className="text-xl font-mono font-black text-white light:text-slate-900">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
