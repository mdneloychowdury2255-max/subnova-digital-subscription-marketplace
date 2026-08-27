import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Eye,
  DollarSign,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Product, Plan } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('cat-ai');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

  // Plans state in form
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'plan-1m',
      name: '1 Month Access',
      billingCycle: 'Monthly',
      retailPrice: 20,
      resellerPrice: 15,
      features: ['Official license key', 'Instant activation', 'Standard support'],
      deliveryMethod: 'Instant Key',
      deliveryTime: 'Instant',
      inStock: true,
    },
  ]);

  const products = db.getProducts();
  const categories = db.getCategories();

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setShortDesc('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setCategoryId(categories[0]?.id || 'cat-ai');
    setIsFeatured(false);
    setIsPopular(false);
    setPlans([
      {
        id: `plan-${Date.now()}-1`,
        name: '1 Month Individual',
        billingCycle: 'Monthly',
        retailPrice: 24.99,
        resellerPrice: 18.0,
        features: ['Instant digital delivery', 'Official activation', 'Full warranty'],
        deliveryMethod: 'Instant Key',
        deliveryTime: 'Instant',
        inStock: true,
      },
    ]);
    setIsEditOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setShortDesc(prod.shortDescription);
    setDescription(prod.description);
    setImage(prod.image);
    setCategoryId(prod.categoryId);
    setIsFeatured(prod.isFeatured);
    setIsPopular(prod.isPopular);
    setPlans(prod.plans);
    setIsEditOpen(true);
  };

  const handleDelete = (prodId: string) => {
    if (confirm('Are you sure you want to delete this subscription product?')) {
      db.deleteProduct(prodId);
      showToast('info', 'Product Deleted', 'Product removed from catalog.');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === categoryId);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      shortDescription: shortDesc,
      description,
      categoryId,
      categoryName: cat?.name || 'General',
      image,
      iconName: 'Sparkles',
      rating: editingProduct ? editingProduct.rating : 4.9,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 48,
      isFeatured,
      isPopular,
      status: 'active',
      refundPolicy: 'Full refund within 7 days if official license key activation fails.',
      faq: [
        {
          question: 'How do I activate this subscription?',
          answer: 'You will receive an official license key immediately after payment. Enter this key on the official provider portal.',
        },
      ],
      plans,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    db.saveProduct(productPayload);
    setIsEditOpen(false);
    showToast(
      'success',
      editingProduct ? 'Product Updated' : 'Product Created',
      `${name} is live in the marketplace.`
    );
  };

  const handleAddPlan = () => {
    setPlans([
      ...plans,
      {
        id: `plan-${Date.now()}-${plans.length + 1}`,
        name: `${plans.length === 1 ? '1 Year Annual' : 'Custom Duration'}`,
        billingCycle: 'Yearly',
        retailPrice: 199.99,
        resellerPrice: 149.99,
        features: ['Priority support', 'Official license key', 'Volume rate'],
        deliveryMethod: 'Instant Key',
        deliveryTime: 'Instant',
        inStock: true,
      },
    ]);
  };

  const handleRemovePlan = (idx: number) => {
    if (plans.length > 1) {
      setPlans(plans.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Subscription Product Management
          </h1>
          <p className="text-xs text-slate-400">
            Create and edit legitimate software subscription products, configure duration plans, retail prices, and wholesale reseller rates.
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Configured Plans</th>
                <th className="p-4">Retail vs Reseller</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4">Flags</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white light:text-slate-900">{prod.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {prod.shortDescription}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-purple-400">
                    {prod.categoryName}
                  </td>
                  <td className="p-4">
                    <Badge variant="neutral">{prod.plans.length} Tier(s)</Badge>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="text-white light:text-slate-900 font-bold">
                      ${prod.plans[0]?.retailPrice.toFixed(2)}
                    </span>{' '}
                    <span className="text-emerald-400">
                      (${prod.plans[0]?.resellerPrice.toFixed(2)} Whl)
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={prod.plans.some((p) => p.inStock) ? 'success' : 'warning'}>
                      {prod.plans.some((p) => p.inStock) ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="p-4 space-x-1">
                    {prod.isFeatured && <Badge variant="purple">Featured</Badge>}
                    {prod.isPopular && <Badge variant="warning">Popular</Badge>}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white"
                      title="Delete Product"
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

      {/* Edit / Create Product Modal */}
      {isEditOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditOpen(false)}
          title={editingProduct ? `Edit ${editingProduct.name}` : 'Create Subscription Product'}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSaveProduct} className="space-y-6 text-xs text-slate-300 light:text-slate-700 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. OpenAI ChatGPT Plus 1-Month"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                  {image && (
                    <img
                      src={image}
                      alt="preview"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-800"
                    />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Short Description
                </label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Official activation code with instant key delivery"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-white light:text-slate-900">
                  Full Description & Activation Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed terms, fulfillment instructions, and warranty terms..."
                  className="w-full p-3 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-xs text-white light:text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Plans Management */}
            <div className="space-y-3 pt-2 border-t border-slate-800 light:border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white light:text-slate-900">
                  Subscription Duration Plans & Pricing
                </h4>
                <button
                  type="button"
                  onClick={handleAddPlan}
                  className="text-xs text-purple-400 hover:underline font-semibold"
                >
                  + Add Duration Plan
                </button>
              </div>

              <div className="space-y-3">
                {plans.map((pl, idx) => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-2xl bg-slate-950 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-400 text-xs">Plan #{idx + 1}</span>
                      {plans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlan(idx)}
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Remove Plan
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Plan Title</label>
                        <input
                          type="text"
                          required
                          value={pl.name}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].name = e.target.value;
                            setPlans(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 light:bg-white border border-slate-800 text-xs text-white light:text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Billing Cycle</label>
                        <input
                          type="text"
                          required
                          value={pl.billingCycle}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].billingCycle = e.target.value;
                            setPlans(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 light:bg-white border border-slate-800 text-xs text-white light:text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Retail Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={pl.retailPrice}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].retailPrice = Number(e.target.value);
                            setPlans(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 light:bg-white border border-slate-800 text-xs font-mono text-white light:text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Reseller Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={pl.resellerPrice}
                          onChange={(e) => {
                            const updated = [...plans];
                            updated[idx].resellerPrice = Number(e.target.value);
                            setPlans(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 light:bg-white border border-slate-800 text-xs font-mono text-emerald-400 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-white light:text-slate-900 font-semibold">Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-white light:text-slate-900 font-semibold">Mark as Popular</span>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold">
              Save Product & Plans
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};
