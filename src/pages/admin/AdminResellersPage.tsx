import React, { useState } from 'react';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  CheckCircle2,
  XCircle,
  Percent,
  TrendingUp,
  Building,
  Mail,
  Award,
  Wallet,
  Eye,
  ExternalLink,
  ShieldAlert,
  Search,
  Settings,
  DollarSign,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ResellerApplication, User } from '../../types';

export const AdminResellersPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'applications' | 'partners' | 'settings'>('applications');
  const [selectedApp, setSelectedApp] = useState<ResellerApplication | null>(null);
  const [selectedReseller, setSelectedReseller] = useState<User | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState('');
  const [balanceAdjustReason, setBalanceAdjustReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Global Reseller & Commission Settings state
  const settings = db.getSettings();
  const [activationFeeBDT, setActivationFeeBDT] = useState(settings.resellerActivationFeeBDT || 300);
  const [commissionRate, setCommissionRate] = useState(settings.referralCommissionRate || 5);
  const [commissionDest, setCommissionDest] = useState(settings.commissionDestination || 'commission_wallet');
  const [defaultMargin, setDefaultMargin] = useState(settings.defaultResellerDiscountPercentage || 25);
  const [savingSettings, setSavingSettings] = useState(false);

  const resellers = db.getResellers().filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.resellerDetails?.businessName && r.resellerDetails.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const applications = db.getResellerApplications();

  const handleApprove = (appId: string) => {
    db.approveResellerApplication(appId, defaultMargin);
    setSelectedApp(null);
    showToast('success', 'Reseller Account Activated!', `Payment verified. Reseller account approved with ${defaultMargin}% discount tier.`);
  };

  const handleReject = () => {
    if (!selectedApp) return;
    db.rejectResellerApplication(selectedApp.id, rejectReason || 'Activation payment could not be verified.');
    setSelectedApp(null);
    setShowRejectModal(false);
    setRejectReason('');
    showToast('info', 'Application Declined', 'Reseller application declined.');
  };

  const handleToggleStatus = (reseller: User) => {
    const newStatus = reseller.status === 'active' ? 'suspended' : 'active';
    reseller.status = newStatus;
    if (reseller.resellerStatus) {
      reseller.resellerStatus = newStatus === 'active' ? 'active' : 'suspended';
    }
    db.updateUser(reseller);
    showToast('success', 'Status Updated', `Reseller status set to ${newStatus}.`);
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReseller) return;
    const delta = parseFloat(balanceAdjustAmount);
    if (isNaN(delta) || delta === 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid non-zero amount.');
      return;
    }
    db.adjustUserBalance(
      selectedReseller.id,
      delta,
      balanceAdjustReason || `Admin manual balance adjustment`,
      delta > 0 ? 'deposit' : 'withdrawal'
    );
    showToast('success', 'Balance Updated', `Adjusted balance by $${delta.toFixed(2)} USD.`);
    setSelectedReseller(null);
    setBalanceAdjustAmount('');
    setBalanceAdjustReason('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const updated = db.saveSettings({
      ...settings,
      resellerActivationFeeBDT: Number(activationFeeBDT),
      referralCommissionRate: Number(commissionRate),
      commissionDestination: commissionDest as any,
      defaultResellerDiscountPercentage: Number(defaultMargin),
    });
    setSavingSettings(false);
    showToast('success', 'Settings Saved', `Activation Fee updated to ৳${updated.resellerActivationFeeBDT} & Commission to ${updated.referralCommissionRate}%.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white light:text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-400" />
            Reseller System & Activation Management
          </h1>
          <p className="text-xs text-slate-400">
            Verify ৳{activationFeeBDT} activation payments, manage wholesale partner accounts, and configure referral rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono">
            <span className="text-slate-400">Fee: </span>
            <span className="text-purple-300 font-bold">৳{activationFeeBDT} BDT</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
            <span className="text-slate-400">Commission: </span>
            <span className="text-emerald-300 font-bold">{commissionRate}% on Profit</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 light:border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending ৳{activationFeeBDT} Activations</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
            {applications.filter((a) => a.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'partners'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <span>Active Resellers ({resellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Activation & Commission Settings</span>
        </button>
      </div>

      {/* TAB 1: PENDING ACTIVATIONS */}
      {activeTab === 'applications' && (
        <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No reseller activation applications in queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                  <tr>
                    <th className="p-4">Applicant & Agency</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Activation Fee</th>
                    <th className="p-4">TrxID / Reference</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-white light:text-slate-900">{app.name}</p>
                        <p className="text-[11px] text-purple-400">{app.businessName || 'Agency'}</p>
                        <p className="text-[10px] text-slate-400">{app.email} • {app.phone}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          app.paymentMethod === 'bkash' ? 'purple' :
                          app.paymentMethod === 'nagad' ? 'warning' :
                          app.paymentMethod === 'usdt_bep20' ? 'emerald' : 'info'
                        }>
                          {app.paymentMethod ? app.paymentMethod.toUpperCase() : 'MANUAL'}
                        </Badge>
                        {app.senderInfo && (
                          <p className="text-[10px] text-slate-400 font-mono mt-1">Sender: {app.senderInfo}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-emerald-400">৳{app.activationFee || 300} BDT</span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-white bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {app.transactionRef || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(app.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'emerald' : 'rose'}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE RESELLERS */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resellers by name, agency, or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {resellers.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No active resellers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                    <tr>
                      <th className="p-4">Reseller & Agency</th>
                      <th className="p-4">Referral Code</th>
                      <th className="p-4">Main Wallet</th>
                      <th className="p-4">Commission Wallet</th>
                      <th className="p-4">Discount Margin</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                    {resellers.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-white light:text-slate-900">{r.name}</p>
                          <p className="text-[11px] text-purple-400">{r.resellerDetails?.businessName || 'SubNova Reseller'}</p>
                          <p className="text-[10px] text-slate-400">{r.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-500/30">
                            {r.referralCode || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          ${(r.walletBalance || 0).toFixed(2)} USD
                        </td>
                        <td className="p-4 font-mono font-bold text-purple-400">
                          ${(r.commissionBalance || 0).toFixed(4)} USD
                        </td>
                        <td className="p-4">
                          <Badge variant="purple">
                            {Math.round(((r.resellerDetails?.discountRate || 0.25) * 100))}% Wholesale
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={r.status === 'active' ? 'emerald' : 'rose'}>
                            {r.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedReseller(r)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold inline-flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Adjust Balance</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(r)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold ${
                              r.status === 'active'
                                ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {r.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVATION & COMMISSION SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Reseller System & Commission Parameters</h3>
            <p className="text-xs text-slate-400">Configure global activation fees, referral rates, and payout destination.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reseller Account Activation Fee (BDT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={activationFeeBDT}
                  onChange={(e) => setActivationFeeBDT(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">BDT</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default requirement: ৳300 BDT for every new Reseller activation.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Referral Commission Rate (% of Profit)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Default: 5% of actual profit amount (Customer Price - Reseller Wholesale Price).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Commission Credit Destination
              </label>
              <select
                value={commissionDest}
                onChange={(e) => setCommissionDest(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="commission_wallet">Dedicated Commission Wallet (User can transfer to main wallet or withdraw)</option>
                <option value="main_wallet">Directly to Main Wallet Balance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Default Reseller Wholesale Discount (%)
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={defaultMargin}
                onChange={(e) => setDefaultMargin(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <Button type="submit" isLoading={savingSettings} className="w-full font-bold">
            Save System Settings
          </Button>
        </form>
      )}

      {/* Modal: Application Review Detail */}
      {selectedApp && !showRejectModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          title="Reseller Activation Application Review"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-bold text-white">{selectedApp.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agency:</span>
                <span className="text-purple-400 font-semibold">{selectedApp.businessName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-white">{selectedApp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone / WhatsApp:</span>
                <span className="font-mono text-white">{selectedApp.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Country:</span>
                <span className="text-white">{selectedApp.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Website / Page:</span>
                <span className="text-indigo-400">{selectedApp.website || 'None'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300">Activation Fee:</span>
                <span className="text-emerald-400 font-mono text-sm">৳{selectedApp.activationFee || 300} BDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="uppercase font-bold text-white">{selectedApp.paymentMethod || 'bKash'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TrxID / TXID:</span>
                <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {selectedApp.transactionRef || 'N/A'}
                </span>
              </div>
              {selectedApp.senderInfo && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Account:</span>
                  <span className="font-mono text-white">{selectedApp.senderInfo}</span>
                </div>
              )}
            </div>

            {selectedApp.screenshotUrl && (
              <div className="space-y-1">
                <span className="text-slate-400 font-bold">Payment Proof Screenshot:</span>
                <a
                  href={selectedApp.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 transition-colors"
                >
                  <img
                    src={selectedApp.screenshotUrl}
                    alt="Payment proof"
                    className="max-h-48 rounded-lg object-contain mx-auto"
                  />
                  <div className="text-center text-[11px] text-purple-400 mt-1 flex items-center justify-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Open full image</span>
                  </div>
                </a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
              {selectedApp.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Decline Payment
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Verify & Activate Reseller
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Decline Reason */}
      {showRejectModal && selectedApp && (
        <Modal
          isOpen={true}
          onClose={() => setShowRejectModal(false)}
          title="Decline Reseller Application"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Please specify the reason for declining {selectedApp.name}'s activation payment:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. TrxID does not match bank/bKash statement, insufficient amount..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject}>
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Adjust Reseller Balance */}
      {selectedReseller && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReseller(null)}
          title={`Adjust Wallet Balance: ${selectedReseller.name}`}
        >
          <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Main Balance:</span>
                <span className="font-mono font-bold text-emerald-400">${(selectedReseller.walletBalance || 0).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Commission Balance:</span>
                <span className="font-mono font-bold text-purple-400">${(selectedReseller.commissionBalance || 0).toFixed(4)} USD</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Adjustment Amount in USD (+ for credit, - for debit)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={balanceAdjustAmount}
                onChange={(e) => setBalanceAdjustAmount(e.target.value)}
                placeholder="+50.00 or -20.00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Reason / Note (Logged in Audit & Transaction History)
              </label>
              <input
                type="text"
                required
                value={balanceAdjustReason}
                onChange={(e) => setBalanceAdjustReason(e.target.value)}
                placeholder="e.g. Manual bank deposit verification, promo bonus..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setSelectedReseller(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Apply Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
