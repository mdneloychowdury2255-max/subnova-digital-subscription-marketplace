import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ShieldCheck, Lock, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const LegalPage: React.FC = () => {
  const { path } = useNavigation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'refund' | 'compliance'>(
    path.includes('privacy')
      ? 'privacy'
      : path.includes('refund')
      ? 'refund'
      : path.includes('compliance')
      ? 'compliance'
      : 'terms'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="purple">Legal & Trust Center</Badge>
        <h1 className="text-3xl font-black text-white light:text-slate-900">
          Policies & Legitimate Fulfillment Charter
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Last updated: January 2026 • SubNova Systems Inc.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 light:border-slate-200 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'terms', label: 'Terms of Service', icon: FileText },
          { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          { id: 'refund', label: 'Refund & Guarantee', icon: RefreshCw },
          { id: 'compliance', label: 'Licensing Policy', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 text-xs sm:text-sm text-slate-300 light:text-slate-700 space-y-6 leading-relaxed">
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white light:text-slate-900">1. Terms of Service</h2>
            <p>
              By accessing or purchasing from SubNova, you agree to abide by these Terms of Service. All digital subscription plans, license keys, and workspace activation credentials provided on this platform are fulfilled in accordance with official vendor terms.
            </p>
            <h3 className="text-base font-bold text-white light:text-slate-900">2. Customer Responsibilities</h3>
            <p>
              Customers must ensure that email addresses provided at checkout are valid and accessible. You are responsible for preserving your delivered license keys and credentials securely.
            </p>
            <h3 className="text-base font-bold text-white light:text-slate-900">3. Reseller Obligations</h3>
            <p>
              Resellers agree to only distribute subscriptions to end-users who comply with the respective software providers' End User License Agreements (EULA).
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white light:text-slate-900">Privacy & Data Protection</h2>
            <p>
              SubNova respects your privacy. We collect minimal personal data strictly necessary to fulfill your orders, process payments, and maintain your account balance.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>We never sell or rent your personal contact information to third parties.</li>
              <li>Payment details are tokenized and processed via certified PCI-DSS compliant providers.</li>
              <li>You may request complete account data deletion at any time via support ticket.</li>
            </ul>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white light:text-slate-900">100% Legitimate Fulfillment & Refund Policy</h2>
            <p>
              Every license key and subscription activation sold on SubNova is covered by our full replacement or refund guarantee.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
              ✓ If a digital license key fails to activate or is deemed non-functional by the vendor, we provide an immediate automated replacement key or a 100% refund within 7 days of purchase.
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white light:text-slate-900">Compliance & Anti-Fraud Charter</h2>
            <p>
              SubNova strictly adheres to legitimate digital commerce standards:
            </p>
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-2 text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertCircle className="w-4 h-4" /> Strict Platform Prohibitions:
              </div>
              <p>
                We do NOT implement, support, or allow: account sharing pools, unauthorized student discount falsification, credential cracking, bypassing official restrictions, or hacked accounts. All products are verified corporate or enterprise volume licenses.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
