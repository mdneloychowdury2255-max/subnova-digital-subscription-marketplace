import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useCurrency } from '../../context/CurrencyContext';
import { db } from '../../services/api';
import { BRANDING } from '../../config/branding';
import {
  Sparkles,
  Search,
  Bell,
  User as UserIcon,
  Store,
  ShoppingBag,
  Wallet,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const Navbar: React.FC = () => {
  const { user, role, logout, unreadCount, isAdmin } = useAuth();
  const { path, navigate } = useNavigation();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  const notifications = user ? db.getNotifications(user.id) : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (route: string) => {
    navigate(route);
    setIsMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'reseller') return '/reseller';
    return '/dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 light:bg-white/85 backdrop-blur-xl border-b border-slate-800/70 light:border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
                  {BRANDING.name}
                </span>
                <span className="hidden sm:block text-[10px] text-purple-400 font-semibold tracking-wider uppercase -mt-1">
                  Subscriptions
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleNav('/products')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  path.startsWith('/products')
                    ? 'text-purple-400 bg-purple-500/10 font-semibold'
                    : 'text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => handleNav('/reseller')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  path.startsWith('/reseller') && !path.startsWith('/reseller/dashboard')
                    ? 'text-purple-400 bg-purple-500/10 font-semibold'
                    : 'text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-purple-400" />
                Reseller Program
              </button>
              <button
                onClick={() => handleNav('/reseller/apply')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
              >
                Apply as Reseller
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Currency Switcher Dropdown */}
            <div className="relative" ref={currencyRef}>
              <button
                id="header-currency-switcher-btn"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                  currency === 'BDT'
                    ? 'bg-pink-950/40 light:bg-pink-50 border-pink-500/40 text-pink-300 light:text-pink-700 hover:border-pink-500'
                    : 'bg-cyan-950/40 light:bg-cyan-50 border-cyan-500/40 text-cyan-300 light:text-cyan-700 hover:border-cyan-500'
                }`}
                title="Switch Currency between ৳ BDT and $ USD"
              >
                <span className="font-mono text-sm font-bold">{currency === 'BDT' ? '৳' : '$'}</span>
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl p-1.5 z-50 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800/80 light:border-slate-200">
                    Select Currency
                  </div>
                  <button
                    onClick={() => {
                      setCurrency('BDT');
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium transition-colors ${
                      currency === 'BDT'
                        ? 'bg-pink-600/20 text-pink-300 font-bold'
                        : 'text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center font-mono">৳</span>
                      <span>BDT (Taka)</span>
                    </span>
                    {currency === 'BDT' && <span className="text-pink-400">✓</span>}
                  </button>

                  <button
                    onClick={() => {
                      setCurrency('USD');
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium transition-colors ${
                      currency === 'USD'
                        ? 'bg-cyan-600/20 text-cyan-300 font-bold'
                        : 'text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center font-mono">$</span>
                      <span>USD (Dollar)</span>
                    </span>
                    {currency === 'USD' && <span className="text-cyan-400">✓</span>}
                  </button>

                  <div className="px-2.5 py-1 text-[10px] text-slate-400 border-t border-slate-800/80 light:border-slate-200 font-mono text-center">
                    1 USD = ৳{exchangeRate} BDT
                  </div>
                </div>
              )}
            </div>

            {/* Global Search Bar Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-slate-400 hover:text-slate-200 text-xs transition-all hover:border-slate-700"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-slate-800 light:bg-slate-200 text-slate-400 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Admin Portal Shortcut if Admin */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 transition-colors"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin</span>
              </button>
            )}

            {/* Notifications Menu */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 text-slate-300 hover:text-white light:text-slate-700 hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl p-4 z-50">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 light:border-slate-200">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white light:text-slate-900">Notifications</h4>
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} unread
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          db.markAllNotificationsRead(user.id);
                          setIsNotifOpen(false);
                        }}
                        className="text-xs text-purple-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              db.markNotificationRead(n.id);
                              if (n.link) navigate(n.link);
                              setIsNotifOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              n.isRead
                                ? 'bg-slate-900/40 border-slate-800/50 text-slate-400 light:bg-slate-50 light:border-slate-200'
                                : 'bg-purple-950/20 border-purple-500/30 text-slate-200 light:bg-purple-50'
                            }`}
                          >
                            <p className="font-semibold text-white light:text-slate-900">{n.title}</p>
                            <p className="mt-0.5 text-slate-400 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu or Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 hover:border-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white light:text-slate-900 leading-none">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] font-medium text-purple-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 light:bg-white border border-slate-800 light:border-slate-200 shadow-2xl p-2 z-50 text-xs">
                    <div className="p-2.5 mb-1 border-b border-slate-800 light:border-slate-200">
                      <p className="font-bold text-white light:text-slate-900">{user.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between bg-slate-950/60 light:bg-slate-100 p-2 rounded-lg">
                        <span className="text-slate-400">Wallet:</span>
                        <span className="font-mono font-bold text-emerald-400">${user.walletBalance.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate(getDashboardRoute());
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-purple-600 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {role === 'admin' ? 'Admin Portal' : role === 'reseller' ? 'Reseller Hub' : 'My Dashboard'}
                    </button>

                    {role === 'customer' && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/dashboard/orders');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          My Orders
                        </button>
                        <button
                          onClick={() => {
                            navigate('/dashboard/wallet');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Wallet & Deposits
                        </button>
                      </>
                    )}

                    {role === 'reseller' && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/reseller/products');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <Store className="w-3.5 h-3.5" />
                          Wholesale Catalog
                        </button>
                        <button
                          onClick={() => {
                            navigate('/reseller/wallet');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Reseller Wallet
                        </button>
                      </>
                    )}

                    {role === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            navigate('/admin/payments');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                          Verify Payments
                        </button>
                        <button
                          onClick={() => {
                            navigate('/admin/account');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-200 light:text-slate-800 hover:bg-slate-800 light:hover:bg-slate-100 flex items-center gap-2 transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          Admin Account
                        </button>
                      </>
                    )}

                    <div className="my-1 border-t border-slate-800 light:border-slate-200" />

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 light:text-slate-800 hover:bg-white/10 light:hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 light:bg-slate-100 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 light:bg-white p-4 space-y-2 backdrop-blur-xl">
            <button
              onClick={() => handleNav('/products')}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-900 light:hover:bg-slate-100 font-semibold text-sm flex items-center justify-between"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={() => handleNav('/reseller')}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-900 light:hover:bg-slate-100 font-semibold text-sm flex items-center justify-between"
            >
              <span>Reseller Program & Benefits</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={() => handleNav('/reseller/apply')}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-900 light:hover:bg-slate-100 font-semibold text-sm flex items-center justify-between"
            >
              <span>Apply For Reseller Account</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
            {user && (
              <button
                onClick={() => handleNav(getDashboardRoute())}
                className="w-full text-left p-3 rounded-xl bg-purple-600 text-white font-semibold text-sm flex items-center justify-between"
              >
                <span>Go to {role === 'admin' ? 'Admin Panel' : role === 'reseller' ? 'Reseller Hub' : 'My Dashboard'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
