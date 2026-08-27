import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { db } from '../../services/api';
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Receipt,
  User,
  Bell,
  Headphones,
  LogOut,
  Store,
  TrendingUp,
  Users,
  Share2,
  Package,
  PlusCircle,
  CreditCard,
  DollarSign,
  Settings,
  UserCheck,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Percent,
  ShieldAlert,
} from 'lucide-react';
import { BRANDING } from '../../config/branding';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  portalType?: 'customer' | 'reseller' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  portalType: explicitPortalType,
}) => {
  const { user, logout, unreadCount } = useAuth();
  const { path, navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto detect portal type from path if not explicitly provided
  const derivedPortalType =
    explicitPortalType ||
    (path.startsWith('/admin') ? 'admin' : path.startsWith('/reseller') ? 'reseller' : 'customer');

  // Live count of orders needing payment review
  const pendingPaymentsCount = db.getOrders().filter((o) => o.orderStatus === 'payment_review').length;

  // Customer Navigation Links
  const customerNav = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Wallet & Deposits', path: '/dashboard/wallet', icon: Wallet },
    { label: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
    { label: 'My Profile', path: '/dashboard/profile', icon: User },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell, badge: unreadCount },
    { label: 'Support Tickets', path: '/dashboard/support', icon: Headphones },
  ];

  // Reseller Navigation Links
  const resellerNav = [
    { label: 'Overview', path: '/reseller', icon: LayoutDashboard },
    { label: 'Wholesale Products', path: '/reseller/products', icon: Store },
    { label: 'Place Client Order', path: '/reseller/place-order', icon: ShoppingBag },
    { label: 'Reseller Orders', path: '/reseller/orders', icon: Package },
    { label: 'Wallet & Add Funds', path: '/reseller/wallet', icon: Wallet },
    { label: 'Transactions', path: '/dashboard/transactions', icon: Receipt },
    { label: 'Profit Analytics', path: '/reseller/profit', icon: TrendingUp },
    { label: 'Client Directory', path: '/reseller/customers', icon: Users },
    { label: 'Referral Program', path: '/reseller/referral', icon: Share2 },
    { label: 'Support Desk', path: '/dashboard/support', icon: Headphones },
  ];

  // Admin Navigation Links - matching exact user requirements
  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard, badge: pendingPaymentsCount },
    { label: 'Currency Settings', path: '/admin/currency', icon: DollarSign },
    { label: 'Payment Settings', path: '/admin/payment-settings', icon: CreditCard },
    { label: 'Coupons & Promos', path: '/admin/coupons', icon: Percent },
    { label: 'Reseller Partners', path: '/admin/resellers', icon: Store },
    { label: 'Security & Audit', path: '/admin/security', icon: ShieldAlert },
    { label: 'Admin Account', path: '/admin/account', icon: UserCheck },
    { label: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  const currentNav =
    derivedPortalType === 'admin'
      ? adminNav
      : derivedPortalType === 'reseller'
      ? resellerNav
      : customerNav;

  const portalTitle =
    derivedPortalType === 'admin'
      ? 'Admin Dashboard'
      : derivedPortalType === 'reseller'
      ? 'Reseller Partner Hub'
      : 'Customer Portal';

  return (
    <div className="min-h-screen bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col md:flex-row transition-colors">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 light:bg-white border-b border-slate-800 light:border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 light:bg-slate-100 text-slate-300"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h4 className="font-bold text-sm text-white light:text-slate-900">{portalTitle}</h4>
            <p className="text-[10px] text-purple-400 font-medium">{user?.name || 'Guest'}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 flex items-center gap-1"
        >
          Marketplace
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950/95 light:bg-white border-r border-slate-800/80 light:border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Brand Logo & Back to Shop */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 light:border-slate-200">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm text-white light:text-slate-900">
                  {BRANDING.name}
                </span>
                <span className="block text-[10px] text-purple-400 font-bold uppercase">
                  {derivedPortalType}
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 text-xs flex items-center gap-1"
              title="Return to Public Shop"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Balance Card (for Customer/Reseller) */}
          {user && derivedPortalType !== 'admin' && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 light:from-purple-50 light:to-indigo-50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 light:text-slate-600">Wallet Balance</span>
                <button
                  onClick={() =>
                    navigate(derivedPortalType === 'reseller' ? '/reseller/wallet' : '/dashboard/wallet')
                  }
                  className="text-[10px] text-purple-400 hover:underline font-semibold"
                >
                  + Add Funds
                </button>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ${user.walletBalance.toFixed(2)}
              </p>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isCurrent =
                path === item.path ||
                (item.path !== '/dashboard' &&
                  item.path !== '/reseller' &&
                  item.path !== '/admin' &&
                  path.startsWith(item.path));

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                      : 'text-slate-300 light:text-slate-700 hover:bg-slate-900 light:hover:bg-slate-100 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {(item as any).badge && (item as any).badge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                      {(item as any).badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isCurrent ? 'opacity-100' : ''}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Signout */}
        <div className="pt-3 mt-2 border-t border-slate-800/80 light:border-slate-200 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 light:bg-slate-100">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white light:text-slate-900 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate(derivedPortalType === 'admin' ? '/login' : '/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
};
