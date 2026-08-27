import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { UsdPaymentConfig, BdtPaymentConfig } from '../../types';
import { CreditCard, Save, Copy, Check, ShieldCheck, Wallet, QrCode, Smartphone } from 'lucide-react';

export const AdminPaymentSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const currentSettings = db.getPaymentSettings();

  const [usdConfig, setUsdConfig] = useState<UsdPaymentConfig>(
    currentSettings.usd || currentSettings.paymentSettings?.usd || {
      usdtBep20Address: '',
      binanceUid: '',
      instructions: '',
    }
  );
  const [bdtConfig, setBdtConfig] = useState<BdtPaymentConfig>(
    currentSettings.bdt || currentSettings.paymentSettings?.bdt || {
      bkashNumber: '',
      bkashType: 'Personal',
      nagadNumber: '',
      nagadType: 'Personal',
      instructions: '',
    }
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('info', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      db.updatePaymentSettings({
        usd: usdConfig,
        bdt: bdtConfig,
        paymentSettings: {
          usd: usdConfig,
          bdt: bdtConfig,
        },
      });
      showToast('success', 'Payment Settings Saved', 'Customer checkout instructions and account numbers have been updated.');
    } catch {
      showToast('error', 'Save Failed', 'Could not save payment settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 light:text-purple-600 border border-purple-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Payment Methods & Gateway Settings
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-400 light:text-slate-600">
            Configure receiving credentials for USDT (BEP20), Binance UID, bKash, and Nagad
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* USD Payment Configuration Card */}
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  $
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100 light:text-slate-900">
                    USD Payment Configuration
                  </h2>
                  <p className="text-xs text-slate-400 light:text-slate-600">
                    Displayed when customer checks out with USD ($)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400">
                Crypto Gateways
              </span>
            </div>

            {/* USDT BEP20 */}
            <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" /> USDT Wallet Address (BEP20 / BNB Chain)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(usdConfig.usdtBep20Address, 'usdt')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'usdt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Address
                </button>
              </div>
              <input
                id="admin-usdt-address-input"
                type="text"
                required
                value={usdConfig.usdtBep20Address}
                onChange={(e) => setUsdConfig({ ...usdConfig, usdtBep20Address: e.target.value })}
                placeholder="0x..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[11px] text-slate-500">
                Ensure this is a valid Binance Smart Chain (BEP20) USDT address.
              </p>
            </div>

            {/* Binance UID */}
            <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" /> Binance Pay UID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(usdConfig.binanceUid, 'buid')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'buid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy UID
                </button>
              </div>
              <input
                id="admin-binance-uid-input"
                type="text"
                required
                value={usdConfig.binanceUid}
                onChange={(e) => setUsdConfig({ ...usdConfig, binanceUid: e.target.value })}
                placeholder="839201847"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* USD Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Customer Instructions for USD Payments
              </label>
              <textarea
                rows={3}
                value={usdConfig.instructions}
                onChange={(e) => setUsdConfig({ ...usdConfig, instructions: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* BDT Payment Configuration Card */}
          <div className="bg-slate-900/90 light:bg-white border border-slate-800 light:border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 light:border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-sm">
                  ৳
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100 light:text-slate-900">
                    BDT Payment Configuration (Bangladesh MFS)
                  </h2>
                  <p className="text-xs text-slate-400 light:text-slate-600">
                    Displayed when customer checks out with BDT (৳)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[11px] font-semibold text-pink-400">
                bKash & Nagad
              </span>
            </div>

            {/* bKash Config */}
            <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-400 light:text-pink-600 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> bKash Account Details
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold">
                  {bdtConfig.bkashType}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">bKash Number</label>
                  <input
                    id="admin-bkash-number-input"
                    type="text"
                    required
                    value={bdtConfig.bkashNumber}
                    onChange={(e) => setBdtConfig({ ...bdtConfig, bkashNumber: e.target.value })}
                    placeholder="01712-345678"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                  <select
                    value={bdtConfig.bkashType}
                    onChange={(e) => setBdtConfig({ ...bdtConfig, bkashType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-xs"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Merchant">Merchant</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nagad Config */}
            <div className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 light:border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 light:text-orange-600 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Nagad Account Details
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold">
                  {bdtConfig.nagadType}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Nagad Number</label>
                  <input
                    id="admin-nagad-number-input"
                    type="text"
                    required
                    value={bdtConfig.nagadNumber}
                    onChange={(e) => setBdtConfig({ ...bdtConfig, nagadNumber: e.target.value })}
                    placeholder="01812-345678"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 font-mono text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Account Type</label>
                  <select
                    value={bdtConfig.nagadType}
                    onChange={(e) => setBdtConfig({ ...bdtConfig, nagadType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 light:bg-white border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-xs"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Merchant">Merchant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BDT Instructions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700 mb-2">
                Customer Instructions for BDT Payments (বাংলায়)
              </label>
              <textarea
                rows={3}
                value={bdtConfig.instructions}
                onChange={(e) => setBdtConfig({ ...bdtConfig, instructions: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-slate-700 light:border-slate-300 text-slate-100 light:text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            id="admin-save-payment-settings-btn"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? <Save className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Payment Credentials</span>
          </button>
        </div>
      </form>
    </div>
  );
};
