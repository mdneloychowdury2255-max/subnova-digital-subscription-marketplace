import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  CheckCircle2,
  Copy,
  Receipt,
  Filter,
  Check,
  Smartphone,
  Upload,
  ImageIcon,
  X,
  Send,
  RefreshCw,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PaymentMethodType } from '../../types';

export const CustomerWalletPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { currency, exchangeRate, formatPrice } = useCurrency();

  const settings = db.getSettings();

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Deposit state
  const [depositAmountUSD, setDepositAmountUSD] = useState<number>(20);
  const [depositMethod, setDepositMethod] = useState<PaymentMethodType>('bkash');
  const [depositSenderInfo, setDepositSenderInfo] = useState('');
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositProofUrl, setDepositProofUrl] = useState('');

  // Withdraw state
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState<number>(10);
  const [withdrawSource, setWithdrawSource] = useState<'main' | 'commission'>('commission');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'usdt_bep20' | 'binance_uid'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // Transfer Commission state
  const [transferAmount, setTransferAmount] = useState<number>(Number((user?.commissionBalance || 0).toFixed(2)));

  // Ledger Filter
  const [activeLedgerTab, setActiveLedgerTab] = useState<'transactions' | 'deposits' | 'withdrawals'>('transactions');
  const [filterType, setFilterType] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const transactions = user ? db.getUserTransactions(user.id) : [];
  const deposits = user ? db.getUserDeposits(user.id) : [];
  const withdrawals = user ? db.getUserWithdrawals(user.id) : [];

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const bdtDepositAmount = Math.round(depositAmountUSD * (settings.usdExchangeRate || 120));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', 'Copied!', `${label} copied to clipboard.`);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || depositAmountUSD <= 0) return;

    if (!depositTrxId.trim()) {
      showToast('error', 'Missing TrxID', 'Please enter your Transaction ID (TrxID) or payment reference.');
      return;
    }

    setIsProcessing(true);
    try {
      db.createDeposit({
        userId: user.id,
        amountUSD: depositAmountUSD,
        amountBDT: bdtDepositAmount,
        currency: 'BDT',
        paymentMethod: depositMethod,
        transactionRef: depositTrxId.trim(),
        senderInfo: depositSenderInfo.trim(),
        proofImageUrl: depositProofUrl.trim() || undefined,
      });

      setIsProcessing(false);
      setIsDepositOpen(false);
      setDepositSenderInfo('');
      setDepositTrxId('');
      setDepositProofUrl('');
      refreshUser();
      showToast('success', 'Deposit Submitted!', `$${depositAmountUSD.toFixed(2)} (৳${bdtDepositAmount}) deposit submitted for admin review.`);
    } catch (err: any) {
      setIsProcessing(false);
      showToast('error', 'Deposit Failed', err.message);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || withdrawAmountUSD <= 0) return;

    if (!withdrawAccount.trim()) {
      showToast('error', 'Missing Account', 'Please enter your receiver number or wallet address.');
      return;
    }

    const available = withdrawSource === 'commission' ? (user.commissionBalance || 0) : (user.walletBalance || 0);
    if (withdrawAmountUSD > available) {
      showToast('error', 'Insufficient Balance', `Available in ${withdrawSource} balance: $${available.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = db.requestWithdrawal({
        userId: user.id,
        amountUSD: withdrawAmountUSD,
        sourceBalance: withdrawSource,
        withdrawalMethod: withdrawMethod,
        accountDetails: withdrawAccount.trim(),
      });

      setIsProcessing(false);
      if (res.success) {
        setIsWithdrawOpen(false);
        setWithdrawAccount('');
        refreshUser();
        showToast('success', 'Withdrawal Requested!', `Requested $${withdrawAmountUSD.toFixed(2)} payout via ${withdrawMethod.toUpperCase()}.`);
      } else {
        showToast('error', 'Error', res.error || 'Failed to request withdrawal');
      }
    } catch (err: any) {
      setIsProcessing(false);
      showToast('error', 'Withdrawal Failed', err.message);
    }
  };

  const handleTransferCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || transferAmount <= 0) return;

    if (transferAmount > (user.commissionBalance || 0)) {
      showToast('error', 'Insufficient Commission Balance', 'Amount exceeds available commission earnings.');
      return;
    }

    setIsProcessing(true);
    const res = db.transferCommissionToMain(user.id, transferAmount);
    setIsProcessing(false);

    if (res.success) {
      setIsTransferOpen(false);
      refreshUser();
      showToast('success', 'Transferred to Main Wallet!', `$${transferAmount.toFixed(2)} moved to your main balance.`);
    } else {
      showToast('error', 'Transfer Failed', res.error || 'Could not transfer.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Dual Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Wallet */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 light:border-slate-200 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Main Wallet Balance
            </span>
            <Badge variant="purple">Instant Checkout Ready</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-5xl font-black font-mono text-white light:text-slate-900">
              ${(user?.walletBalance || 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">
              USD (~৳{Math.round((user?.walletBalance || 0) * (settings.usdExchangeRate || 120)).toLocaleString()} BDT)
            </span>
          </div>

          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Used for 1-click subscription purchases, renewal billing, and Reseller wholesale orders without payment gateway delays.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              onClick={() => setIsDepositOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Deposit Funds
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setWithdrawSource('main');
                setIsWithdrawOpen(true);
              }}
              leftIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Withdraw
            </Button>
          </div>
        </div>

        {/* Commission Wallet */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-emerald-950/30 border border-purple-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Referral Commission Balance
            </span>
            <Badge variant="emerald">5% Profit Payouts</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-5xl font-black font-mono text-emerald-400">
              ${(user?.commissionBalance || 0).toFixed(4)}
            </span>
            <span className="text-xs text-slate-400">
              USD (~৳{Math.round((user?.commissionBalance || 0) * (settings.usdExchangeRate || 120)).toLocaleString()} BDT)
            </span>
          </div>

          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Earnings generated automatically from your referral link ({user?.referralCode || 'YOUR_CODE'}). Earns 5% on every referred order profit!
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              onClick={() => {
                setTransferAmount(Number((user?.commissionBalance || 0).toFixed(2)));
                setIsTransferOpen(true);
              }}
              disabled={(user?.commissionBalance || 0) <= 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Transfer to Main Wallet
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setWithdrawSource('commission');
                setIsWithdrawOpen(true);
              }}
              disabled={(user?.commissionBalance || 0) <= 0}
              leftIcon={<Send className="w-4 h-4 text-emerald-400" />}
            >
              Withdraw Commission
            </Button>
          </div>
        </div>
      </div>

      {/* Ledger & History Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveLedgerTab('transactions')}
              className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                activeLedgerTab === 'transactions'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Wallet Ledger ({transactions.length})
            </button>
            <button
              onClick={() => setActiveLedgerTab('deposits')}
              className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                activeLedgerTab === 'deposits'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Deposit Requests ({deposits.length})
            </button>
            <button
              onClick={() => setActiveLedgerTab('withdrawals')}
              className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                activeLedgerTab === 'withdrawals'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Withdrawal Requests ({withdrawals.length})
            </button>
          </div>

          {activeLedgerTab === 'transactions' && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'deposit', 'order_payment', 'commission', 'commission_transfer', 'reseller_activation'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    filterType === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: TRANSACTIONS */}
        {activeLedgerTab === 'transactions' && (
          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No transactions recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 light:bg-slate-100/80 border-b border-slate-800 light:border-slate-200 text-slate-400">
                    <tr>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Balance After</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 light:divide-slate-200 text-slate-300 light:text-slate-700">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 light:hover:bg-slate-50">
                        <td className="p-4 font-semibold uppercase text-purple-400">
                          {tx.type.replace('_', ' ')}
                        </td>
                        <td className="p-4 text-white light:text-slate-900">
                          {tx.description}
                        </td>
                        <td className="p-4 font-mono font-bold">
                          <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}>
                            {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          ${tx.balanceAfter.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <Badge variant={tx.status === 'completed' ? 'emerald' : 'warning'}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DEPOSITS */}
        {activeLedgerTab === 'deposits' && (
          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {deposits.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No deposit requests submitted.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4">Deposit #</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">TrxID / Reference</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-mono text-purple-400 font-bold">{dep.depositNumber}</td>
                        <td className="p-4 font-mono font-bold text-white">
                          ${dep.amount.toFixed(2)} <span className="text-slate-400 text-[11px]">(৳{dep.amountBDT})</span>
                        </td>
                        <td className="p-4 uppercase font-bold text-pink-400">{dep.paymentMethod}</td>
                        <td className="p-4 font-mono text-amber-400">{dep.transactionRef}</td>
                        <td className="p-4">
                          <Badge variant={dep.status === 'approved' ? 'emerald' : dep.status === 'pending' ? 'warning' : 'rose'}>
                            {dep.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(dep.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WITHDRAWALS */}
        {activeLedgerTab === 'withdrawals' && (
          <div className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 overflow-hidden">
            {withdrawals.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No withdrawal history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4">Withdrawal #</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Method & Account</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/30">
                        <td className="p-4 font-mono text-purple-400 font-bold">{w.withdrawalNumber}</td>
                        <td className="p-4 font-mono font-bold text-white">
                          ${w.amountUSD.toFixed(2)} <span className="text-slate-400 text-[11px]">(৳{w.amountBDT})</span>
                        </td>
                        <td className="p-4 uppercase text-emerald-400 font-semibold">{w.sourceBalance} wallet</td>
                        <td className="p-4">
                          <p className="uppercase font-bold text-pink-400">{w.withdrawalMethod}</p>
                          <p className="font-mono text-slate-300">{w.accountDetails}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant={w.status === 'approved' ? 'emerald' : w.status === 'pending' ? 'warning' : 'rose'}>
                            {w.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(w.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsDepositOpen(false)}
          title="Deposit Funds to SubNova Wallet"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-white">
                  Deposit Amount ($ USD) *
                </label>
                <input
                  type="number"
                  min="2"
                  max="5000"
                  step="1"
                  required
                  value={depositAmountUSD}
                  onChange={(e) => setDepositAmountUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-400">
                  Equivalent BDT (৳{settings.usdExchangeRate || 120} rate)
                </label>
                <div className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono font-bold text-pink-400">
                  ৳{bdtDepositAmount.toLocaleString()} BDT
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5 text-white">
                Choose Payment Method *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setDepositMethod('bkash')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    depositMethod === 'bkash'
                      ? 'bg-pink-950/60 border-pink-500 text-pink-300 font-bold ring-1 ring-pink-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-sm">৳</span>
                  <span>bKash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('nagad')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    depositMethod === 'nagad'
                      ? 'bg-orange-950/60 border-orange-500 text-orange-300 font-bold ring-1 ring-orange-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-sm">৳</span>
                  <span>Nagad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('usdt_bep20')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    depositMethod === 'usdt_bep20'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>USDT BEP20</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('binance_pay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    depositMethod === 'binance_pay'
                      ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300 font-bold ring-1 ring-yellow-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-sm">⚡</span>
                  <span>Binance UID</span>
                </button>
              </div>
            </div>

            {/* Gateway details */}
            {depositMethod === 'bkash' && (
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span>bKash Personal: <strong>{settings.paymentSettings.bdt.bkashNumber}</strong></span>
                  <button type="button" onClick={() => copyToClipboard(settings.paymentSettings.bdt.bkashNumber, 'bKash Number')}>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Send Money exact amount ৳{bdtDepositAmount} BDT to this number.</p>
              </div>
            )}

            {depositMethod === 'nagad' && (
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Nagad Personal: <strong>{settings.paymentSettings.bdt.nagadNumber}</strong></span>
                  <button type="button" onClick={() => copyToClipboard(settings.paymentSettings.bdt.nagadNumber, 'Nagad Number')}>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Send Money exact amount ৳{bdtDepositAmount} BDT to this number.</p>
              </div>
            )}

            {depositMethod === 'usdt_bep20' && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex justify-between items-center break-all">
                  <span className="font-mono text-[11px]">{settings.paymentSettings.usd.usdtBep20Address}</span>
                  <button type="button" onClick={() => copyToClipboard(settings.paymentSettings.usd.usdtBep20Address, 'USDT Address')}>
                    <Copy className="w-3.5 h-3.5 ml-2" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Send exact amount ${depositAmountUSD} USDT on BEP-20 Network.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-white">Sender Account / Mobile *</label>
                <input
                  type="text"
                  required
                  value={depositSenderInfo}
                  onChange={(e) => setDepositSenderInfo(e.target.value)}
                  placeholder="017xxxxxxxx or 0x..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-white">TrxID / TXID *</label>
                <input
                  type="text"
                  required
                  value={depositTrxId}
                  onChange={(e) => setDepositTrxId(e.target.value)}
                  placeholder="e.g. 9K8J2LM3Q1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold uppercase focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsDepositOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isProcessing}>
                Submit Deposit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsWithdrawOpen(false)}
          title="Request Wallet Withdrawal / Payout"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="block font-semibold mb-1 text-white">Payout Source Balance</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawSource('commission')}
                  className={`p-2.5 rounded-xl border text-left ${
                    withdrawSource === 'commission'
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Commission Balance</div>
                  <div className="font-mono text-emerald-400">${(user?.commissionBalance || 0).toFixed(4)}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawSource('main')}
                  className={`p-2.5 rounded-xl border text-left ${
                    withdrawSource === 'main'
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Main Wallet</div>
                  <div className="font-mono text-white">${(user?.walletBalance || 0).toFixed(2)}</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white">Withdrawal Amount ($ USD)</label>
              <input
                type="number"
                min="5"
                step="1"
                required
                value={withdrawAmountUSD}
                onChange={(e) => setWithdrawAmountUSD(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                You will receive ≈ ৳{Math.round(withdrawAmountUSD * (settings.usdExchangeRate || 120))} BDT
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white">Payout Gateway</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="bkash">bKash Personal (BDT)</option>
                <option value="nagad">Nagad Personal (BDT)</option>
                <option value="usdt_bep20">USDT BEP-20 (USD)</option>
                <option value="binance_uid">Binance Pay UID (USD)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-white">Receiver Account Number / Wallet Address</label>
              <input
                type="text"
                required
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                placeholder="017xxxxxxxx or 0x..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsWithdrawOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isProcessing} className="bg-emerald-600 hover:bg-emerald-500">
                Request Payout
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Commission Modal */}
      {isTransferOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsTransferOpen(false)}
          title="Transfer Commission to Main Wallet"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleTransferCommission} className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-300">
              Move your earned referral commissions directly into your Main Wallet balance to purchase subscriptions or reseller orders instantly.
            </p>

            <div>
              <label className="block font-semibold mb-1 text-white">Transfer Amount ($ USD)</label>
              <input
                type="number"
                min="0.01"
                max={user?.commissionBalance || 0}
                step="0.01"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Available: ${(user?.commissionBalance || 0).toFixed(4)} USD</span>
                <button
                  type="button"
                  onClick={() => setTransferAmount(Number((user?.commissionBalance || 0).toFixed(2)))}
                  className="text-purple-400 hover:underline"
                >
                  Transfer All
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isProcessing}>
                Confirm Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
