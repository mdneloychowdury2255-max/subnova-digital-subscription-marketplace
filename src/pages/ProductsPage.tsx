import React, { useState, useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Zap,
  ArrowRight,
  SlidersHorizontal,
  Package,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export const ProductsPage: React.FC = () => {
  const { navigate, searchParams } = useNavigation();
  const { role } = useAuth();
  const initialCategory = searchParams.get('cat') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-low' | 'price-high' | 'newest'>('popularity');
  const [maxPrice, setMaxPrice] = useState<number>(300);

  const categories = db.getCategories();
  const products = db.getProducts();

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.status !== 'active') return false;
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.shortDescription.toLowerCase().includes(q);
          const matchesCat = p.categoryName?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }
        const minPlanPrice = Math.min(...p.plans.map((pl) => (role === 'reseller' ? pl.resellerPrice : pl.retailPrice)));
        if (minPlanPrice > maxPrice) return false;
        return true;
      })
      .sort((a, b) => {
        const getPrice = (prod: typeof a) =>
          Math.min(...prod.plans.map((pl) => (role === 'reseller' ? pl.resellerPrice : pl.retailPrice)));

        if (sortBy === 'price-low') return getPrice(a) - getPrice(b);
        if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.rating * b.reviewsCount - a.rating * a.reviewsCount; // popularity
      });
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice, role]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <Badge variant="purple">Verified Digital Catalog</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white light:text-slate-900">
            Subscription Marketplace
          </h1>
          <p className="text-sm text-slate-300 light:text-slate-600">
            Explore authentic digital subscriptions with instant activation.
            {role === 'reseller' && (
              <span className="text-emerald-400 font-semibold block mt-1">
                ⭐ Reseller wholesale pricing is actively enabled for your account.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, feature, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-sm text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Controls: Sort & Max Price */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-400">Max:</span>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-purple-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-purple-400">${maxPrice}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="bg-transparent text-white light:text-slate-900 font-medium focus:outline-none cursor-pointer"
              >
                <option value="popularity" className="bg-slate-900">Most Popular</option>
                <option value="price-low" className="bg-slate-900">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900">Price: High to Low</option>
                <option value="newest" className="bg-slate-900">Newest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 text-slate-300 light:text-slate-700 hover:border-slate-700'
            }`}
          >
            All Categories ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 text-slate-300 light:text-slate-700 hover:border-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-slate-800 p-8 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white light:text-slate-900">No products matched your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, increasing your price range, or selecting a different category.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setMaxPrice(300);
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const firstPlan = prod.plans[0];
            const isReseller = role === 'reseller';
            const displayPrice = isReseller ? firstPlan.resellerPrice : firstPlan.retailPrice;

            return (
              <div
                key={prod.id}
                className="group rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 p-5 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
              >
                <div className="space-y-4">
                  {/* Image */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {prod.badge && <Badge variant="purple">{prod.badge}</Badge>}
                      {isReseller && (
                        <Badge variant="success">Wholesale Rate</Badge>
                      )}
                    </div>
                  </div>

                  {/* Category & Title */}
                  <div>
                    <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                      {prod.categoryName}
                    </span>
                    <h3 className="text-lg font-bold text-white light:text-slate-900 group-hover:text-purple-400 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 light:text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>
                  </div>

                  {/* Delivery & Plans count */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 light:border-slate-100">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {firstPlan.deliveryTime}
                    </span>
                    <span className="font-medium text-slate-300 light:text-slate-600">
                      {prod.plans.length} Plans Available
                    </span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 light:border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {isReseller ? 'Wholesale from' : 'From'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black font-mono text-white light:text-slate-900">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {!isReseller && firstPlan.originalPrice && (
                        <span className="text-xs line-through text-slate-500">
                          ${firstPlan.originalPrice.toFixed(2)}
                        </span>
                      )}
                      {isReseller && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          (Save ${(firstPlan.retailPrice - firstPlan.resellerPrice).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate(`/products/${prod.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Plans
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
