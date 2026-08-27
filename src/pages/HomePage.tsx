import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/api';
import { BRANDING } from '../config/branding';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Headphones,
  Store,
  CheckCircle2,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Lock,
  Star,
  Quote,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const products = db.getProducts();
  const popularProducts = products.filter((p) => p.isPopular || p.isFeatured).slice(0, 6);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are the digital subscriptions and licenses 100% legitimate?',
      a: 'Yes, absolutely. SubNova only sources and delivers genuine, official digital licenses and subscription activations directly through certified partner programs. We strictly prohibit unauthorized access or fraudulent credentials.',
    },
    {
      q: 'How fast is the subscription key or account delivered?',
      a: 'Most digital licenses (Instant Keys) are delivered in under 60 seconds directly on your order confirmation screen and saved in your customer portal. Manual provisionings take 15 to 30 minutes.',
    },
    {
      q: 'How does the Reseller Program work?',
      a: 'Approved resellers receive wholesale pricing (up to 35% discount off retail rates). You can pre-fund your automated wallet and place orders on behalf of your end clients, capturing the net profit margin automatically.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We support all major Credit/Debit Cards, Wallet Balance, Cryptocurrency (USDT TRC-20, BTC, ETH), and direct Bank Wire Transfers.',
    },
    {
      q: 'What is your refund policy?',
      a: 'We offer a complete money-back guarantee if an activation key cannot be redeemed or is invalid upon delivery. Please contact our 24/7 support team.',
    },
  ];

  const testimonials = [
    {
      name: 'Marcus Sterling',
      role: 'Lead DevOps Engineer, CloudScale Labs',
      content: 'SubNova is our go-to portal for provisioning developer tool seats and AI workspace licenses for our engineering sprints. Instant delivery and immaculate support.',
      rating: 5,
    },
    {
      name: 'Sarah Jenkins',
      role: 'Agency Founder, PixelCraft Digital',
      content: 'The Reseller program is unmatched. The automated wallet billing allows us to package design and cloud subscriptions into our client retainers with healthy profit margins.',
      rating: 5,
    },
    {
      name: 'David Zhao',
      role: 'AI Researcher & Data Scientist',
      content: 'Purchased the NeuralCraft AI Studio key and it was active within 45 seconds. Great pricing, transparent billing, and zero hassle.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Next-Gen Subscription Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white light:text-slate-900 leading-[1.1]">
                Premium Digital Subscriptions,{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 light:text-slate-600 max-w-2xl leading-relaxed">
                Get access to your favorite digital services, AI tools, developer software, and cloud storage with lightning-fast delivery and verified official licensing.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/products')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Browse Products
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/reseller')}
                  leftIcon={<Store className="w-4 h-4 text-purple-400" />}
                  className="w-full sm:w-auto"
                >
                  Become a Reseller
                </Button>
              </div>

              {/* Highlights count */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 light:border-slate-200">
                <div>
                  <p className="text-2xl font-bold font-mono text-white light:text-slate-900">50K+</p>
                  <p className="text-xs text-slate-400">Licenses Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-purple-400">99.8%</p>
                  <p className="text-xs text-slate-400">Satisfaction Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-blue-400">&lt;60s</p>
                  <p className="text-xs text-slate-400">Avg Delivery Time</p>
                </div>
              </div>
            </div>

            {/* Right Abstract AI Visual / Interactive Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl glow-purple">
                {/* Floating Top Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-400 font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Live Dispatch API
                  </span>
                </div>

                {/* Simulated License Dispatch Widget */}
                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">NeuralCraft AI Studio</p>
                        <p className="text-[10px] text-emerald-400">● License Generated & Ready</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">$24.99</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">CodePilot Developer Pro</p>
                        <p className="text-[10px] text-blue-400">● Wholesale Reseller Fulfilled</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">+$44 Profit</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">QuantumShield VPN Ultra</p>
                        <p className="text-[10px] text-emerald-400">● 2-Year Cryptographic Key</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">$59.99</span>
                  </div>
                </div>

                {/* Instant Action Button */}
                <button
                  onClick={() => navigate('/products')}
                  className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Full Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto sm:mx-0">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white light:text-slate-900">Secure Payments</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protected with 256-bit encryption. Pay via Card, Crypto USDT, Bank Wire, or Wallet.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto sm:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white light:text-slate-900">Fast Delivery</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated license allocation pipeline delivers valid digital keys in seconds.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto sm:mx-0">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white light:text-slate-900">Customer Support</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated ticketing desk and active support team for resolution within hours.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto sm:mx-0">
                <Store className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white light:text-slate-900">Reseller Program</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Wholesale tiered discounts, wallet auto-billing, and client fulfillment tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Featured Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
              Popular Subscriptions & Services
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All Marketplace
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularProducts.map((prod) => {
            const firstPlan = prod.plans[0];
            const discountPct = firstPlan.originalPrice
              ? Math.round(((firstPlan.originalPrice - firstPlan.retailPrice) / firstPlan.originalPrice) * 100)
              : null;

            return (
              <div
                key={prod.id}
                className="group rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 p-6 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
              >
                <div className="space-y-4">
                  {/* Top Image & Badge */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-950">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {prod.badge && <Badge variant="purple">{prod.badge}</Badge>}
                      {discountPct && <Badge variant="success">Save {discountPct}%</Badge>}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                      {prod.categoryName}
                    </span>
                    <h3 className="text-lg font-bold text-white light:text-slate-900 group-hover:text-purple-400 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 light:text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>
                  </div>

                  {/* Delivery & Plan Specs */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 light:border-slate-100">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {firstPlan.deliveryTime}
                    </span>
                    <span>{prod.plans.length} Available Plans</span>
                  </div>
                </div>

                {/* Pricing & Buy Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 light:border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Starting from</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black font-mono text-white light:text-slate-900">
                        ${firstPlan.retailPrice.toFixed(2)}
                      </span>
                      {firstPlan.originalPrice && (
                        <span className="text-xs line-through text-slate-500">
                          ${firstPlan.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => navigate(`/products/${prod.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="purple">Simple 4-Step Process</Badge>
          <h2 className="text-3xl font-black text-white light:text-slate-900">
            How SubNova Works
          </h2>
          <p className="text-sm text-slate-400">
            From checkout to official digital activation in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Choose a Product',
              desc: 'Select from our verified catalog of AI, developer, cloud, and productivity subscriptions.',
              icon: ShoppingBag,
            },
            {
              step: '02',
              title: 'Select Plan & Order',
              desc: 'Pick your preferred billing duration (monthly, yearly, or lifetime) and apply coupons.',
              icon: CreditCard,
            },
            {
              step: '03',
              title: 'Complete Payment',
              desc: 'Pay securely using Card, Crypto, Bank Transfer, or pre-funded Wallet balance.',
              icon: ShieldCheck,
            },
            {
              step: '04',
              title: 'Receive Credentials',
              desc: 'Instant official digital activation key generated directly on your screen and emailed.',
              icon: Zap,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-6 bg-slate-900/40 light:bg-white border border-slate-800/80 light:border-slate-200 hover:border-slate-700 transition-all space-y-4"
              >
                <span className="text-3xl font-black font-mono text-purple-500/30">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white light:text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. RESELLER PROGRAM HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                <Store className="w-3.5 h-3.5" /> B2B Partner Portal
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Start Your Own Subscription Reselling Business
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Unlock wholesale rates, automated client order placement, and seamless wallet deductions. Keep the spread on every license with full financial reporting.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Up to 35% Wholesale Discounts',
                  'Instant Reseller Dashboard',
                  'Pre-Funded Wallet Billing',
                  'Client Directory & Order Tracker',
                  'Real-Time Profit & Margin Reports',
                  'Dedicated Reseller Priority Support',
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/reseller/apply')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Join Reseller Program
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/reseller')}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Simulated Margin Calculation Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl p-6 bg-slate-950/90 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Live Reseller Margin Calculator</span>
                  <Badge variant="purple">25% Tier</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Product:</span>
                    <span className="font-semibold text-white">NeuralCraft AI Studio (Yearly)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retail Client Price:</span>
                    <span className="font-mono text-white">$239.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wholesale Reseller Cost:</span>
                    <span className="font-mono text-purple-400 font-bold">$175.00</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-white">Your Net Profit:</span>
                    <span className="text-lg font-black font-mono text-emerald-400">+$64.00</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                  ⚡ Reseller wallet is automatically debited $175.00 while you charge your client $239.00.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="neutral">Verified Reviews (Demo Showcase)</Badge>
          <h2 className="text-3xl font-black text-white light:text-slate-900">
            Loved by Developers, Agencies & Resellers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-6 bg-slate-900/50 light:bg-white border border-slate-800/80 light:border-slate-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-purple-400/40" />
                <p className="text-xs sm:text-sm text-slate-300 light:text-slate-700 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 light:border-slate-100">
                <p className="text-xs font-bold text-white light:text-slate-900">{t.name}</p>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="purple">Frequently Asked Questions</Badge>
          <h2 className="text-3xl font-black text-white light:text-slate-900">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white light:text-slate-900"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-purple-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-400 light:text-slate-600 leading-relaxed border-t border-slate-800/40 light:border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-purple-900/80 via-slate-900 to-indigo-900/80 border border-purple-500/40 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to get started?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join thousands of individual professionals, developers, and reseller partners who trust SubNova for legitimate digital subscription fulfillment.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button size="lg" onClick={() => navigate('/products')}>
              Shop Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/reseller/apply')}>
              Become a Reseller
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
