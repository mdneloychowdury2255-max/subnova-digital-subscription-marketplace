import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/api';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Store,
  Share2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { params, navigate } = useNavigation();
  const { role } = useAuth();
  const { showToast } = useToast();

  const product = db.getProductById(params.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    product?.plans[0]?.id || ''
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-slate-400">The subscription or product you are looking for does not exist.</p>
        <Button onClick={() => navigate('/products')}>Browse Marketplace</Button>
      </div>
    );
  }

  const selectedPlan =
    product.plans.find((p) => p.id === selectedPlanId) || product.plans[0];

  const isReseller = role === 'reseller';
  const effectivePrice = isReseller
    ? selectedPlan.resellerPrice
    : selectedPlan.retailPrice;

  const resellerProfit = Number(
    (selectedPlan.retailPrice - selectedPlan.resellerPrice).toFixed(2)
  );

  const handleBuyNow = () => {
    navigate(`/checkout?productId=${product.id}&planId=${selectedPlan.id}`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('success', 'Link Copied', 'Product link copied to clipboard.');
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/products')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      {/* Main Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 shadow-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {product.badge && <Badge variant="purple">{product.badge}</Badge>}
              <Badge variant="neutral">{product.categoryName}</Badge>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white light:text-slate-900">
              {product.name}
            </h1>
            <p className="text-sm text-slate-300 light:text-slate-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900/40 light:bg-white border border-slate-800/80 light:border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Included Plan Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedPlan.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 light:text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements & Refund Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/30 light:bg-white border border-slate-800/80 light:border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Requirements</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 light:text-slate-600">
                {product.requirements?.map((req, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {req}
                  </li>
                )) || <li>Compatible with all modern web browsers.</li>}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 light:bg-emerald-50/50 border border-emerald-500/30 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 100% Genuine Guarantee
              </h4>
              <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                {product.refundPolicy}
              </p>
            </div>
          </div>

          {/* FAQ Accordion */}
          {product.faq && product.faq.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {product.faq.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white light:text-slate-900"
                    >
                      <span>{f.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-purple-400 transition-transform ${
                          openFaq === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-xs text-slate-400 light:text-slate-600 border-t border-slate-800/40 light:border-slate-100 pt-2">
                        {f.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Plan Selection & Checkout Box */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                Select Your Plan
              </span>
              <h3 className="text-xl font-bold text-white light:text-slate-900 mt-1">
                Pricing & Durations
              </h3>
            </div>

            {/* Plan Selector Radio List */}
            <div className="space-y-3">
              {product.plans.map((pl) => {
                const isSelected = pl.id === selectedPlan.id;
                const plPrice = isReseller ? pl.resellerPrice : pl.retailPrice;

                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlanId(pl.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 light:bg-purple-50 light:border-purple-600 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 light:bg-slate-50 light:border-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white light:text-slate-900">
                            {pl.name}
                          </span>
                          {pl.isPopular && <Badge variant="purple">Popular</Badge>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {pl.deliveryMethod} • {pl.deliveryTime}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-white light:text-slate-900">
                          ${plPrice.toFixed(2)}
                        </span>
                        {pl.originalPrice && !isReseller && (
                          <span className="block text-[11px] line-through text-slate-500 font-mono">
                            ${pl.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reseller Profit Callout if logged in as Reseller */}
            {isReseller && (
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-purple-400" /> Reseller Profit Margin:
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +${resellerProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Client Retail Price: ${selectedPlan.retailPrice.toFixed(2)}</span>
                  <span>Wholesale Cost: ${selectedPlan.resellerPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Delivery Specifications */}
            <div className="space-y-2 text-xs text-slate-400 bg-slate-950/50 light:bg-slate-50 p-4 rounded-2xl border border-slate-800/80 light:border-slate-200">
              <div className="flex justify-between">
                <span>Fulfillment Method:</span>
                <span className="font-semibold text-white light:text-slate-800">
                  {selectedPlan.deliveryMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {selectedPlan.deliveryTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stock Status:</span>
                <span className="font-semibold text-emerald-400">● In Stock & Ready</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="w-full text-sm font-bold py-4"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isReseller ? 'Purchase at Wholesale Rate' : 'Proceed to Checkout'}
              </Button>

              <button
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl border border-slate-800 light:border-slate-200 text-xs font-semibold text-slate-400 hover:text-white light:hover:text-slate-800 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
