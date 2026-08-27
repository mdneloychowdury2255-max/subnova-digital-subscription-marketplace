import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  Search,
  Zap,
  ArrowRight,
  TrendingUp,
  Package,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ResellerActivationModal } from '../../components/reseller/ResellerActivationModal';

export const ResellerWholesaleProducts: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  const isAccountActive = user?.resellerStatus === 'active';
  const settings = db.getSettings();
  const activationFeeBDT = settings.resellerActivationFeeBDT || 300;

  const products = db.getProducts();
  const categories = db.getCategories();

  const handleOrderClick = (url: string) => {
    if (!isAccountActive) {
      showToast(
        'error',
        'অ্যাকাউন্ট অ্যাক্টিভ করুন',
        `রিসেলার অ্যাকাউন্ট অ্যাক্টিভ না থাকলে কোনো অর্ডার করা যাবে না। দয়া করে ৳${activationFeeBDT} ফি দিয়ে অ্যাকাউন্ট অ্যাক্টিভ করুন।`
      );
      setIsActivationModalOpen(true);
      return;
    }
    navigate(url);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-400" />
            Wholesale Digital Catalog
          </h1>
          <p className="text-xs text-slate-400">
            Tier-discounted pricing for B2B partner accounts. All orders automatically deduct from your reseller wallet.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/reseller/place-order')}
          leftIcon={<Zap className="w-4 h-4" />}
        >
          Quick Order Form
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
            placeholder="Search wholesale products..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-slate-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Wholesale Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const firstPlan = prod.plans[0];
          const profit = Number((firstPlan.retailPrice - firstPlan.resellerPrice).toFixed(2));
          const marginPct = Math.round((profit / firstPlan.retailPrice) * 100);

          return (
            <div
              key={prod.id}
              className="rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all"
            >
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-950">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge variant="purple">{marginPct}% Margin</Badge>
                    <Badge variant="success">In Stock</Badge>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">
                    {prod.categoryName}
                  </span>
                  <h3 className="text-base font-bold text-white light:text-slate-900">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {prod.shortDescription}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Client Invoiced Price:</span>
                  <span className="font-mono text-white light:text-slate-900 font-semibold">
                    ${firstPlan.retailPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Your Wholesale Cost:</span>
                  <span className="font-mono text-purple-400 font-bold">
                    ${firstPlan.resellerPrice.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 light:border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Net Spread:
                  </span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    +${profit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleOrderClick(`/reseller/place-order?productId=${prod.id}&planId=${firstPlan.id}`)
                  }
                  className="w-full"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {isAccountActive ? 'Order for Client' : '🔒 অর্ডার করতে অ্যাকাউন্ট অ্যাক্টিভ করুন'}
                </Button>
              </div>
            </div>
          );
        })}
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
