import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Home, Package, Store, Layers, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { user, role } = useAuth();
  const { path, navigate } = useNavigation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (role === 'admin') return '/admin';
    if (role === 'reseller') return '/reseller/dashboard';
    return '/dashboard';
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/products', icon: Package },
    { label: 'Reseller', path: '/reseller', icon: Store },
    { label: 'Portal', path: getDashboardPath(), icon: user ? Layers : User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 light:bg-white/95 backdrop-blur-xl border-t border-slate-800/80 light:border-slate-200 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? path === '/'
            : path.startsWith(item.path);

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-purple-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-500'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-purple-400' : ''}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
