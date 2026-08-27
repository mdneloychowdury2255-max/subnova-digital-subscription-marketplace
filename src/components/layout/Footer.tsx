import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { BRANDING } from '../../config/branding';
import { Sparkles, ShieldCheck, Zap, Headphones, Lock, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-slate-950 light:bg-slate-900 border-t border-slate-800/80 text-slate-400 text-xs mt-20 pb-20 md:pb-12 transition-colors">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800/80 py-10 bg-slate-900/40 light:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Genuine Licenses</p>
              <p className="text-slate-400 text-xs">Official vendor channels & verified keys</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Instant Key Delivery</p>
              <p className="text-slate-400 text-xs">Automated allocation pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">24/7 Priority Support</p>
              <p className="text-slate-400 text-xs">Live ticketing and fast resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Secure Payment Gateway</p>
              <p className="text-slate-400 text-xs">256-Bit SSL & encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">{BRANDING.name}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            {BRANDING.description}
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All fulfillment services operational
            </span>
          </div>
        </div>

        {/* Marketplace */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-sm">Marketplace</h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('/products')} className="hover:text-white transition-colors">
                All Products
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?cat=cat-ai')} className="hover:text-white transition-colors">
                AI Tools & Suites
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?cat=cat-dev')} className="hover:text-white transition-colors">
                Developer & IDEs
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?cat=cat-cloud')} className="hover:text-white transition-colors">
                Cloud & Storage Vaults
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/products?cat=cat-security')} className="hover:text-white transition-colors">
                Security & VPN
              </button>
            </li>
          </ul>
        </div>

        {/* Reseller Solutions */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-sm">Reseller Hub</h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('/reseller')} className="hover:text-white transition-colors">
                Reseller Program
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/reseller/apply')} className="hover:text-white transition-colors flex items-center gap-1">
                Apply as Partner <ArrowUpRight className="w-3 h-3 text-purple-400" />
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/reseller/dashboard')} className="hover:text-white transition-colors">
                Wholesale Portal
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/reseller/profit')} className="hover:text-white transition-colors">
                Profit Margins & Tiers
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div className="space-y-3">
          <h5 className="font-bold text-white text-sm">Trust & Legal</h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => navigate('/legal/terms')} className="hover:text-white transition-colors">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/privacy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/refund')} className="hover:text-white transition-colors">
                Refund & Guarantee
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/legal/compliance')} className="hover:text-white transition-colors">
                Legitimate Licensing Policy
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/dashboard/support')} className="hover:text-white transition-colors">
                Help & Support Tickets
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <p>© 2026 {BRANDING.name} Systems Inc. All rights reserved. {BRANDING.tagline}</p>
        <p className="text-[11px]">
          Compliant marketplace for legitimate digital licenses and subscriptions.
        </p>
      </div>
    </footer>
  );
};
