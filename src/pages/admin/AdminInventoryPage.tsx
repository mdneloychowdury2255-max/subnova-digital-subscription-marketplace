import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Key,
  Plus,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const AdminInventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const products = db.getProducts();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedPlanId, setSelectedPlanId] = useState(selectedProduct?.plans[0]?.id || '');
  const [rawKeys, setRawKeys] = useState('');

  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawKeys.trim()) return;

    const keysArray = rawKeys
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keysArray.length === 0) return;

    db.addInventoryKeys(selectedProductId, selectedPlanId, keysArray);
    setIsImportOpen(false);
    setRawKeys('');
    showToast('success', 'Keys Stocked', `Successfully loaded ${keysArray.length} digital activation keys into pool.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-purple-400" />
            Digital Inventory & Key Pools
          </h1>
          <p className="text-xs text-slate-400">
            Pre-load verified official license keys and activation credentials for zero-latency order fulfillment.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsImportOpen(true)}
          leftIcon={<Upload className="w-4 h-4" />}
        >
          Batch Stock Keys
        </Button>
      </div>

      {/* Inventory Pool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white light:text-slate-900">{prod.name}</h3>
                <p className="text-xs text-purple-400">{prod.categoryName}</p>
              </div>
              <Badge variant={prod.plans.some((p) => p.inStock) ? 'success' : 'warning'}>
                {prod.plans.some((p) => p.inStock) ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-400">Plan Pools:</span>
              <div className="space-y-1.5">
                {prod.plans.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 light:bg-slate-50 flex items-center justify-between font-mono"
                  >
                    <span className="text-slate-300 light:text-slate-700">{pl.name}</span>
                    <span className={`font-bold ${pl.inStock ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {pl.inStock ? 'Available' : 'Depleted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedProductId(prod.id);
                setSelectedPlanId(prod.plans[0]?.id || '');
                setIsImportOpen(true);
              }}
              className="w-full text-xs"
            >
              + Stock More Keys
            </Button>
          </div>
        ))}
      </div>

      {/* Batch Key Import Modal */}
      {isImportOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsImportOpen(false)}
          title="Batch Load License Keys"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleBatchImport} className="space-y-4 text-xs text-slate-300 light:text-slate-700">
            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                Target Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = products.find((p) => p.id === e.target.value);
                  if (prod && prod.plans[0]) setSelectedPlanId(prod.plans[0].id);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                Target Duration Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 focus:outline-none"
              >
                {selectedProduct?.plans.map((pl) => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white light:text-slate-900">
                License Keys (1 per line)
              </label>
              <textarea
                rows={6}
                required
                value={rawKeys}
                onChange={(e) => setRawKeys(e.target.value)}
                placeholder="SN-CODE-8941-XYZ&#10;SN-CODE-8942-XYZ&#10;SN-CODE-8943-XYZ"
                className="w-full p-3 font-mono rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-emerald-400 focus:outline-none"
              />
            </div>

            <Button type="submit" size="md" className="w-full font-bold">
              Import Keys Into Inventory
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
