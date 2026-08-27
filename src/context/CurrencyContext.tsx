import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CurrencyCode } from '../types';
import { db } from '../services/api';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  currencySymbol: string;
  formatPrice: (amountUSD: number, overrideCurrency?: CurrencyCode) => string;
  convertPrice: (amountUSD: number, overrideCurrency?: CurrencyCode) => number;
  formatUSD: (amountUSD: number) => string;
  formatBDT: (amountBDT: number) => string;
  refreshRate: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'subnova_selected_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'BDT' || saved === 'USD') return saved;
    } catch {
      // fallback
    }
    return 'BDT'; // Default to BDT as requested
  });

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    return db.getExchangeRate();
  });

  const refreshRate = useCallback(() => {
    setExchangeRate(db.getExchangeRate());
  }, []);

  useEffect(() => {
    // Listen for storage events (e.g. settings change in another tab or action)
    const handleStorage = () => {
      refreshRate();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshRate]);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(STORAGE_KEY, newCurrency);
    } catch {
      // ignore
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === 'BDT' ? 'USD' : 'BDT');
  }, [currency, setCurrency]);

  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  const convertPrice = useCallback(
    (amountUSD: number, overrideCurrency?: CurrencyCode): number => {
      const target = overrideCurrency || currency;
      if (target === 'BDT') {
        return Number((amountUSD * exchangeRate).toFixed(2));
      }
      return Number(amountUSD.toFixed(2));
    },
    [currency, exchangeRate]
  );

  const formatPrice = useCallback(
    (amountUSD: number, overrideCurrency?: CurrencyCode): string => {
      const target = overrideCurrency || currency;
      if (target === 'BDT') {
        const bdtValue = amountUSD * exchangeRate;
        // If it's a whole number or close, show integer formatting, else 2 decimals
        const formatted = bdtValue % 1 === 0 ? bdtValue.toLocaleString() : bdtValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `৳${formatted}`;
      }
      return `$${amountUSD.toFixed(2)}`;
    },
    [currency, exchangeRate]
  );

  const formatUSD = useCallback((amountUSD: number): string => {
    return `$${amountUSD.toFixed(2)}`;
  }, []);

  const formatBDT = useCallback((amountBDT: number): string => {
    return `৳${amountBDT.toLocaleString()}`;
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        currencySymbol,
        formatPrice,
        convertPrice,
        formatUSD,
        formatBDT,
        refreshRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
