import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface NavigationContextType {
  path: string;
  navigate: (to: string, state?: unknown) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [pathname, search] = to.split('?');
    const newSearch = search ? `?${search}` : '';
    window.history.pushState({}, '', `${pathname}${newSearch}`);
    setPath(pathname);
    setSearchParams(new URLSearchParams(newSearch));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // Extract dynamic params from common routes
  const getParams = (): Record<string, string> => {
    const p: Record<string, string> = {};
    const parts = path.split('/').filter(Boolean);

    // /products/:id or /product/:id
    if ((parts[0] === 'products' || parts[0] === 'product') && parts[1]) {
      p.id = parts[1];
    }
    // /dashboard/orders/:id
    if (parts[0] === 'dashboard' && parts[1] === 'orders' && parts[2]) {
      p.id = parts[2];
    }
    // /legal/:page
    if (parts[0] === 'legal' && parts[1]) {
      p.page = parts[1];
    }
    return p;
  };

  return (
    <NavigationContext.Provider value={{ path, navigate, params: getParams(), searchParams, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
