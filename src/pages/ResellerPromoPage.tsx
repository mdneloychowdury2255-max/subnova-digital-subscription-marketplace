import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import {
  Store,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ResellerPromoPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="space-y-20 max-w-6xl mx-auto">
      {/* 1. Reseller Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <Badge variant="purple">B2B Partner Ecosystem</Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-white light:text-slate-900 leading-tight">
          Scale Your Subscription Agency with SubNova
        </h1>
        <p className="text-base text-slate-300 light:text-slate-600 leading-relaxed">
          Access high-margin wholesale pricing on official developer, AI, cloud, and security subscriptions. Automate fulfillment directly from your reseller balance.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/reseller/apply')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Apply For Reseller Account
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/reseller/dashboard')}>
            Explore Reseller Hub Demo
          </Button>
        </div>
      </div>

      {/* 2. Tier Breakdown Cards */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            Reseller Margin Tiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Volume-based discounts that automatically scale with your monthly fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bronze */}
          <div className="rounded-3xl p-6 bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="neutral">Bronze Tier</Badge>
                <h3 className="text-xl font-bold text-white light:text-slate-900 mt-2">Starter Partner</h3>
              </div>
              <span className="text-2xl font-black font-mono text-purple-400">15% Off</span>
            </div>
            <p className="text-xs text-slate-400">Perfect for boutique consultants and freelance agencies.</p>
            <div className="space-y-2 text-xs text-slate-300 light:text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> $0 - $1,000 / mo volume</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Wholesale Catalog Access</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Wallet Billing</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reseller/apply')} className="w-full">
              Start at Bronze
            </Button>
          </div>

          {/* Silver */}
          <div className="rounded-3xl p-6 bg-purple-950/40 light:bg-purple-50/70 border-2 border-purple-500 shadow-xl space-y-5 relative">
            <div className="absolute -top-3 right-6">
              <Badge variant="purple">Most Popular</Badge>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="purple">Silver Tier</Badge>
                <h3 className="text-xl font-bold text-white light:text-slate-900 mt-2">Growth Agency</h3>
              </div>
              <span className="text-2xl font-black font-mono text-purple-400">25% Off</span>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-600">Ideal for growing SaaS resellers and IT service providers.</p>
            <div className="space-y-2 text-xs text-slate-200 light:text-slate-800">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> $1,000 - $10,000 / mo volume</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Client Management Dashboard</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Profit Analytics</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Priority Ticket Queue</div>
            </div>
            <Button size="sm" onClick={() => navigate('/reseller/apply')} className="w-full">
              Apply for Silver
            </Button>
          </div>

          {/* Gold */}
          <div className="rounded-3xl p-6 bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="warning">Gold VIP</Badge>
                <h3 className="text-xl font-bold text-white light:text-slate-900 mt-2">Enterprise Broker</h3>
              </div>
              <span className="text-2xl font-black font-mono text-amber-400">35% Off</span>
            </div>
            <p className="text-xs text-slate-400">For high-volume distribution channels and corporate vendors.</p>
            <div className="space-y-2 text-xs text-slate-300 light:text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> $10,000+ / mo volume</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Account Manager</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Custom API Webhook Integration</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1-Hour SLA Guarantee</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reseller/apply')} className="w-full">
              Apply for Gold
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Core Partner Features */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 light:bg-white border border-slate-800 light:border-slate-200 space-y-8">
        <h2 className="text-2xl font-black text-white light:text-slate-900 text-center">
          Engineered for Reseller Success
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white light:text-slate-900">Automated Wallet System</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-fund your balance via Card, USDT crypto, or Bank Wire. Instant deductions with 0% checkout friction.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white light:text-slate-900">Client Directory</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize your end-clients, track their active licenses, renewal dates, and lifetime contract value in one place.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white light:text-slate-900">Margin Analytics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time calculations of your gross wholesale outlay vs client retail charge, tracking net earnings month over month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
