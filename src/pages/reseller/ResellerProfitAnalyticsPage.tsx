import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Award,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const ResellerProfitAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const orders = user ? db.getResellerOrders(user.id) : [];

  const totalWholesale = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.resellerProfit || 0), 0);
  const avgMarginPct = totalWholesale > 0 ? Math.round((totalProfit / totalWholesale) * 100) : 25;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          Reseller Financials & Margin Analytics
        </h1>
        <p className="text-xs text-slate-400">
          Analyze wholesale inventory outlay, client retail gross receipts, and net retained spreads.
        </p>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Lifetime Net Spread Profit</span>
          <p className="text-3xl font-black font-mono text-emerald-400">
            +${totalProfit.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500">Pure retained profit from client sales</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Wholesale Outlay</span>
          <p className="text-3xl font-black font-mono text-white light:text-slate-900">
            ${totalWholesale.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500">Debited from wallet balance</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Average Profit Margin</span>
          <p className="text-3xl font-black font-mono text-purple-400">
            {avgMarginPct}%
          </p>
          <span className="text-[11px] text-emerald-400">● Silver Tier Active</span>
        </div>
      </div>

      {/* Tier Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white light:text-slate-900">
              Partner Tier Level: Silver (25% Discount)
            </h3>
          </div>
          <Badge variant="purple">Next Tier: Gold (35%)</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>$3,450 Volume Fulfilled</span>
            <span>Target: $10,000 Volume</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950 light:bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full" style={{ width: '34.5%' }} />
          </div>
          <p className="text-[11px] text-slate-400">
            You need $6,550 more in wholesale volume to automatically unlock the Gold Tier with 35% margin.
          </p>
        </div>
      </div>

      {/* Product Profit Breakdown */}
      <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-white light:text-slate-900">
          Profit Yield by Subscription Category
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Developer & IDEs (CodePilot, CloudScale)', profit: '$240.00', pct: '45%' },
            { name: 'AI Generation Suites (NeuralCraft)', profit: '$180.00', pct: '30%' },
            { name: 'Security & VPN (QuantumShield)', profit: '$80.00', pct: '15%' },
            { name: 'Cloud Storage & Vaults', profit: '$60.00', pct: '10%' },
          ].map((cat, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 light:bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-semibold text-white light:text-slate-900">{cat.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-mono">{cat.pct} share</span>
                <span className="font-mono font-bold text-emerald-400">{cat.profit} Net</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
