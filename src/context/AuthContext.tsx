import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AdminAccountConfig } from '../types';
import { db } from '../services/api';
import { useToast } from './ToastContext';
import { INITIAL_USERS } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  adminAccount: AdminAccountConfig;
  login: (email: string, pass?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminChangePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  adminChangeUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string; referralCode?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: 'customer' | 'reseller' | 'admin' | 'guest') => void;
  refreshUser: () => void;
  updateProfile: (updated: Partial<User>) => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [adminAccount, setAdminAccount] = useState<AdminAccountConfig>(() => db.getAdminAccount());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { showToast } = useToast();

  const refreshUser = useCallback(() => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      const fresh = db.getUserById(currentUser.id) || currentUser;
      setUser(fresh);
      db.setCurrentUser(fresh);
      const notifs = db.getNotifications(fresh.id);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    } else {
      setUser(null);
      setUnreadCount(0);
    }
    setAdminAccount(db.getAdminAccount());
  }, []);

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      const fresh = db.getUserById(currentUser.id) || currentUser;
      setUser(fresh);
      const notifs = db.getNotifications(fresh.id);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    }
    setAdminAccount(db.getAdminAccount());
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const users = db.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'This account has been suspended by administration.' };
    }
    setUser(found);
    db.setCurrentUser(found);
    showToast('success', `Welcome back, ${found.name}!`, `Signed in as ${found.role.toUpperCase()}`);
    return { success: true };
  };

  const adminLogin = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const currentAdminAcc = db.getAdminAccount();
    const normalizedInput = usernameInput.trim().toLowerCase();
    const adminUser = db.getUserById('user-admin-1');

    const isValidUsername =
      normalizedInput === currentAdminAcc.username.toLowerCase() ||
      normalizedInput === 'sourovadmin' ||
      normalizedInput === 'admin@subnova.io';

    if (!isValidUsername) {
      return { success: false, error: 'Invalid admin username or email.' };
    }

    const isPasswordCorrect = await db.verifyAdminPassword(passwordInput);
    if (!isPasswordCorrect) {
      return { success: false, error: 'Incorrect administrator password.' };
    }

    // Set active admin user session
    const targetAdmin: User = adminUser || {
      id: 'user-admin-1',
      name: `${currentAdminAcc.username} (Super Admin)`,
      email: 'admin@subnova.io',
      phone: '+880 1712-345678',
      role: 'admin' as UserRole,
      status: 'active' as const,
      walletBalance: 12500.0,
      commissionBalance: 0,
      referralCode: 'SOUROV_MASTER',
      createdAt: '2026-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    setUser(targetAdmin);
    db.setCurrentUser(targetAdmin);
    setAdminAccount(currentAdminAcc);
    showToast('success', 'Admin Access Granted', `Logged in as Super Admin (${currentAdminAcc.username})`);
    return { success: true };
  };

  const adminChangePassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await db.updateAdminPassword(currentPass, newPass);
    if (res.success) {
      setAdminAccount(db.getAdminAccount());
      showToast('success', 'Password Updated', 'Your administrator password has been updated securely.');
    }
    return res;
  };

  const adminChangeUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    const res = db.updateAdminUsername(newUsername);
    if (res.success) {
      setAdminAccount(db.getAdminAccount());
      if (user && user.role === 'admin') {
        const fresh = db.getUserById('user-admin-1');
        if (fresh) setUser(fresh);
      }
      showToast('success', 'Username Updated', `Admin username changed to ${newUsername}.`);
    }
    return res;
  };

  const register = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    referralCode?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const users = db.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'customer',
      status: 'active',
      walletBalance: 25.0, // Welcome signup bonus!
      commissionBalance: 0,
      referralCode: `SN${Math.floor(1000 + Math.random() * 9000)}`,
      referredBy: data.referralCode,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };

    users.push(newUser);
    localStorage.setItem('subnova_users', JSON.stringify(users));

    // Welcome deposit transaction
    db.addTransaction({
      id: `tx-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      type: 'adjustment',
      amount: 25.0,
      balanceBefore: 0,
      balanceAfter: 25.0,
      currency: 'USD',
      description: 'Welcome Registration Loyalty Credit Bonus',
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    setUser(newUser);
    db.setCurrentUser(newUser);
    showToast('success', 'Account created successfully!', 'You received a $25.00 welcome credit bonus in your wallet.');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    db.setCurrentUser(null);
    showToast('info', 'Logged out', 'You have been signed out.');
  };

  const switchDemoRole = (role: 'customer' | 'reseller' | 'admin' | 'guest') => {
    if (role === 'guest') {
      setUser(null);
      db.setCurrentUser(null);
      showToast('info', 'Switched to Guest', 'Browsing marketplace as public visitor');
      return;
    }

    const users = db.getUsers();
    let targetUser: User | undefined;

    if (role === 'customer') {
      targetUser = users.find((u) => u.role === 'customer') || INITIAL_USERS[0];
    } else if (role === 'reseller') {
      targetUser = users.find((u) => u.role === 'reseller') || INITIAL_USERS[1];
    } else if (role === 'admin') {
      targetUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[2];
    }

    if (targetUser) {
      setUser(targetUser);
      db.setCurrentUser(targetUser);
      showToast('success', `Switched to Demo ${role.toUpperCase()}`, `Logged in as ${targetUser.name}`);
    }
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const merged: User = { ...user, ...updated };
    const saved = db.updateUser(merged);
    setUser(saved);
    showToast('success', 'Profile Updated', 'Your account preferences have been saved.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        isLoggedIn: Boolean(user),
        isAdmin: user?.role === 'admin',
        adminAccount,
        login,
        adminLogin,
        adminChangePassword,
        adminChangeUsername,
        register,
        logout,
        switchDemoRole,
        refreshUser,
        updateProfile,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

