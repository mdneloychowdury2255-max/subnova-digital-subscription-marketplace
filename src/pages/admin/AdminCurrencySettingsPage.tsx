import React, { useState } from 'react';
import { db } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { DollarSign, RefreshCw, Save, ArrowRightLeft, TrendingUp, ShieldCheck, CheckCircle2, Calculator } from 'lucide-react';

export const AdminCurrencySettingsPage: React.FC = () => {
  const { exchangeRate, refreshRate, formatBDT, formatUSD } = useCurrency();
  const { showToast } = useToast();

  const [rateInput, setRateInput] = useState<string>(exchangeRate.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [simUsd, setSimUsd] = useState<number>(25);
  const [simBdt, setSimBdt] = useState<number>(3000);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(rateInput);
    if (isNaN(num) || num <= 0) {
      showToast('error', 'Invalid Exchange Rate', 'Please enter a positive numeric value for the USD rate.');
      return;
    }

    setIsSaving(true);
    try {
      db.updateExchangeRate(num);
      refreshRate();
      showToast('success', 'Exchange Rate Updated', `1 USD is now set to ৳${num.toFixed(2)} BDT across the website.`);
    } catch {
      showToast('error', 'Update Failed', 'Could not save currency settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleTiers = [
    { usd: 5, label: 'Starter / Weekly' },
    { usd: 15, label: 'Standard Monthly' },
    { usd: 24.99, label: 'Pro AI Studio' },
    { usd: 39.99, label: 'VPN Annual' },
    { usd: 99.00, label: 'Developer Suite' },
    { usd: 159.00, label: 'Enterprise Annual' },
  ];

  const currentRateNum = parseFloat(rateInput) || exchangeRate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 light:text-emerald-600 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Currency & Exchange Rate Settings
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
            Control the global USD to BDT conversion rate and website pricing rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-200 text-xs font-medium text-slate-300 light:text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Rate: <strong className="text-emerald-400 light:text-emerald-600 font-mono">1 USD = ৳{exchangeRate} BDT</strong>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rate Config Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100 light:text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              USD Exchange Rate (BDT)
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-600 mb-6">
              When a customer switches the currency to ৳ BDT, all catalog prices, cart totals, and checkout charges convert using this multiplier.
            </p>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                  Exchange Rate Value (1 USD in BDT)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-sm">
                      ৳
                    </span>
                    <input
                      id="admin-usd-exchange-rate-input"
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      placeholder="120.00"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    id="admin-save-exchange-rate-btn"
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Exchange Rate</span>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Formula: Total BDT = Total USD × Rate</span>
                  <span>Currently: $1.00 = ৳{currentRateNum.toFixed(2)}</span>
                </div>
              </div>

              {/* Preset quick buttons */}
              <div>
                <span className="block text-xs font-medium text-slate-400 light:text-slate-600 mb-2">
                  Quick Benchmark Rates:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[115, 118, 120, 122, 125, 128].map((rateVal) => (
                    <button
                      key={rateVal}
                      type="button"
                      onClick={() => setRateInput(rateVal.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        parseFloat(rateInput) === rateVal
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 light:text-purple-700'
                          : 'bg-slate-950/40 light:bg-slate-100 border-slate-800 light:border-slate-200 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1 USD = ৳{rateVal}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Pricing Preview Table */}
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-100 light:text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Live Pricing Preview Across Subscription Tiers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 light:border-slate-200 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Tier / Product Example</th>
                    <th className="pb-3 text-right">USD Price ($)</th>
                    <th className="pb-3 text-right">BDT Calculated (৳)</th>
                    <th className="pb-3 text-right">Display Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200">
                  {sampleTiers.map((tier) => {
                    const bdt = tier.usd * currentRateNum;
                    return (
                      <tr key={tier.usd} className="hover:bg-slate-800/20 light:hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-medium text-slate-200 light:text-slate-800">{tier.label}</td>
                        <td className="py-3 text-right font-mono text-slate-400">${tier.usd.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400 light:text-emerald-600">
                          ৳{bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-mono text-xs text-slate-400">
                          ৳{Math.round(bdt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Simulator & Info */}
        <div className="space-y-6">
          {/* Simulator Card */}
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-100 light:text-slate-900 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Live Rate Simulator
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600 mb-4">
              Test how custom amounts convert at the currently configured rate.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Enter USD Amount ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={simUsd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSimUsd(val);
                      setSimBdt(Number((val * currentRateNum).toFixed(2)));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center text-slate-500">
                <ArrowRightLeft className="w-4 h-4" />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-xs text-emerald-400 light:text-emerald-700 block mb-1">Equivalent in BDT</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 light:text-emerald-600">
                  ৳{(simUsd * currentRateNum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Security & System Info Card */}
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-100 light:text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Currency System Architecture
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400 light:text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>Default currency switcher on header toggles all prices between <strong>৳ BDT</strong> and <strong>$ USD</strong> instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>BDT payments automatically unlock bKash and Nagad payment methods at checkout.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>USD payments unlock USDT (BEP20) and Binance UID cryptocurrency gateways.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
