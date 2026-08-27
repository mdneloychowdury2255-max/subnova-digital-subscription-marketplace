import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, ShoppingBag, Users, Store, ArrowRight, X } from 'lucide-react';
import { db } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { user, role } = useAuth();
  const { navigate } = useNavigation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal if needed
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const products = useMemo(() => db.getProducts(), []);
  const allOrders = useMemo(() => {
    if (role === 'admin') return db.getOrders();
    if (user) return db.getUserOrders(user.id);
    return [];
  }, [user, role]);
  const allUsers = useMemo(() => (role === 'admin' ? db.getUsers() : []), [role]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products.slice(0, 4);
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const filteredOrders = useMemo(() => {
    if (!query.trim() || !user) return [];
    const q = query.toLowerCase();
    return allOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }, [allOrders, query, user]);

  const filteredUsers = useMemo(() => {
    if (!query.trim() || role !== 'admin') return [];
    const q = query.toLowerCase();
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q)
    );
  }, [allUsers, query, role]);

  const handleSelectProduct = (id: string) => {
    navigate(`/products/${id}`);
    onClose();
  };

  const handleSelectOrder = (orderId: string) => {
    if (role === 'admin') {
      navigate('/admin/orders');
    } else if (role === 'reseller') {
      navigate('/reseller/orders');
    } else {
      navigate(`/dashboard/orders/${orderId}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            className="relative w-full max-w-2xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 light:border-slate-200">
              <Search className="w-5 h-5 text-purple-400 shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, orders, license subscriptions, categories..."
                className="w-full bg-transparent text-white light:text-slate-900 placeholder-slate-500 text-base focus:outline-none"
              />
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white light:hover:text-slate-900 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div>
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    Products & Subscriptions
                  </h6>
                  <div className="space-y-1">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-700/50"
                          />
                          <div>
                            <p className="text-sm font-semibold text-white light:text-slate-900 group-hover:text-purple-400 transition-colors">
                              {prod.name}
                            </p>
                            <p className="text-xs text-slate-400 light:text-slate-500">
                              {prod.categoryName} • From ${prod.plans[0]?.retailPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section (for authenticated users) */}
              {filteredOrders.length > 0 && (
                <div>
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    Matching Orders
                  </h6>
                  <div className="space-y-1">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => handleSelectOrder(ord.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white light:text-slate-900">
                            {ord.orderNumber} - {ord.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            ${ord.totalAmount.toFixed(2)} • {ord.orderStatus.toUpperCase()} • {ord.customerName}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users & Resellers (Admin only) */}
              {filteredUsers.length > 0 && (
                <div>
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Customers & Resellers (Admin)
                  </h6>
                  <div className="space-y-1">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          navigate('/admin/customers');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 light:hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-purple-400">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white light:text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950/60 light:bg-slate-100/80 border-t border-slate-800 light:border-slate-200 text-xs text-slate-400 flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 light:bg-slate-200 rounded border border-slate-700 light:border-slate-300 text-[10px] font-mono">ESC</kbd> to exit</span>
              <span className="text-purple-400 font-medium">SubNova Fast Indexer</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
