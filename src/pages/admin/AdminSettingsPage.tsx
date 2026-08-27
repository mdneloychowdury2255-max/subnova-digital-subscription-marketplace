import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Shield,
  CreditCard,
  Mail,
  Zap,
  Save,
  Server,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [siteName, setSiteName] = useState('SubNova');
  const [supportEmail, setSupportEmail] = useState('support@subnova.io');
  const [autoFulfill, setAutoFulfill] = useState(true);
  const [enableCrypto, setEnableCrypto] = useState(true);
  const [enableCards, setEnableCards] = useState(true);
  const [enableBankWire, setEnableBankWire] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Settings Saved', 'Global marketplace configuration updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-400" />
          Global Platform Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure marketplace identity, automated fulfillment engine, and active payment gateways.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace Identity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            General Marketplace Config
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-300 light:text-slate-700">
                Marketplace Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300 light:text-slate-700">
                Support Desk Inbound Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 light:bg-slate-50 border border-slate-800 text-xs text-white light:text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment Engine */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Automated Key Dispatch Engine
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white light:text-slate-900 block">
                  Zero-Latency Key Dispatch
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically allocate available license keys from inventory pools upon confirmed payment.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoFulfill}
                onChange={(e) => setAutoFulfill(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            Payment Gateways & Methods
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 cursor-pointer">
              <span className="font-semibold text-white light:text-slate-900">Stripe / Credit Cards</span>
              <input
                type="checkbox"
                checked={enableCards}
                onChange={(e) => setEnableCards(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 cursor-pointer">
              <span className="font-semibold text-white light:text-slate-900">USDT / Crypto</span>
              <input
                type="checkbox"
                checked={enableCrypto}
                onChange={(e) => setEnableCrypto(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 light:bg-slate-50 border border-slate-800 cursor-pointer">
              <span className="font-semibold text-white light:text-slate-900">Bank Wire / Transfer</span>
              <input
                type="checkbox"
                checked={enableBankWire}
                onChange={(e) => setEnableBankWire(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="md" leftIcon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
