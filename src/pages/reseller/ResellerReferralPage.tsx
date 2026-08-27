import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Share2,
  Copy,
  Gift,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Calculator,
  Percent,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ResellerReferralPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const settings = db.getSettings();
  const commissionRate = settings.referralCommissionRate || 5;

  const referralCode = user?.referralCode || 'PARTNER';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const referrals = user ? db.getUserReferrals(user.id) : [];
  const commissions = user ? db.getUserCommissions(user.id) : [];

  const totalCommissionsEarned = commissions
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const [activeTab, setActiveTab] = useState<'commissions' | 'referrals' | 'calculator'>('commissions');

  // Interactive Live Calculator
  const [calcCustomerPrice, setCalcCustomerPrice] = useState(25.0);
  const [calcResellerPrice, setCalcResellerPrice] = useState(18.0);
  const calcProfit = Math.max(0, calcCustomerPrice - calcResellerPrice);
  const calcCommission = Number(((calcProfit * commissionRate) / 100).toFixed(4));

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    showToast('success', 'Referral Link Copied!', 'Share this link to earn 5% profit commission on all customer orders.');
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    showToast('success', 'Referral Code Copied!', `Code: ${referralCode}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-purple-400" />
          Referral & Commission Ecosystem
        </h1>
        <p className="text-xs text-slate-400">
          Earn <strong className="text-emerald-400 font-bold">{commissionRate}% commission on the actual profit</strong> of every subscription order placed by your referred users.
        </p>
      </div>

      {/* Referral Link & Code Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4" /> Your Unique Partner Referral Link
          </span>
          <Badge variant="purple">{commissionRate}% Profit Commission</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-purple-300 focus:outline-none"
            />
            <Button
              size="md"
              onClick={handleCopyLink}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copy Link
            </Button>
          </div>

          <div className="sm:col-span-4 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Referral Code</div>
              <div className="font-mono font-black text-amber-400 text-sm">{referralCode}</div>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all"
            >
              Copy Code
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct instant wallet commission credit
          </span>
          <span className="flex items-center gap-1 text-purple-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Transparent calculation on (Retail - Reseller Cost)
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <span className="text-xs font-semibold text-slate-400">Referred Users</span>
          <p className="text-2xl font-black font-mono text-white light:text-slate-900 mt-1">
            {referrals.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <span className="text-xs font-semibold text-slate-400">Total Commissions</span>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
            +${totalCommissionsEarned.toFixed(4)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <span className="text-xs font-semibold text-slate-400">Available Balance</span>
          <p className="text-2xl font-black font-mono text-purple-400 mt-1">
            ${(user?.commissionBalance || 0).toFixed(4)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200">
          <span className="text-xs font-semibold text-slate-400">Commission Rate</span>
          <p className="text-2xl font-black font-mono text-indigo-400 mt-1">
            {commissionRate}% of Profit
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('commissions')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'commissions'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Commission History ({commissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'referrals'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Referred Network ({referrals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'calculator'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Commission Simulator</span>
          </button>
        </div>

        {/* TAB 1: COMMISSIONS */}
        {activeTab === 'commissions' && (
          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {commissions.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">
                No commissions generated yet. Share your referral link to begin earning!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4">Order # & Product</th>
                      <th className="p-4">Referred Buyer</th>
                      <th className="p-4">Customer Price</th>
                      <th className="p-4">Reseller Cost</th>
                      <th className="p-4">Actual Profit</th>
                      <th className="p-4">Commission ({commissionRate}%)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="p-4">
                          <p className="font-mono text-purple-400 font-bold">{c.orderNumber}</p>
                          <p className="text-[11px] text-white font-medium">{c.productName}</p>
                        </td>
                        <td className="p-4 font-semibold text-white">
                          {c.referredUserName}
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          ${c.customerPrice.toFixed(2)}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          ${c.resellerPrice.toFixed(2)}
                        </td>
                        <td className="p-4 font-mono font-bold text-amber-400">
                          ${c.profitAmount.toFixed(2)}
                        </td>
                        <td className="p-4 font-mono font-black text-emerald-400">
                          +${c.commissionAmount.toFixed(4)} USD
                        </td>
                        <td className="p-4">
                          <Badge variant={c.status === 'approved' ? 'emerald' : c.status === 'pending' ? 'warning' : 'rose'}>
                            {c.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REFERRED NETWORK */}
        {activeTab === 'referrals' && (
          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {referrals.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No users registered with your code yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Total Orders</th>
                      <th className="p-4">Sales Volume</th>
                      <th className="p-4">Profit Generated</th>
                      <th className="p-4">Commissions Earned</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-white">{ref.referredUserName}</td>
                        <td className="p-4 font-mono text-slate-400">{ref.referredUserEmail}</td>
                        <td className="p-4 font-mono text-purple-400 font-bold">{ref.totalOrdersCount || 0}</td>
                        <td className="p-4 font-mono text-white">${(ref.totalSalesVolumeUSD || 0).toFixed(2)}</td>
                        <td className="p-4 font-mono text-amber-400">${(ref.totalProfitGeneratedUSD || 0).toFixed(2)}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          +${(ref.totalCommissionEarnedUSD || 0).toFixed(4)}
                        </td>
                        <td className="p-4 text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 max-w-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-purple-400" />
                Referral Commission Formula Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Commissions are calculated as: <code>(Retail Price - Reseller Wholesale Cost) × {commissionRate}%</code>
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Customer Purchase Price ($ USD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcCustomerPrice}
                  onChange={(e) => setCalcCustomerPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">Reseller Wholesale Price ($ USD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcResellerPrice}
                  onChange={(e) => setCalcResellerPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Actual Net Profit Spread:</span>
                  <span className="font-mono text-white font-bold">${calcProfit.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Your Referral Commission Rate:</span>
                  <span className="font-mono text-purple-400 font-bold">{commissionRate}%</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Your Direct Earnings:</span>
                  <span className="font-mono font-black text-lg text-emerald-400">
                    +${calcCommission.toFixed(4)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
