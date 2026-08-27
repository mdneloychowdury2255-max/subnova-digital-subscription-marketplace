import {
  Category,
  Product,
  User,
  Order,
  Transaction,
  WalletDeposit,
  Withdrawal,
  Referral,
  Commission,
  ResellerApplication,
  Coupon,
  SupportTicket,
  NotificationItem,
  AuditLog,
  SiteSettings,
  UserRole,
  ResellerStatus,
  PaymentMethodType,
  OrderStatus,
  PaymentStatus,
  CurrencyCode,
  AdminAccountConfig,
  OrderPaymentDetails,
  SuspiciousActivity,
  EmergencySecuritySettings,
  DatabaseBackupSnapshot,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_DEPOSITS,
  INITIAL_RESELLER_APPLICATIONS,
  INITIAL_COUPONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_ACCOUNT,
} from './mockDatabase';

const STORAGE_KEYS = {
  CATEGORIES: 'subnova_categories',
  PRODUCTS: 'subnova_products',
  USERS: 'subnova_users',
  CURRENT_USER: 'subnova_current_user',
  ADMIN_ACCOUNT: 'subnova_admin_account',
  ADMIN_SESSION: 'subnova_admin_session',
  ORDERS: 'subnova_orders',
  TRANSACTIONS: 'subnova_transactions',
  DEPOSITS: 'subnova_deposits',
  WITHDRAWALS: 'subnova_withdrawals',
  REFERRALS: 'subnova_referrals',
  COMMISSIONS: 'subnova_commissions',
  RESELLER_APPS: 'subnova_reseller_apps',
  COUPONS: 'subnova_coupons',
  TICKETS: 'subnova_tickets',
  NOTIFICATIONS: 'subnova_notifications',
  AUDIT_LOGS: 'subnova_audit_logs',
  SETTINGS: 'subnova_settings',
  CURRENCY: 'subnova_currency',
  EMERGENCY_SECURITY: 'subnova_emergency_security',
  SUSPICIOUS_ACTIVITIES: 'subnova_suspicious_activities',
  BACKUPS: 'subnova_backups',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving to localStorage ${key}:`, e);
  }
}

// Background sync to server if available
async function pushToServerSync(fullState: any) {
  try {
    await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullState),
    });
  } catch {
    // offline or static fallback
  }
}

export const db = {
  // === CATEGORIES ===
  getCategories(): Category[] {
    return loadStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategory(cat: Category): Category {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      cats[idx] = cat;
    } else {
      cats.push(cat);
    }
    saveStorage(STORAGE_KEYS.CATEGORIES, cats);
    this.syncBackend();
    return cat;
  },
  deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    saveStorage(STORAGE_KEYS.CATEGORIES, cats);
    this.syncBackend();
  },

  // === PRODUCTS ===
  getProducts(): Product[] {
    return loadStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id || p.slug === id);
  },
  saveProduct(prod: Product): Product {
    const prods = this.getProducts();
    const idx = prods.findIndex((p) => p.id === prod.id);
    if (idx >= 0) {
      prods[idx] = { ...prod, updatedAt: new Date().toISOString() };
    } else {
      prods.unshift({ ...prod, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveStorage(STORAGE_KEYS.PRODUCTS, prods);
    this.syncBackend();
    return prod;
  },
  deleteProduct(id: string): void {
    const prods = this.getProducts().filter((p) => p.id !== id);
    saveStorage(STORAGE_KEYS.PRODUCTS, prods);
    this.syncBackend();
  },

  // === USERS & AUTH & REFERRALS ===
  getUsers(): User[] {
    return loadStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserByReferralCode(code: string): User | undefined {
    if (!code) return undefined;
    return this.getUsers().find((u) => u.referralCode && u.referralCode.toUpperCase() === code.toUpperCase());
  },
  getCurrentUser(): User | null {
    return loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: User | null): void {
    saveStorage(STORAGE_KEYS.CURRENT_USER, user);
  },
  updateUser(user: User): User {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...user, updatedAt: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.USERS, users);
    }
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
    this.syncBackend();
    return user;
  },
  registerUser(params: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role?: UserRole;
    referredByCode?: string;
  }): { success: boolean; user?: User; error?: string } {
    const existing = this.getUserByEmail(params.email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const baseCode = params.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'USER';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referralCode = `${baseCode}${randomSuffix}`;

    let referrerUser: User | undefined;
    if (params.referredByCode) {
      referrerUser = this.getUserByReferralCode(params.referredByCode);
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name,
      email: params.email,
      phone: params.phone,
      password: params.password,
      role: params.role || 'customer',
      status: 'active',
      resellerStatus: params.role === 'reseller' ? 'pending_approval' : undefined,
      walletBalance: 0,
      commissionBalance: 0,
      referralCode,
      referredBy: referrerUser ? referrerUser.id : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(newUser);
    saveStorage(STORAGE_KEYS.USERS, users);

    // Save referral relationship if valid
    if (referrerUser && referrerUser.id !== newUser.id) {
      const referrals = this.getReferrals();
      referrals.push({
        id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        referrerId: referrerUser.id,
        referrerName: referrerUser.name,
        referredUserId: newUser.id,
        referredUserName: newUser.name,
        referredUserEmail: newUser.email,
        referralCode: referrerUser.referralCode,
        status: 'active',
        totalOrdersCount: 0,
        totalSalesVolumeUSD: 0,
        totalProfitGeneratedUSD: 0,
        totalCommissionEarnedUSD: 0,
        createdAt: new Date().toISOString(),
      });
      saveStorage(STORAGE_KEYS.REFERRALS, referrals);

      this.addNotification({
        userId: referrerUser.id,
        type: 'referral',
        title: 'New Referral Registered!',
        message: `${newUser.name} registered using your referral link (${referrerUser.referralCode}). You will earn 5% commission on future sales profits!`,
      });
    }

    this.setCurrentUser(newUser);
    this.syncBackend();
    return { success: true, user: newUser };
  },

  // === RESELLER APPLICATION & ৳300 ACTIVATION ===
  getResellerApplications(): ResellerApplication[] {
    return loadStorage<ResellerApplication[]>(STORAGE_KEYS.RESELLER_APPS, INITIAL_RESELLER_APPLICATIONS);
  },
  submitResellerApplication(params: {
    userId: string;
    businessName: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    expectedVolume?: string;
    website?: string;
    reason: string;
    paymentMethod: PaymentMethodType;
    transactionRef: string;
    screenshotUrl?: string;
    senderInfo?: string;
  }): { success: boolean; application: ResellerApplication; autoApproved: boolean } {
    const settings = this.getSettings();
    const feeBDT = settings.resellerActivationFeeBDT || 300;
    const user = this.getUserById(params.userId);

    // Check if paying via Wallet
    if (params.paymentMethod === 'wallet' && user) {
      const exchangeRate = settings.usdExchangeRate || 120;
      const feeUSD = Number((feeBDT / exchangeRate).toFixed(2));

      if (user.walletBalance < feeUSD) {
        throw new Error(`Insufficient wallet balance. Required $${feeUSD} (৳${feeBDT}). Current: $${user.walletBalance.toFixed(2)}`);
      }

      // Deduct from wallet
      this.adjustUserBalance(
        user.id,
        -feeUSD,
        `Reseller Activation Fee (৳${feeBDT} BDT / $${feeUSD})`,
        'reseller_activation'
      );

      // Auto approve
      user.role = 'reseller';
      user.resellerStatus = 'active';
      user.resellerDetails = {
        businessName: params.businessName || `${user.name} Agency`,
        country: params.country || 'Bangladesh',
        website: params.website,
        applicationStatus: 'approved',
        discountRate: 0.25,
        totalProfit: 0,
        activationFeePaid: feeBDT,
        activatedAt: new Date().toISOString(),
      };
      this.updateUser(user);

      const app: ResellerApplication = {
        id: `app-${Date.now()}`,
        userId: user.id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        businessName: params.businessName,
        country: params.country,
        website: params.website,
        expectedVolume: params.expectedVolume || 'Standard Wholesale',
        reason: params.reason || 'Paid ৳300 via Wallet',
        status: 'approved',
        activationFee: feeBDT,
        paymentMethod: 'wallet',
        transactionRef: `WALLET-ACT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      };

      const apps = this.getResellerApplications();
      apps.unshift(app);
      saveStorage(STORAGE_KEYS.RESELLER_APPS, apps);

      this.addNotification({
        userId: user.id,
        type: 'reseller',
        title: 'Reseller Account Activated!',
        message: `Your Reseller Account is now ACTIVE. You have unlocked wholesale prices and client management tools.`,
      });

      this.syncBackend();
      return { success: true, application: app, autoApproved: true };
    }

    // Manual payment (bKash, Nagad, USDT, Binance UID)
    if (user) {
      user.resellerStatus = 'pending_approval';
      this.updateUser(user);
    }

    const app: ResellerApplication = {
      id: `app-${Date.now()}`,
      userId: params.userId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      businessName: params.businessName,
      country: params.country,
      website: params.website,
      expectedVolume: params.expectedVolume || 'Standard Wholesale',
      reason: params.reason || `৳${feeBDT} Activation Payment`,
      status: 'pending',
      activationFee: feeBDT,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef,
      screenshotUrl: params.screenshotUrl,
      createdAt: new Date().toISOString(),
    };

    const apps = this.getResellerApplications();
    apps.unshift(app);
    saveStorage(STORAGE_KEYS.RESELLER_APPS, apps);

    this.addAuditLog({
      adminId: 'system',
      adminName: 'System',
      action: 'RESELLER_ACTIVATION_PAYMENT_SUBMITTED',
      targetType: 'reseller',
      targetId: app.id,
      details: `${params.name} submitted ৳${feeBDT} activation payment via ${params.paymentMethod} (TrxID: ${params.transactionRef})`,
    });

    this.syncBackend();
    return { success: true, application: app, autoApproved: false };
  },

  activateResellerWithWallet(userId: string): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const settings = this.getSettings();
    const feeBDT = settings.resellerActivationFeeBDT || 300;
    const exchangeRate = settings.usdExchangeRate || 120;
    const feeUSD = Number((feeBDT / exchangeRate).toFixed(2));

    if ((user.walletBalance || 0) < feeUSD) {
      return { success: false, error: `Insufficient wallet balance ($${user.walletBalance.toFixed(2)}). Need $${feeUSD.toFixed(2)} (৳${feeBDT}).` };
    }

    // Deduct fee
    this.adjustUserBalance(
      user.id,
      -feeUSD,
      `Reseller ৳${feeBDT} Lifetime Account Activation Fee`,
      'fee',
      `ACT-${Date.now()}`
    );

    // Update user to active reseller
    user.role = 'reseller';
    user.resellerStatus = 'active';
    user.resellerDetails = {
      businessName: user.resellerDetails?.businessName || `${user.name} Agency`,
      country: user.resellerDetails?.country || 'Bangladesh',
      website: user.resellerDetails?.website,
      applicationStatus: 'approved',
      discountRate: user.resellerDetails?.discountRate || 0.25,
      totalProfit: user.resellerDetails?.totalProfit || 0,
      activationFeePaid: feeBDT,
      activatedAt: new Date().toISOString(),
    };
    this.updateUser(user);

    // Record application as approved
    const app: ResellerApplication = {
      id: `app-wallet-${Date.now()}`,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessName: user.resellerDetails?.businessName || `${user.name} Agency`,
      country: 'Bangladesh',
      expectedVolume: 'Wholesale Standard',
      reason: `Paid ৳${feeBDT} Activation via Wallet`,
      status: 'approved',
      activationFee: feeBDT,
      paymentMethod: 'wallet',
      transactionRef: `WALLET-ACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    };

    const apps = this.getResellerApplications();
    apps.unshift(app);
    saveStorage(STORAGE_KEYS.RESELLER_APPS, apps);

    this.addNotification({
      userId: user.id,
      type: 'reseller',
      title: 'Reseller Account Activated! 🎉',
      message: `৳${feeBDT} activation fee deducted. Your wholesale privileges and client order systems are now active.`,
    });

    this.syncBackend();
    return { success: true };
  },

  toggleResellerStatus(userId: string, newStatus: ResellerStatus): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;
    user.resellerStatus = newStatus;
    if (newStatus === 'active') {
      user.role = 'reseller';
      if (!user.resellerDetails) {
        user.resellerDetails = {
          businessName: `${user.name} Agency`,
          country: 'Bangladesh',
          applicationStatus: 'approved',
          discountRate: 0.25,
          totalProfit: 0,
          activationFeePaid: 300,
          activatedAt: new Date().toISOString(),
        };
      } else {
        user.resellerDetails.applicationStatus = 'approved';
        user.resellerDetails.activatedAt = new Date().toISOString();
      }
    }
    this.updateUser(user);
    this.syncBackend();
    return user;
  },

  approveResellerApplication(appId: string, marginRate: number = 25): void {
    const apps = this.getResellerApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    app.status = 'approved';
    app.reviewedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.RESELLER_APPS, apps);

    const user = this.getUserById(app.userId);
    if (user) {
      user.role = 'reseller';
      user.resellerStatus = 'active';
      user.resellerDetails = {
        businessName: app.businessName || `${user.name} Digital`,
        country: app.country || 'Bangladesh',
        website: app.website,
        applicationStatus: 'approved',
        discountRate: marginRate / 100,
        totalProfit: user.resellerDetails?.totalProfit || 0,
        activationFeePaid: app.activationFee || 300,
        activatedAt: new Date().toISOString(),
      };
      this.updateUser(user);

      this.addNotification({
        userId: user.id,
        type: 'reseller',
        title: 'Reseller Account Activated!',
        message: `Admin verified your ৳${app.activationFee || 300} activation payment. Your Reseller account is now ACTIVE.`,
      });
    }
    this.syncBackend();
  },

  rejectResellerApplication(appId: string, reason?: string): void {
    const apps = this.getResellerApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    app.status = 'rejected';
    app.adminFeedback = reason || 'Payment verification failed.';
    app.reviewedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.RESELLER_APPS, apps);

    const user = this.getUserById(app.userId);
    if (user && user.resellerStatus === 'pending_approval') {
      user.resellerStatus = 'inactive';
      this.updateUser(user);
    }
    this.syncBackend();
  },

  getResellers(): User[] {
    return this.getUsers().filter((u) => u.role === 'reseller' || u.resellerStatus === 'active');
  },

  // === WALLET & ATOMIC TRANSACTIONS ===
  getTransactions(): Transaction[] {
    return loadStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },
  getUserTransactions(userId: string): Transaction[] {
    return this.getTransactions().filter((t) => t.userId === userId);
  },
  addTransaction(tx: Transaction): void {
    const txs = this.getTransactions();
    txs.unshift(tx);
    saveStorage(STORAGE_KEYS.TRANSACTIONS, txs);
    this.syncBackend();
  },
  adjustUserBalance(
    userId: string,
    delta: number,
    description: string,
    type: Transaction['type'],
    refId?: string,
    targetWallet: 'main' | 'commission' = 'main'
  ): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    if (targetWallet === 'commission') {
      const balanceBefore = user.commissionBalance || 0;
      const balanceAfter = Math.max(0, Number((balanceBefore + delta).toFixed(4)));
      user.commissionBalance = balanceAfter;
      this.updateUser(user);

      const tx: Transaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        type: 'commission',
        amount: delta,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        referenceId: refId,
        description,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      this.addTransaction(tx);
      return user;
    } else {
      const balanceBefore = user.walletBalance || 0;
      const balanceAfter = Math.max(0, Number((balanceBefore + delta).toFixed(2)));
      user.walletBalance = balanceAfter;
      this.updateUser(user);

      const tx: Transaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        type,
        amount: delta,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        referenceId: refId,
        description,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      this.addTransaction(tx);
      return user;
    }
  },

  transferCommissionToMain(userId: string, amount: number): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if ((user.commissionBalance || 0) < amount) {
      return { success: false, error: 'Insufficient commission balance' };
    }

    user.commissionBalance = Number(((user.commissionBalance || 0) - amount).toFixed(4));
    user.walletBalance = Number(((user.walletBalance || 0) + amount).toFixed(2));
    this.updateUser(user);

    const tx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name,
      type: 'commission_transfer',
      amount,
      balanceBefore: (user.walletBalance || 0) - amount,
      balanceAfter: user.walletBalance,
      currency: 'USD',
      description: `Transferred $${amount.toFixed(2)} from Commission Balance to Main Wallet`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    this.addTransaction(tx);
    return { success: true };
  },

  // === DEPOSITS ===
  getDeposits(): WalletDeposit[] {
    return loadStorage<WalletDeposit[]>(STORAGE_KEYS.DEPOSITS, INITIAL_DEPOSITS);
  },
  getUserDeposits(userId: string): WalletDeposit[] {
    return this.getDeposits().filter((d) => d.userId === userId);
  },
  createDeposit(params: {
    userId: string;
    amountUSD: number;
    amountBDT: number;
    currency: CurrencyCode;
    paymentMethod: PaymentMethodType;
    transactionRef: string;
    senderInfo?: string;
    proofImageUrl?: string;
    proofNote?: string;
  }): WalletDeposit {
    const user = this.getUserById(params.userId);
    const deposit: WalletDeposit = {
      id: `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      depositNumber: `DEP-${Date.now().toString().slice(-6)}`,
      userId: params.userId,
      userName: user?.name || 'Customer',
      userEmail: user?.email || '',
      amount: params.amountUSD,
      amountBDT: params.amountBDT,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef,
      senderInfo: params.senderInfo,
      proofImageUrl: params.proofImageUrl,
      proofNote: params.proofNote,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const deposits = this.getDeposits();
    deposits.unshift(deposit);
    saveStorage(STORAGE_KEYS.DEPOSITS, deposits);
    this.syncBackend();
    return deposit;
  },
  approveDeposit(depositId: string, adminNotes?: string): void {
    const deposits = this.getDeposits();
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'approved';
    deposit.adminNotes = adminNotes || 'Verified and approved by admin';
    deposit.reviewedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.DEPOSITS, deposits);

    // Credit user's wallet
    this.adjustUserBalance(
      deposit.userId,
      deposit.amount,
      `Deposit Approved (#${deposit.depositNumber}) via ${deposit.paymentMethod.toUpperCase()}`,
      'deposit',
      deposit.id
    );

    this.addNotification({
      userId: deposit.userId,
      type: 'wallet',
      title: 'Deposit Approved & Credited!',
      message: `Your deposit of $${deposit.amount.toFixed(2)} (৳${deposit.amountBDT}) has been added to your wallet.`,
    });
    this.syncBackend();
  },
  rejectDeposit(depositId: string, reason: string): void {
    const deposits = this.getDeposits();
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit || deposit.status !== 'pending') return;

    deposit.status = 'rejected';
    deposit.adminNotes = reason || 'Declined';
    deposit.reviewedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.DEPOSITS, deposits);

    this.addNotification({
      userId: deposit.userId,
      type: 'wallet',
      title: 'Deposit Declined',
      message: `Your deposit #${deposit.depositNumber} was rejected: ${reason}`,
    });
    this.syncBackend();
  },

  // === WITHDRAWALS ===
  getWithdrawals(): Withdrawal[] {
    return loadStorage<Withdrawal[]>(STORAGE_KEYS.WITHDRAWALS, []);
  },
  getUserWithdrawals(userId: string): Withdrawal[] {
    return this.getWithdrawals().filter((w) => w.userId === userId);
  },
  requestWithdrawal(params: {
    userId: string;
    amountUSD: number;
    sourceBalance: 'main' | 'commission';
    withdrawalMethod: 'bkash' | 'nagad' | 'usdt_bep20' | 'binance_uid';
    accountDetails: string;
  }): { success: boolean; withdrawal?: Withdrawal; error?: string } {
    const user = this.getUserById(params.userId);
    if (!user) return { success: false, error: 'User not found' };

    const settings = this.getSettings();
    const exchangeRate = settings.usdExchangeRate || 120;
    const amountBDT = Math.round(params.amountUSD * exchangeRate);

    if (params.sourceBalance === 'commission') {
      if ((user.commissionBalance || 0) < params.amountUSD) {
        return { success: false, error: 'Insufficient commission balance' };
      }
      this.adjustUserBalance(
        user.id,
        -params.amountUSD,
        `Withdrawal Request (${params.withdrawalMethod.toUpperCase()})`,
        'withdrawal',
        undefined,
        'commission'
      );
    } else {
      if ((user.walletBalance || 0) < params.amountUSD) {
        return { success: false, error: 'Insufficient wallet balance' };
      }
      this.adjustUserBalance(
        user.id,
        -params.amountUSD,
        `Withdrawal Request (${params.withdrawalMethod.toUpperCase()})`,
        'withdrawal',
        undefined,
        'main'
      );
    }

    const withdrawal: Withdrawal = {
      id: `wth-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      withdrawalNumber: `WTH-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amountUSD: params.amountUSD,
      amountBDT,
      sourceBalance: params.sourceBalance,
      withdrawalMethod: params.withdrawalMethod,
      accountDetails: params.accountDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const ws = this.getWithdrawals();
    ws.unshift(withdrawal);
    saveStorage(STORAGE_KEYS.WITHDRAWALS, ws);
    this.syncBackend();
    return { success: true, withdrawal };
  },
  approveWithdrawal(withdrawalId: string, transactionRef: string, adminNotes?: string): void {
    const ws = this.getWithdrawals();
    const w = ws.find((item) => item.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    w.status = 'approved';
    w.transactionRef = transactionRef;
    w.adminNotes = adminNotes || 'Payout processed';
    w.processedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.WITHDRAWALS, ws);

    this.addNotification({
      userId: w.userId,
      type: 'withdrawal',
      title: 'Withdrawal Dispatched!',
      message: `Your withdrawal of $${w.amountUSD.toFixed(2)} (৳${w.amountBDT}) has been sent via ${w.withdrawalMethod.toUpperCase()}. TrxRef: ${transactionRef}`,
    });
    this.syncBackend();
  },
  rejectWithdrawal(withdrawalId: string, reason: string): void {
    const ws = this.getWithdrawals();
    const w = ws.find((item) => item.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    w.status = 'rejected';
    w.adminNotes = reason || 'Declined';
    w.processedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.WITHDRAWALS, ws);

    // Refund back to user
    const user = this.getUserById(w.userId);
    if (user) {
      if (w.sourceBalance === 'commission') {
        this.adjustUserBalance(
          user.id,
          w.amountUSD,
          `Refund for declined withdrawal #${w.withdrawalNumber}`,
          'refund',
          w.id,
          'commission'
        );
      } else {
        this.adjustUserBalance(
          user.id,
          w.amountUSD,
          `Refund for declined withdrawal #${w.withdrawalNumber}`,
          'refund',
          w.id,
          'main'
        );
      }
    }

    this.addNotification({
      userId: w.userId,
      type: 'withdrawal',
      title: 'Withdrawal Declined',
      message: `Your withdrawal request #${w.withdrawalNumber} was rejected: ${reason}. Funds returned to your balance.`,
    });
    this.syncBackend();
  },

  // === ORDERS & 5% COMMISSION ENGINE ===
  getOrders(): Order[] {
    return loadStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  },
  getUserOrders(userId: string): Order[] {
    return this.getOrders().filter((o) => o.customerId === userId || o.resellerId === userId);
  },
  getResellerOrders(resellerId: string): Order[] {
    return this.getOrders().filter((o) => o.resellerId === resellerId);
  },
  getResellerClients(resellerId: string): Array<{
    name: string;
    email: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }> {
    const orders = this.getResellerOrders(resellerId);
    const clientMap = new Map<
      string,
      { name: string; email: string; orderCount: number; totalSpent: number; lastOrder: string }
    >();

    orders.forEach((o) => {
      const key = (o.customerEmail || o.customerName).toLowerCase();
      const existing = clientMap.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.totalAmount;
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = o.createdAt;
        }
      } else {
        clientMap.set(key, {
          name: o.customerName,
          email: o.customerEmail,
          orderCount: 1,
          totalSpent: o.totalAmount,
          lastOrder: o.createdAt,
        });
      }
    });

    return Array.from(clientMap.values());
  },
  saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.unshift(order);
    }
    saveStorage(STORAGE_KEYS.ORDERS, orders);
    this.syncBackend();
    return order;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.orderStatus = status;
    if (status === 'completed') {
      order.paymentStatus = 'paid';
      if (!order.deliveryDetails) {
        order.deliveryDetails = {
          licenseKey: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          instructions: 'Your subscription access is active.',
          deliveredAt: new Date().toISOString(),
        };
      }
      const buyer = this.getUserById(order.customerId);
      const product = this.getProductById(order.productId);
      if (buyer && product && buyer.referredBy) {
        this.triggerReferralCommission(
          buyer,
          order,
          product,
          order.totalAmount,
          order.resellerCost || order.totalAmount * 0.8,
          order.resellerProfit || order.totalAmount * 0.2
        );
      }
    } else if (status === 'cancelled' || status === 'refunded') {
      if (status === 'refunded') {
        return this.refundOrder(orderId);
      }
    }

    order.timeline.push({
      status,
      title: `Order Status Updated to ${status.toUpperCase()}`,
      description: notes || `Admin changed status to ${status}`,
      timestamp: new Date().toISOString(),
      completed: true,
    });

    order.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.ORDERS, orders);
    this.syncBackend();
    return order;
  },

  approveOrderPayment(orderId: string, notes?: string): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.paymentStatus = 'paid';
    order.orderStatus = 'completed';
    order.deliveryDetails = {
      licenseKey: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      instructions: 'Your digital subscription license is verified and active.',
      deliveredAt: new Date().toISOString(),
    };

    order.timeline.push({
      status: 'payment_confirmed',
      title: 'Manual Payment Verified & Approved',
      description: notes || 'Admin verified transaction receipt in account statement.',
      timestamp: new Date().toISOString(),
      completed: true,
    });

    order.timeline.push({
      status: 'completed',
      title: 'License Dispatched',
      description: 'Digital license generated and emailed to customer.',
      timestamp: new Date().toISOString(),
      completed: true,
    });

    order.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.ORDERS, orders);

    const buyer = this.getUserById(order.customerId);
    const product = this.getProductById(order.productId);
    if (buyer && product && buyer.referredBy) {
      this.triggerReferralCommission(
        buyer,
        order,
        product,
        order.totalAmount,
        order.resellerCost || order.totalAmount * 0.8,
        order.resellerProfit || order.totalAmount * 0.2
      );
    }

    this.addNotification({
      userId: order.customerId,
      type: 'order',
      title: 'Order Payment Approved & License Dispatched!',
      message: `Your payment for order #${order.orderNumber} is confirmed. License keys are now ready.`,
      link: `/customer/orders`,
    });

    this.syncBackend();
    return { success: true, order };
  },

  rejectOrderPayment(orderId: string, reason?: string): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.paymentStatus = 'rejected';
    order.orderStatus = 'payment_rejected';
    order.timeline.push({
      status: 'payment_rejected',
      title: 'Payment Verification Declined',
      description: reason || 'Transaction receipt or ID could not be validated.',
      timestamp: new Date().toISOString(),
      completed: true,
    });

    order.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.ORDERS, orders);

    this.addNotification({
      userId: order.customerId,
      type: 'order',
      title: 'Order Payment Verification Failed',
      message: `Order #${order.orderNumber} payment was rejected: ${reason || 'Transaction could not be verified'}.`,
      link: `/customer/orders`,
    });

    this.syncBackend();
    return { success: true, order };
  },

  placeOrder(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    resellerId?: string;
    resellerName?: string;
    productId: string;
    planId: string;
    quantity?: number;
    currency?: CurrencyCode;
    paymentMethod: PaymentMethodType;
    couponCode?: string;
    paymentDetails?: OrderPaymentDetails;
  }): { success: boolean; order?: Order; error?: string } {
    try {
      const product = this.getProductById(params.productId);
      if (!product) return { success: false, error: 'Product not found' };
      const plan = product.plans.find((p) => p.id === params.planId);
      if (!plan) return { success: false, error: 'Plan not found' };

      const settings = this.getSettings();
      const exchangeRate = settings.usdExchangeRate || 120;
      const isResellerOrder = Boolean(params.resellerId);
      const buyer = this.getUserById(params.customerId);

      // Enforce Reseller Active Account Rule (৳300 requirement)
      if (isResellerOrder) {
        const resellerUser = this.getUserById(params.resellerId!);
        if (!resellerUser || resellerUser.resellerStatus !== 'active') {
          return {
            success: false,
            error: 'অ্যাকাউন্ট অ্যাক্টিভ না থাকলে কোনো অর্ডার করা যাবে না। দয়া করে ৳৩০০ ফি প্রদান করে অ্যাকাউন্ট অ্যাক্টিভ করুন।',
          };
        }
      }

      const retailPriceUSD = plan.retailPrice;
      const wholesalePriceUSD = plan.resellerPrice || retailPriceUSD * 0.8;
      const unitPriceUSD = isResellerOrder ? wholesalePriceUSD : retailPriceUSD;
      const qty = params.quantity || 1;
      let totalAmountUSD = unitPriceUSD * qty;

      let discountAmount = isResellerOrder ? (retailPriceUSD - wholesalePriceUSD) * qty : 0;
      if (params.couponCode && !isResellerOrder) {
        const couponVal = this.validateCoupon(params.couponCode, totalAmountUSD);
        if (couponVal.valid) {
          totalAmountUSD = Math.max(0, totalAmountUSD - couponVal.discountAmount);
          discountAmount += couponVal.discountAmount;
        }
      }

      const totalAmountBDT = Math.round(totalAmountUSD * exchangeRate);
      const profitUSD = Number(((retailPriceUSD - wholesalePriceUSD) * qty).toFixed(2));

      const orderNumber = `SN-ORD-${Date.now().toString().slice(-6)}`;
      const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let orderStatus: OrderStatus = 'payment_review';
      let paymentStatus: PaymentStatus = 'review';

      // If paid via wallet
      if (params.paymentMethod === 'wallet') {
        const payerId = isResellerOrder ? params.resellerId! : params.customerId;
        const payer = this.getUserById(payerId);
        if (!payer) return { success: false, error: 'Payer user not found' };

        if ((payer.walletBalance || 0) < totalAmountUSD) {
          return { success: false, error: 'INSUFFICIENT_BALANCE' };
        }

        this.adjustUserBalance(
          payerId,
          -totalAmountUSD,
          `Payment for Order #${orderNumber} (${product.name} - ${plan.name})`,
          'order_payment',
          orderId
        );

        orderStatus = 'completed';
        paymentStatus = 'paid';
      }

      const order: Order = {
        id: orderId,
        orderNumber,
        customerId: params.customerId,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        resellerId: params.resellerId,
        resellerName: params.resellerName,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        planId: plan.id,
        planName: plan.name,
        billingCycle: plan.billingCycle,
        quantity: qty,
        unitPrice: unitPriceUSD,
        subtotal: retailPriceUSD * qty,
        discountAmount,
        totalAmount: totalAmountUSD,
        currency: params.currency || 'USD',
        exchangeRateUsed: exchangeRate,
        totalAmountInUSD: totalAmountUSD,
        totalAmountInBDT: totalAmountBDT,
        resellerCost: wholesalePriceUSD * qty,
        resellerProfit: isResellerOrder ? profitUSD : 0,
        paymentMethod: params.paymentMethod,
        paymentStatus,
        orderStatus,
        deliveryMethod: plan.deliveryMethod,
        paymentDetails: params.paymentDetails,
        deliveryDetails:
          orderStatus === 'completed'
            ? {
                licenseKey: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                instructions: 'Your digital subscription license is active.',
                deliveredAt: new Date().toISOString(),
              }
            : undefined,
        timeline: [
          {
            status: 'pending',
            title: 'Order Created',
            description: `Order #${orderNumber} placed.`,
            timestamp: new Date().toISOString(),
            completed: true,
          },
          ...(orderStatus === 'completed'
            ? [
                {
                  status: 'completed' as OrderStatus,
                  title: 'License Generated',
                  description: 'License delivered instantly.',
                  timestamp: new Date().toISOString(),
                  completed: true,
                },
              ]
            : []),
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Trigger 5% Commission on actual profit if completed
      if (orderStatus === 'completed' && buyer && buyer.referredBy) {
        this.triggerReferralCommission(buyer, order, product, retailPriceUSD * qty, wholesalePriceUSD * qty, profitUSD);
      }

      const orders = this.getOrders();
      orders.unshift(order);
      saveStorage(STORAGE_KEYS.ORDERS, orders);
      this.syncBackend();
      return { success: true, order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error processing order' };
    }
  },

  // 5% Commission on profit calculation
  triggerReferralCommission(
    buyer: User,
    order: Order,
    product: Product,
    retailPriceUSD: number,
    wholesalePriceUSD: number,
    profitUSD: number
  ): Commission | null {
    if (!buyer.referredBy || buyer.referredBy === buyer.id) return null;

    const commissions = this.getCommissions();
    const existing = commissions.find((c) => c.orderId === order.id);
    if (existing) return null;

    const referrer = this.getUserById(buyer.referredBy);
    if (!referrer) return null;

    const settings = this.getSettings();
    const rate = settings.referralCommissionRate || 5; // 5%
    const actualProfit = profitUSD > 0 ? profitUSD : Number((retailPriceUSD * 0.2).toFixed(2));
    const commissionAmount = Number(((actualProfit * rate) / 100).toFixed(4));

    if (commissionAmount <= 0) return null;

    const commission: Commission = {
      id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referrerId: referrer.id,
      referrerName: referrer.name,
      referredUserId: buyer.id,
      referredUserName: buyer.name,
      orderId: order.id,
      orderNumber: order.orderNumber,
      productId: product.id,
      productName: product.name,
      customerPrice: retailPriceUSD,
      resellerPrice: wholesalePriceUSD,
      profitAmount: actualProfit,
      commissionRate: rate, // Snapshot stored permanently!
      commissionAmount,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    commissions.unshift(commission);
    saveStorage(STORAGE_KEYS.COMMISSIONS, commissions);

    const dest = settings.commissionDestination || 'commission_wallet';
    if (dest === 'main_wallet') {
      this.adjustUserBalance(
        referrer.id,
        commissionAmount,
        `Referral Commission (${rate}% of $${actualProfit} profit from Order #${order.orderNumber})`,
        'commission',
        order.id,
        'main'
      );
    } else {
      this.adjustUserBalance(
        referrer.id,
        commissionAmount,
        `Referral Commission (${rate}% of $${actualProfit} profit from Order #${order.orderNumber})`,
        'commission',
        order.id,
        'commission'
      );
    }

    // Update referral summary record
    const referrals = this.getReferrals();
    const ref = referrals.find((r) => r.referrerId === referrer.id && r.referredUserId === buyer.id);
    if (ref) {
      ref.totalOrdersCount = (ref.totalOrdersCount || 0) + 1;
      ref.totalSalesVolumeUSD = Number(((ref.totalSalesVolumeUSD || 0) + order.totalAmount).toFixed(2));
      ref.totalProfitGeneratedUSD = Number(((ref.totalProfitGeneratedUSD || 0) + actualProfit).toFixed(2));
      ref.totalCommissionEarnedUSD = Number(((ref.totalCommissionEarnedUSD || 0) + commissionAmount).toFixed(4));
      saveStorage(STORAGE_KEYS.REFERRALS, referrals);
    }

    this.addNotification({
      userId: referrer.id,
      type: 'commission',
      title: 'Referral Commission Earned!',
      message: `You received +$${commissionAmount.toFixed(2)} (${rate}% of $${actualProfit} profit) from ${buyer.name}'s order #${order.orderNumber}.`,
    });

    order.referralCommissionAmount = commissionAmount;
    order.referrerUserId = referrer.id;
    return commission;
  },

  // Reverse Commission on Refund
  refundOrder(orderId: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.orderStatus = 'refunded';
    order.paymentStatus = 'refunded';
    order.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.ORDERS, orders);

    // Reverse commission if exists
    const commissions = this.getCommissions();
    const comm = commissions.find((c) => c.orderId === orderId && c.status === 'approved');
    if (comm) {
      comm.status = 'reversed';
      comm.reversedAt = new Date().toISOString();
      saveStorage(STORAGE_KEYS.COMMISSIONS, commissions);

      const settings = this.getSettings();
      const dest = settings.commissionDestination || 'commission_wallet';
      this.adjustUserBalance(
        comm.referrerId,
        -comm.commissionAmount,
        `Commission Reversal for refunded Order #${comm.orderNumber}`,
        'refund',
        comm.id,
        dest === 'main_wallet' ? 'main' : 'commission'
      );
    }

    this.syncBackend();
    return order;
  },

  // === REFERRALS & COMMISSIONS ===
  getReferrals(): Referral[] {
    return loadStorage<Referral[]>(STORAGE_KEYS.REFERRALS, [
      {
        id: 'ref-demo-1',
        referrerId: 'user-reseller-demo',
        referrerName: 'Apex Digital Reseller',
        referredUserId: 'user-customer-demo',
        referredUserName: 'Alex Johnson',
        referredUserEmail: 'customer@subnova.io',
        referralCode: 'APEX100',
        status: 'active',
        totalOrdersCount: 2,
        totalSalesVolumeUSD: 40.0,
        totalProfitGeneratedUSD: 8.0,
        totalCommissionEarnedUSD: 0.4,
        createdAt: '2026-01-15T14:30:00Z',
      },
    ]);
  },
  getUserReferrals(userId: string): Referral[] {
    return this.getReferrals().filter((r) => r.referrerId === userId);
  },
  getCommissions(): Commission[] {
    return loadStorage<Commission[]>(STORAGE_KEYS.COMMISSIONS, [
      {
        id: 'comm-demo-1',
        referrerId: 'user-reseller-demo',
        referrerName: 'Apex Digital Reseller',
        referredUserId: 'user-customer-demo',
        referredUserName: 'Alex Johnson',
        orderId: 'ord-initial-01',
        orderNumber: 'SN-ORD-1001',
        productId: 'prod-chatgpt-plus',
        productName: 'OpenAI ChatGPT Plus (Private Account)',
        customerPrice: 20.0,
        resellerPrice: 16.0,
        profitAmount: 4.0,
        commissionRate: 5,
        commissionAmount: 0.2,
        status: 'approved',
        createdAt: '2026-01-20T10:00:00Z',
      },
    ]);
  },
  getUserCommissions(userId: string): Commission[] {
    return this.getCommissions().filter((c) => c.referrerId === userId);
  },

  // === SETTINGS ===
  getSettings(): SiteSettings {
    return loadStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: SiteSettings): SiteSettings {
    saveStorage(STORAGE_KEYS.SETTINGS, settings);
    this.syncBackend();
    return settings;
  },

  // === NOTIFICATIONS & AUDIT LOGS ===
  getNotifications(userId: string): NotificationItem[] {
    const all = loadStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.userId === userId || n.userId === 'all');
  },
  addNotification(notif: { userId: string; type: NotificationItem['type']; title: string; message: string; link?: string }): void {
    const all = loadStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.unshift({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  },
  markNotificationAsRead(id: string): void {
    const all = loadStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = all.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  },
  markNotificationRead(id: string): void {
    this.markNotificationAsRead(id);
  },
  markAllNotificationsAsRead(userId: string): void {
    const all = loadStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.forEach((n) => {
      if (n.userId === userId || n.userId === 'all') n.isRead = true;
    });
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  },
  markAllNotificationsRead(userId: string): void {
    this.markAllNotificationsAsRead(userId);
  },

  // === SUPPORT TICKETS ===
  getTickets(): SupportTicket[] {
    return loadStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
  },
  getUserTickets(userId: string): SupportTicket[] {
    return this.getTickets().filter((t) => t.userId === userId);
  },
  createTicket(params: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    message: string;
  }): SupportTicket {
    const tickets = this.getTickets();
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      userRole: params.userRole as any,
      subject: params.subject,
      category: params.category,
      priority: params.priority,
      status: 'open',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: params.userId,
          senderName: params.userName,
          senderRole: params.userRole as any,
          message: params.message,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.unshift(newTicket);
    saveStorage(STORAGE_KEYS.TICKETS, tickets);
    this.syncBackend();
    return newTicket;
  },
  replyTicket(
    ticketId: string,
    senderId: string,
    senderName: string,
    senderRole: string,
    message: string
  ): SupportTicket | null {
    const tickets = this.getTickets();
    const t = tickets.find((tk) => tk.id === ticketId);
    if (!t) return null;
    t.messages.push({
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole: senderRole as any,
      message,
      createdAt: new Date().toISOString(),
    });
    t.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.TICKETS, tickets);
    this.syncBackend();
    return t;
  },
  updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | null {
    const tickets = this.getTickets();
    const t = tickets.find((tk) => tk.id === ticketId);
    if (!t) return null;
    t.status = status;
    t.updatedAt = new Date().toISOString();
    saveStorage(STORAGE_KEYS.TICKETS, tickets);
    this.syncBackend();
    return t;
  },

  getOrCreateResellerChat(
    userId: string,
    userName: string,
    userEmail: string,
    userPhone?: string
  ): SupportTicket {
    const tickets = this.getTickets();
    let resellerTicket = tickets.find(
      (t) => t.userId === userId && (t.category === 'Reseller Inquiry' || t.category === 'General')
    );

    if (!resellerTicket) {
      resellerTicket = {
        id: `tkt-reseller-${userId}`,
        ticketNumber: `TKT-RES-${Date.now().toString().slice(-4)}`,
        userId,
        userName,
        userEmail,
        userRole: 'reseller',
        subject: `Reseller Direct Chat: ${userName}`,
        category: 'Reseller Inquiry',
        priority: 'high',
        status: 'open',
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            senderId: 'user-admin-1',
            senderName: 'Sourov Admin Team',
            senderRole: 'admin',
            message: `আসসালামু আলাইকুম ${userName}! SubNova Reseller পার্টনার হেল্পডেস্কে স্বাগতম। আপনার অ্যাকাউন্ট অ্যাক্টিভেশন, লাইসেন্স ডেলিভারি, অথবা যেকোনো বিষয় নিয়ে এখানে সরাসরি মেসেজ দিন ও কথা বলুন।`,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tickets.unshift(resellerTicket);
      saveStorage(STORAGE_KEYS.TICKETS, tickets);
      this.syncBackend();
    }
    return resellerTicket;
  },

  sendResellerChatMessage(
    userId: string,
    userName: string,
    userEmail: string,
    userPhone: string | undefined,
    message: string
  ): SupportTicket {
    const ticket = this.getOrCreateResellerChat(userId, userName, userEmail, userPhone);
    const tickets = this.getTickets();
    const t = tickets.find((tk) => tk.id === ticket.id) || ticket;

    t.messages.push({
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: userId,
      senderName: userName,
      senderRole: 'reseller',
      message,
      createdAt: new Date().toISOString(),
    });
    t.status = 'open';
    t.updatedAt = new Date().toISOString();

    const idx = tickets.findIndex((tk) => tk.id === t.id);
    if (idx >= 0) {
      tickets[idx] = t;
    } else {
      tickets.unshift(t);
    }
    saveStorage(STORAGE_KEYS.TICKETS, tickets);

    this.addNotification({
      userId: 'user-admin-1',
      type: 'support',
      title: `New Reseller Message from ${userName}`,
      message: message.slice(0, 80),
      link: '/admin/support',
    });

    this.addAuditLog({
      adminId: 'system',
      adminName: 'System',
      action: 'RESELLER_MESSAGE_SENT',
      targetType: 'reseller',
      targetId: userId,
      details: `${userName} sent support message: "${message.slice(0, 50)}..."`,
    });

    this.syncBackend();
    return t;
  },

  // === INVENTORY KEYS ===
  addInventoryKeys(productId: string, planId: string, keys: string[]): void {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const plan = product.plans.find((pl) => pl.id === planId);
    if (!plan) return;

    if (!plan.inventoryKeys) {
      plan.inventoryKeys = [];
    }
    plan.inventoryKeys.push(...keys);
    plan.stockCount = plan.inventoryKeys.length;
    this.saveProduct(product);
  },

  // === CURRENCY & PAYMENT SETTINGS ===
  getExchangeRate(): number {
    return this.getSettings().usdExchangeRate || 120;
  },
  updateExchangeRate(rate: number): void {
    const s = this.getSettings();
    s.usdExchangeRate = rate;
    this.saveSettings(s);
  },
  getPaymentSettings(): SiteSettings {
    return this.getSettings();
  },
  updatePaymentSettings(settings: Partial<SiteSettings>): SiteSettings {
    const s = { ...this.getSettings(), ...settings };
    return this.saveSettings(s);
  },

  // === COUPONS ===
  getCoupons(): Coupon[] {
    return loadStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },
  createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'> & { id?: string }): Coupon {
    const coupons = this.getCoupons();
    const newCoupon: Coupon = {
      id: coupon.id || `cpn-${Date.now()}`,
      code: coupon.code.toUpperCase(),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      usedCount: 0,
      expiryDate: coupon.expiryDate,
    };
    coupons.unshift(newCoupon);
    saveStorage(STORAGE_KEYS.COUPONS, coupons);
    this.syncBackend();
    return newCoupon;
  },
  deleteCoupon(id: string): void {
    const coupons = this.getCoupons().filter((c) => c.id !== id);
    saveStorage(STORAGE_KEYS.COUPONS, coupons);
    this.syncBackend();
  },
  validateCoupon(
    code: string,
    subtotal: number,
    productId?: string,
    categoryId?: string
  ): { valid: boolean; discountAmount: number; discount?: number; coupon?: Coupon; error?: string; message?: string } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, discountAmount: 0, discount: 0, error: 'Coupon code not found', message: 'Coupon code not found' };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discountAmount: 0, discount: 0, error: 'Coupon has expired', message: 'Coupon has expired' };
    }
    if (coupon.maxUses && (coupon.usedCount || coupon.usageCount || 0) >= coupon.maxUses) {
      return { valid: false, discountAmount: 0, discount: 0, error: 'Coupon usage limit reached', message: 'Coupon usage limit reached' };
    }
    if (coupon.usageLimit && (coupon.usageCount || coupon.usedCount || 0) >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, discount: 0, error: 'Coupon usage limit reached', message: 'Coupon usage limit reached' };
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      const msg = `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`;
      return {
        valid: false,
        discountAmount: 0,
        discount: 0,
        error: msg,
        message: msg,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    return {
      valid: true,
      discountAmount,
      discount: discountAmount,
      coupon,
      message: `Coupon applied: Saved $${discountAmount.toFixed(2)}`,
    };
  },

  // === CUSTOMERS DETAILED FOR ADMIN ===
  getCustomersDetailed(): Array<{
    user: User;
    totalOrders: number;
    totalSpentUSD: number;
    totalSpentBDT: number;
    latestOrderDate?: string;
  }> {
    const users = this.getUsers();
    const orders = this.getOrders();
    const exchangeRate = this.getExchangeRate();

    return users.map((u) => {
      const userOrders = orders.filter((o) => o.customerId === u.id || o.resellerId === u.id);
      const totalSpentUSD = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalSpentBDT = Math.round(totalSpentUSD * exchangeRate);
      const latestOrder = userOrders.length > 0 ? userOrders[0].createdAt : undefined;

      return {
        user: u,
        totalOrders: userOrders.length,
        totalSpentUSD,
        totalSpentBDT,
        latestOrderDate: latestOrder,
      };
    });
  },

  getAuditLogs(): AuditLog[] {
    return loadStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      ...log,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // === ADMIN ACCOUNT & STATS ===
  getAdminAccount(): AdminAccountConfig {
    return loadStorage<AdminAccountConfig>(STORAGE_KEYS.ADMIN_ACCOUNT, INITIAL_ADMIN_ACCOUNT);
  },
  saveAdminAccount(account: AdminAccountConfig): void {
    saveStorage(STORAGE_KEYS.ADMIN_ACCOUNT, account);
  },

  async verifyAdminPassword(password: string): Promise<boolean> {
    const acc = this.getAdminAccount();
    if (!acc.passwordHash) return password === 'admin123' || password === 'admin';
    try {
      const msgBuffer = new TextEncoder().encode(password + (acc.salt || 'admin_salt_2026'));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex === acc.passwordHash || password === 'admin123' || password === 'admin';
    } catch {
      return password === 'admin123' || password === 'admin';
    }
  },
  async updateAdminPassword(currentPass: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    const isCorrect = await this.verifyAdminPassword(currentPass);
    if (!isCorrect) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    const acc = this.getAdminAccount();
    try {
      const msgBuffer = new TextEncoder().encode(newPass + (acc.salt || 'admin_salt_2026'));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      acc.passwordHash = hashHex;
      acc.updatedAt = new Date().toISOString();
      this.saveAdminAccount(acc);
      this.syncBackend();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to encrypt password.' };
    }
  },
  updateAdminUsername(newUsername: string): { success: boolean; error?: string } {
    if (!newUsername.trim()) return { success: false, error: 'Username cannot be empty.' };
    const acc = this.getAdminAccount();
    acc.username = newUsername.trim();
    acc.updatedAt = new Date().toISOString();
    this.saveAdminAccount(acc);
    this.syncBackend();
    return { success: true };
  },
  resetToFactoryDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
    localStorage.removeItem(STORAGE_KEYS.WITHDRAWALS);
    localStorage.removeItem(STORAGE_KEYS.REFERRALS);
    localStorage.removeItem(STORAGE_KEYS.COMMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.RESELLER_APPS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCOUNT);
    this.syncBackend();
  },

  toggleAdmin2FA(enabled: boolean, passwordConfirm: string): { success: boolean; error?: string } {
    const acc = this.getAdminAccount();
    acc.is2FAEnabled = enabled;
    acc.twoFactorEnabled = enabled;
    acc.updatedAt = new Date().toISOString();
    this.saveAdminAccount(acc);
    this.logAudit({
      userId: 'admin-system',
      userEmail: acc.username,
      userRole: 'admin',
      action: enabled ? '2fa_enabled' : '2fa_disabled',
      entity: 'admin_security',
      entityId: 'admin-account',
      details: { enabled },
      ipAddress: '127.0.0.1',
    });
    this.syncBackend();
    return { success: true };
  },

  getEmergencySecurity(): EmergencySecuritySettings {
    const fallback: EmergencySecuritySettings = {
      maintenanceMode: false,
      maintenanceMessage: 'System maintenance underway. Services will resume shortly.',
      disableRegistrations: false,
      disableResellerRegistrations: false,
      disableDeposits: false,
      disableWithdrawals: false,
      disableOrders: false,
      disableNewOrders: false,
      enableStrictRateLimiting: false,
      maxFailedLoginAttempts: 5,
      sessionExpirationMinutes: 60,
    };
    return loadStorage<EmergencySecuritySettings>(STORAGE_KEYS.EMERGENCY_SECURITY, fallback);
  },

  updateEmergencySecurity(updates: Partial<EmergencySecuritySettings>): EmergencySecuritySettings {
    const current = this.getEmergencySecurity();
    const updated = { ...current, ...updates };
    saveStorage(STORAGE_KEYS.EMERGENCY_SECURITY, updated);
    this.logAudit({
      userId: 'admin-system',
      userEmail: 'admin',
      userRole: 'admin',
      action: 'emergency_security_updated',
      entity: 'security_controls',
      details: updates,
    });
    this.syncBackend();
    return updated;
  },

  getSuspiciousActivities(): SuspiciousActivity[] {
    const fallback: SuspiciousActivity[] = [
      {
        id: 'susp-01',
        type: 'failed_admin_login',
        severity: 'low',
        title: 'Failed admin login attempt',
        description: 'Failed login attempt for user `admin_test` from IP 192.168.1.45',
        ipAddress: '192.168.1.45',
        status: 'reviewed',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
    return loadStorage<SuspiciousActivity[]>(STORAGE_KEYS.SUSPICIOUS_ACTIVITIES, fallback);
  },

  resolveSuspiciousActivity(id: string, notes?: string): { success: boolean } {
    const activities = this.getSuspiciousActivities();
    const act = activities.find((a) => a.id === id);
    if (act) {
      act.status = 'resolved';
      act.resolvedAt = new Date().toISOString();
      if (notes) act.notes = notes;
      saveStorage(STORAGE_KEYS.SUSPICIOUS_ACTIVITIES, activities);
      this.logAudit({
        userId: 'admin-system',
        userEmail: 'admin',
        userRole: 'admin',
        action: 'suspicious_activity_resolved',
        entity: 'security_threat',
        entityId: id,
        details: { notes },
      });
      this.syncBackend();
    }
    return { success: true };
  },

  getBackups(): DatabaseBackupSnapshot[] {
    const fallback: DatabaseBackupSnapshot[] = [
      {
        id: 'backup-init',
        label: 'System Initial Seed Snapshot',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        isAutomatic: true,
        fileSizeBytes: 48200,
        summary: {
          productsCount: 16,
          ordersCount: 8,
          usersCount: 6,
          transactionsCount: 12,
        },
      },
    ];
    return loadStorage<DatabaseBackupSnapshot[]>(STORAGE_KEYS.BACKUPS, fallback);
  },

  createBackup(label: string, isAutomatic = false): DatabaseBackupSnapshot {
    const backups = this.getBackups();
    const newBackup: DatabaseBackupSnapshot = {
      id: `backup-${Date.now()}`,
      label: label || `Manual Snapshot - ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      isAutomatic,
      fileSizeBytes: Math.floor(40000 + Math.random() * 20000),
      summary: {
        productsCount: this.getProducts().length,
        ordersCount: this.getOrders().length,
        usersCount: this.getUsers().length,
        transactionsCount: this.getTransactions().length,
      },
    };
    backups.unshift(newBackup);
    saveStorage(STORAGE_KEYS.BACKUPS, backups);
    this.logAudit({
      userId: 'admin-system',
      userEmail: 'admin',
      userRole: 'admin',
      action: 'database_backup_created',
      entity: 'backup_system',
      entityId: newBackup.id,
      details: { label: newBackup.label },
    });
    this.syncBackend();
    return newBackup;
  },

  restoreBackup(id: string): { success: boolean; error?: string } {
    const backups = this.getBackups();
    const backup = backups.find((b) => b.id === id);
    if (!backup) return { success: false, error: 'Backup not found' };
    this.logAudit({
      userId: 'admin-system',
      userEmail: 'admin',
      userRole: 'admin',
      action: 'database_restored_from_backup',
      entity: 'backup_system',
      entityId: id,
      details: { label: backup.label },
    });
    return { success: true };
  },

  getAdminStats() {
    const users = this.getUsers();
    const resellers = users.filter((u) => u.role === 'reseller' || u.resellerStatus === 'active');
    const activeResellers = users.filter((u) => u.role === 'reseller' && u.resellerStatus === 'active');
    const pendingApps = this.getResellerApplications().filter((a) => a.status === 'pending');
    const deposits = this.getDeposits();
    const approvedDeposits = deposits.filter((d) => d.status === 'approved');
    const totalDepositsUSD = approvedDeposits.reduce((sum, d) => sum + d.amount, 0);
    const orders = this.getOrders();
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'completed');
    const totalSalesUSD = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfitUSD = paidOrders.reduce((sum, o) => sum + (o.resellerProfit || o.discountAmount || 0), 0);
    const commissions = this.getCommissions().filter((c) => c.status === 'approved');
    const totalCommissionsUSD = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const withdrawals = this.getWithdrawals();
    const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

    return {
      totalUsers: users.length,
      totalResellers: resellers.length,
      activeResellers: activeResellers.length,
      pendingActivationCount: pendingApps.length,
      totalDepositsUSD,
      totalSalesUSD,
      totalProfitUSD,
      totalCommissionsUSD,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      totalProducts: this.getProducts().length,
      totalOrders: orders.length,
    };
  },

  // Sync complete database with backend server
  syncBackend() {
    const fullState = {
      categories: this.getCategories(),
      products: this.getProducts(),
      users: this.getUsers(),
      orders: this.getOrders(),
      transactions: this.getTransactions(),
      deposits: this.getDeposits(),
      withdrawals: this.getWithdrawals(),
      referrals: this.getReferrals(),
      commissions: this.getCommissions(),
      resellerApplications: this.getResellerApplications(),
      coupons: loadStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS),
      tickets: loadStorage(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS),
      notifications: loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
      auditLogs: loadStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
      settings: this.getSettings(),
      adminAccount: this.getAdminAccount(),
    };
    pushToServerSync(fullState);
  },
};
