import React, { useState, useMemo } from 'react';
import { db } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import { User, UserRole } from '../../types';
import { Users, Search, UserCheck, UserX, Wallet, DollarSign, Phone, Mail, ShoppingBag, Eye } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();
  const { navigate } = useNavigation();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customersData, setCustomersData] = useState(() => db.getCustomersDetailed());

  // Balance adjustment modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('50');
  const [adjustReason, setAdjustReason] = useState<string>('Promotional Credit Bonus');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  const refreshList = () => {
    setCustomersData(db.getCustomersDetailed());
  };

  const filtered = useMemo(() => {
    return customersData.filter((item) => {
      const u = item.user;
      const q = search.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [customersData, search, roleFilter, statusFilter]);

  const handleToggleStatus = (u: User) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    u.status = newStatus;
    db.updateUser(u);
    refreshList();
    showToast('info', 'Customer Status Changed', `${u.name} is now ${newStatus.toUpperCase()}`);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid numeric amount in USD.');
      return;
    }

    const delta = adjustType === 'add' ? amount : -amount;
    db.adjustUserBalance(selectedUser.id, delta, adjustReason || 'Admin Manual Balance Adjustment', 'adjustment');
    showToast('success', 'Wallet Adjusted', `${adjustType === 'add' ? 'Added' : 'Deducted'} $${amount.toFixed(2)} for ${selectedUser.name}.`);
    setSelectedUser(null);
    refreshList();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 light:text-purple-600 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Customer & Reseller Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
            View customer directories, purchase history, order volumes, and adjust loyalty balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs font-semibold text-slate-300 light:text-slate-700">
            Total Accounts: <strong className="text-purple-400">{customersData.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="admin-search-customers-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-100 light:text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-200 light:text-slate-800 text-xs"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer Only</option>
            <option value="reseller">Reseller Partner</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 text-slate-200 light:text-slate-800 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 light:border-slate-200 text-xs font-semibold uppercase text-slate-400 bg-slate-950/40 light:bg-slate-50">
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-right">Wallet Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
              {filtered.map((item) => {
                const u = item.user;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/20 light:hover:bg-slate-50 transition-colors">
                    {/* Customer info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-200 light:text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                            {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'reseller'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 light:bg-slate-100 text-xs font-mono font-semibold text-slate-300 light:text-slate-700">
                        <ShoppingBag className="w-3 h-3 text-purple-400" />
                        {item.totalOrders}
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-200 light:text-slate-900">
                        {currency === 'BDT' ? `৳${item.totalSpentBDT.toLocaleString()}` : `$${item.totalSpentUSD.toFixed(2)}`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        ${item.totalSpentUSD.toFixed(2)} USD
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-emerald-400 light:text-emerald-600">
                        {formatPrice(u.walletBalance)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        ${u.walletBalance.toFixed(2)} USD
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Adjust Balance"
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <Wallet className="w-4 h-4" />
                        </button>
                        <button
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          title="View Orders"
                          onClick={() => navigate('/admin/orders')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-slate-100 light:text-slate-900">
                  Adjust Wallet Balance
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 text-xs">
              <div>Customer: <strong className="text-slate-200 light:text-slate-800">{selectedUser.name}</strong> ({selectedUser.email})</div>
              <div>Current Balance: <strong className="text-emerald-400 font-mono">${selectedUser.walletBalance.toFixed(2)} USD</strong></div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  + Add Credit (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('subtract')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    adjustType === 'subtract'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  - Deduct (Debit)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-1">
                  Amount in USD ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 text-slate-100 light:text-slate-900 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Deposit manual top-up, compensation credit"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 text-slate-100 light:text-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
