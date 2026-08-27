import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Tag, Plus, Trash2, CheckCircle2, Percent, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrder, setMinOrder] = useState<number>(10);
  const [maxUses, setMaxUses] = useState<number>(500);

  const coupons = db.getCoupons();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    db.createCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrder,
      maxUses,
      expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    });

    setIsCreateOpen(false);
    setCode('');
    showToast('success', 'Coupon Created', `Coupon code ${code.toUpperCase()} is active.`);
  };

  const handleDelete = (id: string) => {
    db.deleteCoupon(id);
    showToast('info', 'Coupon Removed', 'Coupon deactivated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-400" />
            Promo Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-400">
            Create promotional discount codes for checkout promotions and campaign tracking.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Promo Code
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
              <tr>
                <th className="p-4">Promo Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Uses Count</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-purple-400 text-sm">
                    {c.code}
                  </td>
                  <td className="p-4 font-bold text-white light:text-slate-900">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                  </td>
                  <td className="p-4 font-mono">${c.minOrderAmount.toFixed(2)}</td>
                  <td className="p-4 font-mono">{c.usageCount} / {c.usageLimit}</td>
                  <td className="p-4 text-slate-400">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Badge variant={c.isActive ? 'success' : 'neutral'}>
                      {c.isActive ? 'Active' : 'Expired'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Promo Coupon"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs text-slate-300 light:text-slate-700">
            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                Promo Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LAUNCH30"
                className="w-full uppercase font-mono px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-purple-400 font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Value ({discountType === 'percentage' ? '%' : '$'})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Min Order ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Max Redemptions
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900"
                />
              </div>
            </div>

            <Button type="submit" size="md" className="w-full font-bold">
              Activate Promo Code
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
