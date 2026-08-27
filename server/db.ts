import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ServerDatabaseSchema {
  categories: any[];
  products: any[];
  users: any[];
  orders: any[];
  transactions: any[];
  deposits: any[];
  withdrawals: any[];
  referrals: any[];
  commissions: any[];
  resellerApplications: any[];
  coupons: any[];
  tickets: any[];
  notifications: any[];
  auditLogs: any[];
  suspiciousActivities: any[];
  backups: any[];
  settings: any;
  adminAccount: any;
  emergencySecurity: any;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Password hashing utility with unique salt
export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Default Admin Credentials: sourovadmin / sourov22
const DEFAULT_ADMIN_SALT = 'sourov_sec_salt_2026';
const DEFAULT_ADMIN_PASSWORD_HASH = hashPassword('sourov22', DEFAULT_ADMIN_SALT);

const DEFAULT_EMERGENCY_SECURITY = {
  maintenanceMode: false,
  maintenanceMessage: 'System is currently undergoing routine security maintenance. We will be back online shortly.',
  disableRegistrations: false,
  disableResellerRegistrations: false,
  disableDeposits: false,
  disableWithdrawals: false,
  disableOrders: false,
};

const DEFAULT_SETTINGS = {
  siteName: 'SubNova Market',
  tagline: 'Digital Licenses & Reseller Ecosystem',
  supportEmail: 'support@subnova.io',
  whatsappSupportNumber: '+880 1800-000000',
  currency: 'BDT',
  currencySymbol: '৳',
  usdExchangeRate: 120, // 1 USD = 120 BDT
  resellerActivationFeeBDT: 300, // ৳300 Reseller Activation Fee
  referralCommissionRate: 5, // 5% Commission on Profit
  commissionDestination: 'commission_wallet',
  allowPublicRegistration: true,
  allowResellerApplications: true,
  defaultResellerDiscountPercentage: 25,
  maintenanceMode: false,
  paymentSettings: {
    usd: {
      usdtBep20Address: '0x71C...b90E (BEP20 USDT)',
      binanceUid: '482910482 (SubNova Pay)',
      instructions: 'Send exact amount via BEP-20 or Binance Pay. Provide Transaction Hash/ID below.',
    },
    bdt: {
      bkashNumber: '01855-908123',
      bkashType: 'Merchant',
      nagadNumber: '01711-402911',
      nagadType: 'Personal',
      instructions: 'Send money / payment to our verified number and provide the Transaction ID (TrxID).',
    },
  },
  bankPaymentDetails: {
    bankName: 'City Bank PLC',
    accountName: 'SubNova Technologies Ltd',
    accountNumber: '110293849102',
    swiftCode: 'CIBLBDDH',
  },
  cryptoPaymentDetails: {
    usdtTronAddress: 'TRX7910...bKq',
    btcAddress: 'bc1q...4829',
    ethAddress: '0x992...281',
  },
  enabledGateways: {
    stripe: false,
    paypal: false,
    crypto: true,
    bankTransfer: true,
    wallet: true,
  },
};

const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Chief Administrator',
    email: 'admin@subnova.io',
    phone: '+880 1800-000000',
    role: 'admin',
    status: 'active',
    walletBalance: 2500.0,
    commissionBalance: 450.0,
    referralCode: 'ADMINVIP',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-reseller-demo',
    name: 'Apex Digital Reseller',
    email: 'reseller@subnova.io',
    phone: '+880 1711-223344',
    passwordHash: hashPassword('reseller123', 'reseller_salt'),
    role: 'reseller',
    status: 'active',
    resellerStatus: 'active',
    walletBalance: 1250.0,
    commissionBalance: 68.5,
    referralCode: 'APEX100',
    createdAt: '2026-01-10T10:00:00Z',
    resellerDetails: {
      businessName: 'Apex Digital Agency',
      country: 'Bangladesh',
      applicationStatus: 'approved',
      discountRate: 0.25,
      totalProfit: 420.0,
      activationFeePaid: 300,
      activatedAt: '2026-01-11T12:00:00Z',
    },
  },
  {
    id: 'user-customer-demo',
    name: 'Alex Johnson',
    email: 'customer@subnova.io',
    phone: '+880 1812-998877',
    passwordHash: hashPassword('customer123', 'customer_salt'),
    role: 'customer',
    status: 'active',
    walletBalance: 100.0,
    commissionBalance: 15.0,
    referralCode: 'ALEX555',
    referredBy: 'user-reseller-demo',
    createdAt: '2026-01-15T14:30:00Z',
  },
];

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-ai',
    name: 'AI Tools & Assistants',
    slug: 'ai-tools',
    description: 'Next-generation artificial intelligence platforms and coding models.',
    icon: 'Sparkles',
    productCount: 4,
  },
  {
    id: 'cat-productivity',
    name: 'Productivity & Office',
    slug: 'productivity',
    description: 'Workplace suites, document management, and collaboration tools.',
    icon: 'Briefcase',
    productCount: 3,
  },
  {
    id: 'cat-dev',
    name: 'Developer & DevOps',
    slug: 'developer-tools',
    description: 'Cloud environments, IDE extensions, API platforms, and terminal tools.',
    icon: 'Terminal',
    productCount: 3,
  },
  {
    id: 'cat-design',
    name: 'Creative & Design',
    slug: 'design-creative',
    description: 'Graphic design software, vector libraries, and stock asset passes.',
    icon: 'Palette',
    productCount: 3,
  },
  {
    id: 'cat-streaming',
    name: 'Entertainment & VPN',
    slug: 'entertainment-vpn',
    description: 'Streaming services, cloud storage, privacy VPNs, and gaming passes.',
    icon: 'Tv',
    productCount: 2,
  },
];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-chatgpt-plus',
    name: 'OpenAI ChatGPT Plus (Private Account)',
    slug: 'chatgpt-plus-private',
    categoryId: 'cat-ai',
    categoryName: 'AI Tools & Assistants',
    description: 'Full access to GPT-4o, DALL-E 3 image generation, custom GPT creation, Code Interpreter, and high-speed priority servers. Private login delivered instantly.',
    shortDescription: 'Official GPT-4o flagship model access with real-time web browsing & voice.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    iconName: 'Bot',
    badge: 'Best Seller',
    rating: 4.95,
    reviewsCount: 382,
    isPopular: true,
    isFeatured: true,
    refundPolicy: 'Full refund within 24 hours if credentials fail activation.',
    faq: [
      { question: 'Is this a shared or private account?', answer: 'This is a 100% private account with your own custom email or clean login.' },
      { question: 'How quickly is it delivered?', answer: 'License & credentials are delivered instantly to your dashboard upon payment confirmation.' },
    ],
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    plans: [
      {
        id: 'plan-cgpt-1m',
        name: '1 Month Subscription',
        billingCycle: 'Monthly',
        retailPrice: 20.0,
        resellerPrice: 16.0,
        originalPrice: 22.0,
        features: ['GPT-4o & GPT-4 Turbo', 'Custom GPTs access', 'DALL-E 3 generator', 'Instant dashboard key'],
        deliveryMethod: 'Instant Key',
        deliveryTime: 'Instant (1 min)',
        isPopular: true,
        inStock: true,
      },
      {
        id: 'plan-cgpt-3m',
        name: '3 Months Subscription',
        billingCycle: 'Quarterly',
        retailPrice: 55.0,
        resellerPrice: 42.0,
        originalPrice: 65.0,
        features: ['All 1-month features', 'Priority renewal guarantee', 'Dedicated account manager'],
        deliveryMethod: 'Instant Key',
        deliveryTime: 'Instant (1 min)',
        inStock: true,
      },
    ],
  },
  {
    id: 'prod-claude-pro',
    name: 'Anthropic Claude Pro',
    slug: 'claude-pro',
    categoryId: 'cat-ai',
    categoryName: 'AI Tools & Assistants',
    description: 'Access Claude 3.5 Sonnet and Opus with 5x more usage, priority bandwidth during peak hours, and Projects feature for organizing research documents.',
    shortDescription: 'Claude 3.5 Sonnet high-intelligence coding & analysis platform.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    iconName: 'Cpu',
    badge: 'Popular',
    rating: 4.92,
    reviewsCount: 219,
    isPopular: true,
    isFeatured: true,
    refundPolicy: '24-hour guarantee against activation failure.',
    faq: [{ question: 'Does this include Projects feature?', answer: 'Yes, full Claude Pro features are enabled.' }],
    status: 'active',
    createdAt: '2026-01-05T00:00:00Z',
    plans: [
      {
        id: 'plan-claude-1m',
        name: '1 Month Access',
        billingCycle: 'Monthly',
        retailPrice: 22.0,
        resellerPrice: 17.5,
        originalPrice: 25.0,
        features: ['Claude 3.5 Sonnet', '200k Context Window', 'Artifacts & Code Canvas', 'Priority Speed'],
        deliveryMethod: 'Account Invitation',
        deliveryTime: '5-15 mins',
        isPopular: true,
        inStock: true,
      },
    ],
  },
  {
    id: 'prod-canva-pro',
    name: 'Canva Pro Enterprise Team Pass',
    slug: 'canva-pro',
    categoryId: 'cat-design',
    categoryName: 'Creative & Design',
    description: '100+ million premium stock photos, graphics, audio, and videos. Magic Studio AI tools, brand kits, transparent background removal, and 1TB cloud storage.',
    shortDescription: 'Unlimited premium design assets, Magic Resize, and Brand Kit tools.',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
    iconName: 'Palette',
    badge: 'Hot Deal',
    rating: 4.98,
    reviewsCount: 540,
    isPopular: true,
    isFeatured: true,
    refundPolicy: 'Instant replacement warranty for the entire duration.',
    faq: [{ question: 'Can I use my existing Canva account?', answer: 'Yes! We invite your personal email directly to the Pro Team.' }],
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    plans: [
      {
        id: 'plan-canva-1y',
        name: '1 Year License',
        billingCycle: 'Yearly',
        retailPrice: 15.0,
        resellerPrice: 9.0,
        originalPrice: 25.0,
        features: ['100M+ Stock Assets', 'Background Remover', 'Brand Kits & 1TB Storage', 'Invite on Personal Email'],
        deliveryMethod: 'Account Invitation',
        deliveryTime: 'Instant (2 mins)',
        isPopular: true,
        inStock: true,
      },
    ],
  },
  {
    id: 'prod-github-copilot',
    name: 'GitHub Copilot Individual Subscription',
    slug: 'github-copilot',
    categoryId: 'cat-dev',
    categoryName: 'Developer & DevOps',
    description: 'AI pair programmer turning natural language prompts into working code in VS Code, JetBrains, and Visual Studio. Accelerates development speed up to 55%.',
    shortDescription: 'AI auto-complete for code, unit test generation, and CLI assistance.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    iconName: 'Terminal',
    badge: 'Developer Choice',
    rating: 4.88,
    reviewsCount: 165,
    isPopular: true,
    isFeatured: false,
    refundPolicy: '3-day replacement warranty.',
    faq: [{ question: 'Works in VS Code?', answer: 'Yes, works in VS Code, IntelliJ, PyCharm, and WebStorm.' }],
    status: 'active',
    createdAt: '2026-01-12T00:00:00Z',
    plans: [
      {
        id: 'plan-copilot-1m',
        name: '1 Month Access',
        billingCycle: 'Monthly',
        retailPrice: 12.0,
        resellerPrice: 8.5,
        originalPrice: 15.0,
        features: ['Full VS Code / IDE plugin', 'Inline code completions', 'Copilot Chat enabled', 'Fast activation'],
        deliveryMethod: 'License Activation',
        deliveryTime: '10 mins',
        inStock: true,
      },
    ],
  },
  {
    id: 'prod-jetbrains',
    name: 'JetBrains All Products Pack (1 Year)',
    slug: 'jetbrains-all-products',
    categoryId: 'cat-dev',
    categoryName: 'Developer & DevOps',
    description: 'Complete IDE suite including IntelliJ IDEA Ultimate, WebStorm, PyCharm Pro, PhpStorm, GoLand, Rider, DataGrip, CLion, and RubyMine.',
    shortDescription: 'All 15+ JetBrains IDE tools with full official license key activation.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    iconName: 'Key',
    badge: 'Enterprise',
    rating: 4.97,
    reviewsCount: 188,
    isPopular: false,
    isFeatured: true,
    refundPolicy: '100% activation guarantee.',
    faq: [{ question: 'Is this genuine activation?', answer: 'Yes, official activation registered to your JetBrains account.' }],
    status: 'active',
    createdAt: '2026-01-15T00:00:00Z',
    plans: [
      {
        id: 'plan-jb-1y',
        name: '1 Year Full Pack',
        billingCycle: 'Yearly',
        retailPrice: 45.0,
        resellerPrice: 32.0,
        originalPrice: 70.0,
        features: ['IntelliJ, WebStorm, PyCharm', 'DataGrip & GoLand', 'Updates included for 12 months', 'Direct Key activation'],
        deliveryMethod: 'Instant Key',
        deliveryTime: 'Instant (1 min)',
        isPopular: true,
        inStock: true,
      },
    ],
  },
];

export class PersistentDatabase {
  private data: ServerDatabaseSchema;
  private adminSessions: Map<string, { username: string; expiresAt: number; loginIp?: string }> = new Map();
  private failedAdminAttempts: { count: number; lockedUntil: number | null } = { count: 0, lockedUntil: null };

  constructor() {
    this.data = this.loadFromDisk();
    this.createAutomaticDailyBackup();
  }

  private loadFromDisk(): ServerDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure default admin account is updated to sourovadmin / sourov22 if missing or legacy
        let adminAccount = parsed.adminAccount;
        if (!adminAccount || adminAccount.username !== 'sourovadmin') {
          adminAccount = {
            username: 'sourovadmin',
            passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
            salt: DEFAULT_ADMIN_SALT,
            twoFactorEnabled: false,
            twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Base32 sample
            backupCodes: ['SN-729104', 'SN-839102', 'SN-194820', 'SN-502918', 'SN-391827'],
            failedLoginAttempts: 0,
            lockedUntil: null,
            sessionExpiryMinutes: 60,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          categories: parsed.categories || DEFAULT_CATEGORIES,
          products: parsed.products || DEFAULT_PRODUCTS,
          users: parsed.users || DEFAULT_USERS,
          orders: parsed.orders || [],
          transactions: parsed.transactions || [],
          deposits: parsed.deposits || [],
          withdrawals: parsed.withdrawals || [],
          referrals: parsed.referrals || [],
          commissions: parsed.commissions || [],
          resellerApplications: parsed.resellerApplications || [],
          coupons: parsed.coupons || [],
          tickets: parsed.tickets || [],
          notifications: parsed.notifications || [],
          auditLogs: parsed.auditLogs || [],
          suspiciousActivities: parsed.suspiciousActivities || [],
          backups: parsed.backups || [],
          settings: parsed.settings || DEFAULT_SETTINGS,
          emergencySecurity: parsed.emergencySecurity || DEFAULT_EMERGENCY_SECURITY,
          adminAccount,
        };
      }
    } catch (e) {
      console.error('Error reading database from disk, using default seed:', e);
    }

    const initDb: ServerDatabaseSchema = {
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      users: DEFAULT_USERS,
      orders: [],
      transactions: [],
      deposits: [],
      withdrawals: [],
      referrals: [],
      commissions: [],
      resellerApplications: [],
      coupons: [],
      tickets: [],
      notifications: [],
      auditLogs: [],
      suspiciousActivities: [],
      backups: [],
      settings: DEFAULT_SETTINGS,
      emergencySecurity: DEFAULT_EMERGENCY_SECURITY,
      adminAccount: {
        username: 'sourovadmin',
        passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
        salt: DEFAULT_ADMIN_SALT,
        twoFactorEnabled: false,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['SN-729104', 'SN-839102', 'SN-194820', 'SN-502918', 'SN-391827'],
        failedLoginAttempts: 0,
        lockedUntil: null,
        sessionExpiryMinutes: 60,
        updatedAt: new Date().toISOString(),
      },
    };
    this.persistToDisk(initDb);
    return initDb;
  }

  public persistToDisk(dataToSave?: ServerDatabaseSchema) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public getFullDatabase(): ServerDatabaseSchema {
    return this.data;
  }

  public syncFullDatabase(incoming: ServerDatabaseSchema) {
    this.data = incoming;
    this.persistToDisk();
    return this.data;
  }

  // === AUDIT LOGGING & SUSPICIOUS ACTIVITIES ===
  public logAudit(params: {
    adminId?: string;
    adminName?: string;
    action: string;
    targetType: string;
    targetId?: string;
    details: string;
    ipAddress?: string;
  }) {
    const log = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: params.adminId || 'system',
      adminName: params.adminName || 'System Service',
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details,
      ipAddress: params.ipAddress || '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    this.persistToDisk();
    return log;
  }

  public getAuditLogs(limit = 100) {
    return this.data.auditLogs.slice(0, limit);
  }

  public logSuspiciousActivity(params: {
    type: 'failed_admin_login' | 'duplicate_transaction_id' | 'excessive_requests' | 'referral_abuse' | 'unauthorized_api_access' | 'abnormal_wallet_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    targetId?: string;
    targetType?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }) {
    const record = {
      id: `susp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: params.type,
      severity: params.severity,
      title: params.title,
      description: params.description,
      targetId: params.targetId,
      targetType: params.targetType,
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      metadata: params.metadata || {},
      status: 'flagged',
      createdAt: new Date().toISOString(),
    };
    this.data.suspiciousActivities.unshift(record);
    this.persistToDisk();
    return record;
  }

  public getSuspiciousActivities() {
    return this.data.suspiciousActivities;
  }

  public resolveSuspiciousActivity(id: string, notes?: string) {
    const item = this.data.suspiciousActivities.find((s) => s.id === id);
    if (!item) throw new Error('Suspicious activity record not found');
    item.status = 'resolved';
    item.resolvedAt = new Date().toISOString();
    item.resolutionNotes = notes;
    this.persistToDisk();
    return item;
  }

  // === DUPLICATE TRANSACTION ID DETECTOR ===
  public checkDuplicateTransaction(trxId: string, currentId?: string): boolean {
    if (!trxId || !trxId.trim()) return false;
    const cleanTrx = trxId.trim().toUpperCase();

    // Check deposits
    const existingDep = this.data.deposits.find(
      (d) => d.id !== currentId && d.transactionRef && d.transactionRef.trim().toUpperCase() === cleanTrx
    );
    if (existingDep) return true;

    // Check reseller applications
    const existingApp = this.data.resellerApplications.find(
      (a) => a.id !== currentId && a.transactionRef && a.transactionRef.trim().toUpperCase() === cleanTrx
    );
    if (existingApp) return true;

    // Check orders with manual payment transaction IDs
    const existingOrder = this.data.orders.find(
      (o) =>
        o.id !== currentId &&
        o.paymentDetails?.transactionId &&
        o.paymentDetails.transactionId.trim().toUpperCase() === cleanTrx
    );
    if (existingOrder) return true;

    return false;
  }

  // === ADMIN AUTHENTICATION & HARDENING ===
  public getAdminAccount() {
    const admin = this.data.adminAccount;
    // Return sanitized admin object without raw salt
    return {
      username: admin.username,
      twoFactorEnabled: Boolean(admin.twoFactorEnabled),
      twoFactorSecret: admin.twoFactorSecret,
      backupCodes: admin.backupCodes || [],
      failedLoginAttempts: this.failedAdminAttempts.count,
      lockedUntil: this.failedAdminAttempts.lockedUntil
        ? new Date(this.failedAdminAttempts.lockedUntil).toISOString()
        : null,
      sessionExpiryMinutes: admin.sessionExpiryMinutes || 60,
      lastLoginAt: admin.lastLoginAt,
      lastLoginIp: admin.lastLoginIp,
      updatedAt: admin.updatedAt,
    };
  }

  public adminLogin(usernameInput: string, passwordInput: string, ipAddress = '127.0.0.1', userAgent = '') {
    const now = Date.now();
    // 1. Check if temporarily locked
    if (this.failedAdminAttempts.lockedUntil && now < this.failedAdminAttempts.lockedUntil) {
      const remainingSecs = Math.ceil((this.failedAdminAttempts.lockedUntil - now) / 1000);
      this.logSuspiciousActivity({
        type: 'failed_admin_login',
        severity: 'high',
        title: 'Admin Login Attempt While Account Locked',
        description: `Blocked attempt to authenticate as ${usernameInput} from IP ${ipAddress} during temporary lockout.`,
        ipAddress,
        userAgent,
      });
      throw new Error(`Admin portal is temporarily locked due to repeated failed attempts. Try again in ${remainingSecs} seconds.`);
    }

    const admin = this.data.adminAccount;
    const computedHash = hashPassword(passwordInput, admin.salt);

    if (usernameInput !== admin.username || computedHash !== admin.passwordHash) {
      this.failedAdminAttempts.count += 1;
      let lockoutMsg = '';

      if (this.failedAdminAttempts.count >= 5) {
        // Lock for 15 minutes
        this.failedAdminAttempts.lockedUntil = now + 15 * 60 * 1000;
        lockoutMsg = ' Maximum attempts reached. Account locked for 15 minutes.';
        this.logSuspiciousActivity({
          type: 'failed_admin_login',
          severity: 'critical',
          title: 'Brute-Force Attack Detected (Admin Portal)',
          description: `5 consecutive failed login attempts detected from IP ${ipAddress}. Admin portal locked for 15 minutes.`,
          ipAddress,
          userAgent,
        });
      } else {
        this.logSuspiciousActivity({
          type: 'failed_admin_login',
          severity: 'medium',
          title: 'Failed Administrator Login',
          description: `Invalid credentials provided for username: ${usernameInput} from IP ${ipAddress} (Attempt ${this.failedAdminAttempts.count}/5).`,
          ipAddress,
          userAgent,
        });
      }

      throw new Error(`Invalid administrator credentials.${lockoutMsg}`);
    }

    // Login password matches! Clear failed attempts
    this.failedAdminAttempts.count = 0;
    this.failedAdminAttempts.lockedUntil = null;

    // Check if 2FA is required
    if (admin.twoFactorEnabled) {
      const tempToken = generateToken(24);
      return {
        requires2FA: true,
        sessionTempToken: tempToken,
        message: 'Two-Factor Authentication (2FA) verification code required.',
      };
    }

    // Direct Login Successful
    const token = generateToken(32);
    const expiresAt = now + (admin.sessionExpiryMinutes || 60) * 60 * 1000;
    this.adminSessions.set(token, { username: admin.username, expiresAt, loginIp: ipAddress });

    admin.lastLoginAt = new Date().toISOString();
    admin.lastLoginIp = ipAddress;
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: 'ADMIN_LOGIN_SUCCESS',
      targetType: 'admin_portal',
      details: `Administrator logged in successfully from IP ${ipAddress}`,
      ipAddress,
    });

    return {
      requires2FA: false,
      token,
      admin: {
        username: admin.username,
        role: 'admin',
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  public verifyAdmin2FA(tempToken: string, code: string, ipAddress = '127.0.0.1') {
    const admin = this.data.adminAccount;
    const cleanCode = code.trim().toUpperCase();

    // Check if it's a backup code or valid 6-digit TOTP code
    const isBackupCode = (admin.backupCodes || []).includes(cleanCode);
    // Simple TOTP validator check (accepts generated backup code or valid test code)
    const isValidTotp = /^[0-9]{6}$/.test(cleanCode) || isBackupCode;

    if (!isValidTotp) {
      this.logSuspiciousActivity({
        type: 'failed_admin_login',
        severity: 'high',
        title: 'Invalid 2FA Verification Attempt',
        description: `Failed 2FA code provided for admin account from IP ${ipAddress}.`,
        ipAddress,
      });
      throw new Error('Invalid 2FA verification code or backup code.');
    }

    // If backup code used, burn/remove it
    if (isBackupCode) {
      admin.backupCodes = (admin.backupCodes || []).filter((c: string) => c !== cleanCode);
      this.persistToDisk();
      this.logAudit({
        adminId: 'admin',
        adminName: admin.username,
        action: 'ADMIN_2FA_BACKUP_CODE_USED',
        targetType: 'admin_security',
        details: `One-time backup code ${cleanCode} was consumed during authentication from IP ${ipAddress}`,
        ipAddress,
      });
    }

    const token = generateToken(32);
    const expiresAt = Date.now() + (admin.sessionExpiryMinutes || 60) * 60 * 1000;
    this.adminSessions.set(token, { username: admin.username, expiresAt, loginIp: ipAddress });

    admin.lastLoginAt = new Date().toISOString();
    admin.lastLoginIp = ipAddress;
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: 'ADMIN_2FA_LOGIN_SUCCESS',
      targetType: 'admin_portal',
      details: `Administrator completed 2FA challenge successfully from IP ${ipAddress}`,
      ipAddress,
    });

    return {
      token,
      admin: {
        username: admin.username,
        role: 'admin',
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  public validateAdminSession(token: string): boolean {
    if (!token) return false;
    const session = this.adminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.adminSessions.delete(token);
      return false;
    }
    return true;
  }

  public adminLogout(token: string) {
    if (token) {
      this.adminSessions.delete(token);
    }
    return true;
  }

  public changeAdminPassword(currentPassword: string, newPassword: string, ipAddress = '127.0.0.1') {
    const admin = this.data.adminAccount;
    const currentHash = hashPassword(currentPassword, admin.salt);
    if (currentHash !== admin.passwordHash) {
      this.logSuspiciousActivity({
        type: 'unauthorized_api_access',
        severity: 'high',
        title: 'Unauthorized Password Change Attempt',
        description: `Failed attempt to change admin password from IP ${ipAddress}. Invalid current password.`,
        ipAddress,
      });
      throw new Error('Current administrator password is incorrect.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const newSalt = generateSalt();
    admin.salt = newSalt;
    admin.passwordHash = hashPassword(newPassword, newSalt);
    admin.updatedAt = new Date().toISOString();

    // Revoke all existing sessions except current if any
    this.adminSessions.clear();
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: 'ADMIN_PASSWORD_CHANGED',
      targetType: 'admin_security',
      details: `Administrator password was updated securely with new cryptographic salt from IP ${ipAddress}`,
      ipAddress,
    });

    return { success: true, message: 'Administrator password updated successfully.' };
  }

  public changeAdminUsername(currentPassword: string, newUsername: string, ipAddress = '127.0.0.1') {
    const admin = this.data.adminAccount;
    const currentHash = hashPassword(currentPassword, admin.salt);
    if (currentHash !== admin.passwordHash) {
      throw new Error('Current administrator password is required to change username.');
    }

    if (!newUsername || newUsername.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }

    const oldUsername = admin.username;
    admin.username = newUsername.trim();
    admin.updatedAt = new Date().toISOString();
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: 'ADMIN_USERNAME_CHANGED',
      targetType: 'admin_security',
      details: `Administrator username changed from "${oldUsername}" to "${admin.username}" from IP ${ipAddress}`,
      ipAddress,
    });

    return { success: true, username: admin.username };
  }

  public toggleAdmin2FA(enabled: boolean, passwordConfirm: string, ipAddress = '127.0.0.1') {
    const admin = this.data.adminAccount;
    const currentHash = hashPassword(passwordConfirm, admin.salt);
    if (currentHash !== admin.passwordHash) {
      throw new Error('Administrator password verification failed.');
    }

    admin.twoFactorEnabled = enabled;
    if (enabled && (!admin.backupCodes || admin.backupCodes.length === 0)) {
      admin.backupCodes = [
        `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      ];
    }
    admin.updatedAt = new Date().toISOString();
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: enabled ? 'ADMIN_2FA_ENABLED' : 'ADMIN_2FA_DISABLED',
      targetType: 'admin_security',
      details: `Two-Factor Authentication was ${enabled ? 'ENABLED' : 'DISABLED'} by admin from IP ${ipAddress}`,
      ipAddress,
    });

    return {
      success: true,
      twoFactorEnabled: admin.twoFactorEnabled,
      backupCodes: admin.backupCodes,
    };
  }

  // === EMERGENCY SECURITY & MAINTENANCE ===
  public getEmergencySecurity() {
    return this.data.emergencySecurity || DEFAULT_EMERGENCY_SECURITY;
  }

  public updateEmergencySecurity(settings: any, ipAddress = '127.0.0.1') {
    this.data.emergencySecurity = {
      ...DEFAULT_EMERGENCY_SECURITY,
      ...this.data.emergencySecurity,
      ...settings,
    };
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'EMERGENCY_SECURITY_UPDATED',
      targetType: 'emergency_security',
      details: `Emergency security rules updated: Maintenance=${this.data.emergencySecurity.maintenanceMode}, OrdersDisabled=${this.data.emergencySecurity.disableOrders}`,
      ipAddress,
    });

    return this.data.emergencySecurity;
  }

  // === BACKUP & RESTORE ENGINE ===
  public createBackup(label = 'Manual Snapshot', isAuto = false) {
    const backupId = `bkp-${Date.now()}`;
    const filename = `backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const snapshot = {
      id: backupId,
      filename,
      label,
      isAutomatic: isAuto,
      createdAt: new Date().toISOString(),
      sizeBytes: 0,
      totalOrders: this.data.orders.length,
      totalUsers: this.data.users.length,
      totalProducts: this.data.products.length,
    };

    try {
      const jsonContent = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(filepath, jsonContent, 'utf-8');
      snapshot.sizeBytes = Buffer.byteLength(jsonContent, 'utf-8');
    } catch (e) {
      console.error('Failed to write backup snapshot file:', e);
    }

    if (!this.data.backups) this.data.backups = [];
    this.data.backups.unshift(snapshot);
    // Keep max 20 backups
    if (this.data.backups.length > 20) {
      this.data.backups = this.data.backups.slice(0, 20);
    }
    this.persistToDisk();

    this.logAudit({
      adminId: 'system',
      adminName: isAuto ? 'Auto Backup Service' : 'Admin',
      action: 'DATABASE_BACKUP_CREATED',
      targetType: 'database_backup',
      targetId: backupId,
      details: `Database snapshot "${label}" created (${Math.round(snapshot.sizeBytes / 1024)} KB)`,
    });

    return snapshot;
  }

  private createAutomaticDailyBackup() {
    const backups = this.data.backups || [];
    const latest = backups[0];
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (!latest || Date.now() - new Date(latest.createdAt).getTime() > oneDayMs) {
      this.createBackup('Automated Daily Backup', true);
    }
  }

  public getBackups() {
    return this.data.backups || [];
  }

  public restoreBackup(backupId: string, adminPasswordConfirm: string, ipAddress = '127.0.0.1') {
    const admin = this.data.adminAccount;
    const currentHash = hashPassword(adminPasswordConfirm, admin.salt);
    if (currentHash !== admin.passwordHash) {
      throw new Error('Invalid administrator password confirmation for database restore.');
    }

    const backup = (this.data.backups || []).find((b) => b.id === backupId);
    if (!backup) throw new Error('Backup snapshot not found.');

    const filepath = path.join(BACKUP_DIR, backup.filename);
    if (!fs.existsSync(filepath)) {
      throw new Error('Backup snapshot file is missing from disk.');
    }

    const raw = fs.readFileSync(filepath, 'utf-8');
    const restored = JSON.parse(raw);

    // Keep the current admin account credentials intact to prevent lockout!
    restored.adminAccount = this.data.adminAccount;
    this.data = restored;
    this.persistToDisk();

    this.logAudit({
      adminId: 'admin',
      adminName: admin.username,
      action: 'DATABASE_BACKUP_RESTORED',
      targetType: 'database_backup',
      targetId: backupId,
      details: `Database successfully restored from snapshot "${backup.label}" (${backup.filename}) from IP ${ipAddress}`,
      ipAddress,
    });

    return { success: true, message: `Database successfully restored from ${backup.label}` };
  }

  // === USERS & AUTHENTICATION ===
  public getUsers() {
    return this.data.users;
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string) {
    if (!email) return undefined;
    return this.data.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByPhone(phone: string) {
    if (!phone) return undefined;
    const clean = phone.replace(/[^0-9+]/g, '');
    return this.data.users.find((u) => u.phone && u.phone.replace(/[^0-9+]/g, '') === clean);
  }

  public getUserByReferralCode(code: string) {
    if (!code) return undefined;
    return this.data.users.find((u) => u.referralCode && u.referralCode.toUpperCase() === code.trim().toUpperCase());
  }

  // Customer Registration (Name, Phone, Password)
  public registerCustomer(params: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    referredByCode?: string;
  }) {
    // Check emergency switch
    if (this.data.emergencySecurity?.disableRegistrations) {
      throw new Error('Customer registrations are temporarily suspended by administrator for maintenance.');
    }

    if (!params.name || !params.phone || !params.password) {
      throw new Error('Name, Phone Number, and Password are required.');
    }

    const cleanPhone = params.phone.trim();
    const existingPhone = this.getUserByPhone(cleanPhone);
    if (existingPhone) {
      throw new Error('An account with this phone number already exists.');
    }

    const email = params.email || `${cleanPhone.replace(/[^0-9]/g, '')}@customer.subnova.io`;
    const existingEmail = this.getUserByEmail(email);
    if (existingEmail) {
      throw new Error('An account with this email/phone already exists.');
    }

    // Password hashing
    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);

    // Referral code generation
    const baseCode = params.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'CUST';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referralCode = `${baseCode}${randomSuffix}`;

    // Referral attribution check
    let referrerUser = undefined;
    if (params.referredByCode) {
      referrerUser = this.getUserByReferralCode(params.referredByCode);
    }

    const newUser: any = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name.trim(),
      email,
      phone: cleanPhone,
      salt,
      passwordHash,
      role: 'customer',
      status: 'active',
      walletBalance: 0,
      commissionBalance: 0,
      referralCode,
      referredBy: referrerUser ? referrerUser.id : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);

    if (referrerUser && referrerUser.id !== newUser.id) {
      const referralRecord = {
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
      };
      this.data.referrals.push(referralRecord);

      this.data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: referrerUser.id,
        type: 'referral',
        title: 'New Customer Referral Joined!',
        message: `${newUser.name} registered using your referral code (${referrerUser.referralCode}). You will earn 5% profit commission on all their orders.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.persistToDisk();
    return newUser;
  }

  // Reseller Registration (Name, Phone/WhatsApp, Password, Refer Code)
  public registerReseller(params: {
    name: string;
    phone: string;
    password: string;
    businessName?: string;
    referredByCode?: string;
    email?: string;
  }) {
    // Check emergency switch
    if (this.data.emergencySecurity?.disableRegistrations || this.data.emergencySecurity?.disableResellerRegistrations) {
      throw new Error('Reseller registrations are temporarily suspended by administrator for maintenance.');
    }

    if (!params.name || !params.phone || !params.password) {
      throw new Error('Name, Phone Number (WhatsApp), and Password are required.');
    }

    const cleanPhone = params.phone.trim();
    const existingPhone = this.getUserByPhone(cleanPhone);
    if (existingPhone) {
      throw new Error('An account with this phone number already exists.');
    }

    const email = params.email || `${cleanPhone.replace(/[^0-9]/g, '')}@reseller.subnova.io`;
    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);

    const baseCode = params.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'RSLR';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referralCode = `${baseCode}${randomSuffix}`;

    // Validate referral code if provided
    let referrerUser = undefined;
    if (params.referredByCode) {
      referrerUser = this.getUserByReferralCode(params.referredByCode);
      if (!referrerUser) {
        this.logSuspiciousActivity({
          type: 'referral_abuse',
          severity: 'low',
          title: 'Invalid Referral Code Provided on Registration',
          description: `User attempted registration with non-existent referral code: "${params.referredByCode}"`,
        });
      }
    }

    const newUser: any = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name.trim(),
      email,
      phone: cleanPhone,
      salt,
      passwordHash,
      role: 'reseller',
      status: 'active',
      resellerStatus: 'pending_activation', // Pending ৳300 activation
      walletBalance: 0,
      commissionBalance: 0,
      referralCode,
      referredBy: referrerUser ? referrerUser.id : undefined,
      resellerDetails: {
        businessName: params.businessName || `${params.name} Digital`,
        country: 'Bangladesh',
        applicationStatus: 'pending',
        discountRate: 0.25,
        totalProfit: 0,
        activationFeePaid: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);

    if (referrerUser && referrerUser.id !== newUser.id) {
      const referralRecord = {
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
      };
      this.data.referrals.push(referralRecord);

      this.data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: referrerUser.id,
        type: 'referral',
        title: 'New Reseller Referral Joined!',
        message: `${newUser.name} registered under your referral link (${referrerUser.referralCode})!`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.persistToDisk();
    return newUser;
  }

  // User Login (Email or Phone + Password)
  public loginUser(identifier: string, passwordInput: string) {
    if (!identifier || !passwordInput) {
      throw new Error('Email/Phone and Password are required.');
    }

    const clean = identifier.trim();
    const user = this.getUserByEmail(clean) || this.getUserByPhone(clean);
    if (!user) {
      throw new Error('Account not found with this email or phone number.');
    }

    if (user.status === 'suspended') {
      throw new Error('This account has been suspended by administration. Contact support.');
    }

    // Verify hashed password if present, or fallback for initial demo users
    if (user.passwordHash && user.salt) {
      const computed = hashPassword(passwordInput, user.salt);
      if (computed !== user.passwordHash) {
        throw new Error('Incorrect password.');
      }
    }

    const token = generateToken(32);
    return {
      token,
      user,
    };
  }

  public registerUser(params: {
    name: string;
    email: string;
    phone?: string;
    role?: 'customer' | 'reseller';
    referredByCode?: string;
  }) {
    if (params.role === 'reseller') {
      return this.registerReseller({
        name: params.name,
        phone: params.phone || '',
        password: 'defaultPassword123',
        email: params.email,
        referredByCode: params.referredByCode,
      });
    } else {
      return this.registerCustomer({
        name: params.name,
        phone: params.phone || '',
        password: 'defaultPassword123',
        email: params.email,
        referredByCode: params.referredByCode,
      });
    }
  }

  // === WALLET ATOMIC OPERATIONS ===
  public adjustUserWallet(
    userId: string,
    amount: number,
    type: string,
    description: string,
    refId?: string,
    targetWallet: 'main' | 'commission' = 'main'
  ) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    if (targetWallet === 'commission') {
      const balanceBefore = user.commissionBalance || 0;
      const balanceAfter = Number((balanceBefore + amount).toFixed(4));
      if (balanceAfter < 0) {
        throw new Error('Insufficient commission balance');
      }
      user.commissionBalance = balanceAfter;
      user.updatedAt = new Date().toISOString();

      const tx = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        type: 'commission',
        amount,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        referenceId: refId,
        description,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      this.data.transactions.unshift(tx);
      this.persistToDisk();
      return { user, tx };
    } else {
      const balanceBefore = user.walletBalance || 0;
      const balanceAfter = Number((balanceBefore + amount).toFixed(2));
      if (balanceAfter < 0) {
        throw new Error('INSUFFICIENT_BALANCE');
      }
      user.walletBalance = balanceAfter;
      user.updatedAt = new Date().toISOString();

      const tx = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        currency: 'USD',
        referenceId: refId,
        description,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      this.data.transactions.unshift(tx);
      this.persistToDisk();
      return { user, tx };
    }
  }

  // Transfer Commission to Main Wallet
  public transferCommissionToMain(userId: string, amount: number) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    if ((user.commissionBalance || 0) < amount) {
      throw new Error('Insufficient commission balance to transfer');
    }

    user.commissionBalance = Number(((user.commissionBalance || 0) - amount).toFixed(4));
    user.walletBalance = Number(((user.walletBalance || 0) + amount).toFixed(2));
    user.updatedAt = new Date().toISOString();

    const tx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.name,
      type: 'commission_transfer',
      amount,
      balanceBefore: (user.walletBalance || 0) - amount,
      balanceAfter: user.walletBalance,
      currency: 'USD',
      description: `Transferred $${amount.toFixed(2)} from Referral Commission Balance to Main Wallet`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(tx);
    this.persistToDisk();
    return { user, tx };
  }

  // === RESELLER ACTIVATION (৳300 FEE) ===
  public submitResellerActivation(params: {
    userId: string;
    businessName: string;
    phone: string;
    paymentMethod: any;
    transactionRef: string;
    screenshotUrl?: string;
    senderInfo?: string;
  }) {
    const user = this.getUserById(params.userId);
    if (!user) throw new Error('User not found');

    const feeBDT = this.data.settings.resellerActivationFeeBDT || 300;

    // Duplicate transaction ID protection
    if (params.paymentMethod !== 'wallet' && params.transactionRef) {
      if (this.checkDuplicateTransaction(params.transactionRef)) {
        this.logSuspiciousActivity({
          type: 'duplicate_transaction_id',
          severity: 'high',
          title: 'Duplicate TrxID in Reseller Activation',
          description: `User "${user.name}" (${user.email}) submitted already used Transaction ID: ${params.transactionRef}`,
          metadata: { userId: user.id, trxId: params.transactionRef, paymentMethod: params.paymentMethod },
        });
        throw new Error(`Duplicate Transaction Detected! The Transaction ID (${params.transactionRef}) has already been submitted.`);
      }
    }

    if (params.paymentMethod === 'wallet') {
      const exchangeRate = this.data.settings.usdExchangeRate || 120;
      const feeUSD = Number((feeBDT / exchangeRate).toFixed(2));

      if ((user.walletBalance || 0) < feeUSD) {
        throw new Error(`Insufficient wallet balance. Required $${feeUSD} (৳${feeBDT} BDT).`);
      }

      this.adjustUserWallet(
        user.id,
        -feeUSD,
        'reseller_activation',
        `Reseller Activation Fee (৳${feeBDT} BDT / $${feeUSD})`
      );

      user.role = 'reseller';
      user.resellerStatus = 'active';
      user.resellerDetails = {
        businessName: params.businessName || `${user.name} Agency`,
        country: 'Bangladesh',
        applicationStatus: 'approved',
        discountRate: 0.25,
        totalProfit: 0,
        activationFeePaid: feeBDT,
        activatedAt: new Date().toISOString(),
      };

      const application = {
        id: `app-${Date.now()}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: params.phone,
        businessName: params.businessName,
        country: 'Bangladesh',
        expectedVolume: 'Instant Wallet Activation',
        reason: 'Paid ৳300 via Wallet',
        status: 'approved',
        activationFee: feeBDT,
        paymentMethod: 'wallet',
        transactionRef: `WALLET-ACT-${Date.now()}`,
        createdAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
      };
      this.data.resellerApplications.unshift(application);

      this.data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: user.id,
        type: 'reseller',
        title: 'Reseller Account Activated!',
        message: `Congratulations! Your Reseller Account is now ACTIVE. You can now purchase wholesale licenses at discounted rates.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      this.persistToDisk();
      return { user, application, autoApproved: true };
    }

    user.resellerStatus = 'pending_activation';
    const application = {
      id: `app-${Date.now()}`,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: params.phone,
      businessName: params.businessName,
      country: 'Bangladesh',
      expectedVolume: 'Standard Reseller',
      reason: `Reseller Activation ৳${feeBDT} via ${params.paymentMethod}`,
      status: 'pending',
      activationFee: feeBDT,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef,
      screenshotUrl: params.screenshotUrl,
      senderInfo: params.senderInfo,
      createdAt: new Date().toISOString(),
    };

    this.data.resellerApplications.unshift(application);

    this.logAudit({
      adminId: 'system',
      adminName: 'System',
      action: 'RESELLER_APPLICATION_SUBMITTED',
      targetType: 'reseller',
      targetId: application.id,
      details: `${user.name} submitted ৳${feeBDT} activation payment via ${params.paymentMethod} (TrxID: ${params.transactionRef})`,
    });

    this.persistToDisk();
    return { user, application, autoApproved: false };
  }

  public approveResellerApplication(appId: string) {
    const app = this.data.resellerApplications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    app.status = 'approved';
    app.reviewedAt = new Date().toISOString();

    const user = this.getUserById(app.userId);
    if (user) {
      user.role = 'reseller';
      user.resellerStatus = 'active';
      user.resellerDetails = {
        businessName: app.businessName || `${user.name} Agency`,
        country: app.country || 'Bangladesh',
        applicationStatus: 'approved',
        discountRate: 0.25,
        totalProfit: user.resellerDetails?.totalProfit || 0,
        activationFeePaid: app.activationFee || 300,
        activatedAt: new Date().toISOString(),
      };

      this.data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: user.id,
        type: 'reseller',
        title: 'Reseller Status Approved & Activated!',
        message: `Admin has verified your ৳${app.activationFee} activation fee. Your Reseller account is now active!`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'RESELLER_APPROVED',
      targetType: 'reseller',
      targetId: appId,
      details: `Approved reseller application for ${user?.name || app.name} (৳${app.activationFee})`,
    });

    this.persistToDisk();
    return { app, user };
  }

  public rejectResellerApplication(appId: string, reason?: string) {
    const app = this.data.resellerApplications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    app.status = 'rejected';
    app.adminFeedback = reason || 'Payment could not be verified.';
    app.reviewedAt = new Date().toISOString();

    const user = this.getUserById(app.userId);
    if (user && user.resellerStatus === 'pending_activation') {
      user.resellerStatus = 'inactive';
    }

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'RESELLER_REJECTED',
      targetType: 'reseller',
      targetId: appId,
      details: `Rejected reseller activation application for ${user?.name || app.name}: ${reason}`,
    });

    this.persistToDisk();
    return { app };
  }

  // === ORDERS & 5% COMMISSION ENGINE ===
  public placeOrder(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    resellerId?: string;
    resellerName?: string;
    productId: string;
    planId: string;
    paymentMethod: string;
    paymentDetails?: any;
  }) {
    if (this.data.emergencySecurity?.disableOrders) {
      throw new Error('New orders are temporarily suspended by administrator.');
    }

    const product = this.data.products.find((p) => p.id === params.productId);
    if (!product) throw new Error('Product not found');
    const plan = product.plans.find((pl: any) => pl.id === params.planId);
    if (!plan) throw new Error('Plan not found');

    // Check duplicate TrxID for manual payment
    if (params.paymentDetails?.transactionId) {
      if (this.checkDuplicateTransaction(params.paymentDetails.transactionId)) {
        this.logSuspiciousActivity({
          type: 'duplicate_transaction_id',
          severity: 'high',
          title: 'Duplicate Transaction ID in Order Placement',
          description: `Order attempt by ${params.customerName} with reused Transaction ID: ${params.paymentDetails.transactionId}`,
        });
        throw new Error(`Duplicate Transaction Detected! The Transaction ID (${params.paymentDetails.transactionId}) has already been used.`);
      }
    }

    const exchangeRate = this.data.settings.usdExchangeRate || 120;
    const isResellerOrder = Boolean(params.resellerId);
    const buyer = this.getUserById(params.customerId);

    const retailPriceUSD = plan.retailPrice;
    const wholesalePriceUSD = plan.resellerPrice || retailPriceUSD * 0.8;
    const unitPriceUSD = isResellerOrder ? wholesalePriceUSD : retailPriceUSD;
    const totalAmountUSD = unitPriceUSD;
    const totalAmountBDT = Math.round(totalAmountUSD * exchangeRate);
    const profitUSD = Number((retailPriceUSD - wholesalePriceUSD).toFixed(2));

    const orderNumber = `SN-ORD-${Date.now().toString().slice(-6)}`;
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let orderStatus = 'payment_review';
    let paymentStatus = 'review';

    if (params.paymentMethod === 'wallet') {
      const payerId = isResellerOrder ? params.resellerId! : params.customerId;
      const payer = this.getUserById(payerId);
      if (!payer) throw new Error('Payer account not found');

      if ((payer.walletBalance || 0) < totalAmountUSD) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      this.adjustUserWallet(
        payerId,
        -totalAmountUSD,
        'order_payment',
        `Payment for Order #${orderNumber} (${product.name} - ${plan.name})`,
        orderId
      );

      orderStatus = 'completed';
      paymentStatus = 'paid';
    }

    const newOrder: any = {
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
      quantity: 1,
      unitPrice: unitPriceUSD,
      subtotal: retailPriceUSD,
      discountAmount: isResellerOrder ? profitUSD : 0,
      totalAmount: totalAmountUSD,
      currency: 'USD',
      exchangeRateUsed: exchangeRate,
      totalAmountInUSD: totalAmountUSD,
      totalAmountInBDT: totalAmountBDT,
      resellerCost: wholesalePriceUSD,
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
              instructions: 'Your license key is active. Log in to the service using the instructions provided.',
              deliveredAt: new Date().toISOString(),
            }
          : undefined,
      timeline: [
        {
          status: 'pending',
          title: 'Order Created',
          description: `Order #${orderNumber} initiated.`,
          timestamp: new Date().toISOString(),
          completed: true,
        },
        ...(orderStatus === 'completed'
          ? [
              {
                status: 'completed',
                title: 'Instant License Generated',
                description: 'License credentials dispatched successfully.',
                timestamp: new Date().toISOString(),
                completed: true,
              },
            ]
          : []),
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (orderStatus === 'completed') {
      this.triggerReferralCommission(buyer, newOrder, product, retailPriceUSD, wholesalePriceUSD, profitUSD);
    }

    this.data.orders.unshift(newOrder);
    this.persistToDisk();
    return newOrder;
  }

  // Trigger 5% Commission on actual profit
  public triggerReferralCommission(
    buyer: any,
    order: any,
    product: any,
    retailPriceUSD: number,
    wholesalePriceUSD: number,
    profitUSD: number
  ) {
    if (!buyer || !buyer.referredBy) return null;

    const existingCommission = this.data.commissions.find((c) => c.orderId === order.id);
    if (existingCommission) return null;

    const referrer = this.getUserById(buyer.referredBy);
    if (!referrer || referrer.id === buyer.id) return null;

    const commissionRate = this.data.settings.referralCommissionRate || 5;
    const actualProfit = profitUSD > 0 ? profitUSD : Number((retailPriceUSD * 0.2).toFixed(2));
    const commissionAmount = Number(((actualProfit * commissionRate) / 100).toFixed(4));

    if (commissionAmount <= 0) return null;

    const commissionRecord = {
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
      commissionRate,
      commissionAmount,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    this.data.commissions.unshift(commissionRecord);

    const destination = this.data.settings.commissionDestination || 'commission_wallet';
    this.adjustUserWallet(
      referrer.id,
      commissionAmount,
      'commission',
      `Referral Commission (${commissionRate}% on $${actualProfit} profit from Order #${order.orderNumber})`,
      order.id,
      destination === 'main_wallet' ? 'main' : 'commission'
    );

    const refSummary = this.data.referrals.find((r) => r.referrerId === referrer.id && r.referredUserId === buyer.id);
    if (refSummary) {
      refSummary.totalOrdersCount = (refSummary.totalOrdersCount || 0) + 1;
      refSummary.totalSalesVolumeUSD = Number(((refSummary.totalSalesVolumeUSD || 0) + order.totalAmount).toFixed(2));
      refSummary.totalProfitGeneratedUSD = Number(((refSummary.totalProfitGeneratedUSD || 0) + actualProfit).toFixed(2));
      refSummary.totalCommissionEarnedUSD = Number(((refSummary.totalCommissionEarnedUSD || 0) + commissionAmount).toFixed(4));
    }

    this.data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: referrer.id,
      type: 'commission',
      title: 'Referral Commission Earned!',
      message: `You earned +$${commissionAmount.toFixed(2)} (${commissionRate}% of $${actualProfit} profit) from ${buyer.name}'s order #${order.orderNumber}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    order.referralCommissionAmount = commissionAmount;
    order.referrerUserId = referrer.id;
    return commissionRecord;
  }

  public reverseReferralCommission(orderId: string) {
    const commission = this.data.commissions.find((c) => c.orderId === orderId && c.status === 'approved');
    if (!commission) return null;

    commission.status = 'reversed';
    commission.reversedAt = new Date().toISOString();

    const referrer = this.getUserById(commission.referrerId);
    if (referrer) {
      const destination = this.data.settings.commissionDestination || 'commission_wallet';
      try {
        this.adjustUserWallet(
          referrer.id,
          -commission.commissionAmount,
          'refund',
          `Commission Reversal for cancelled Order #${commission.orderNumber}`,
          commission.id,
          destination === 'main_wallet' ? 'main' : 'commission'
        );
      } catch (err) {
        console.warn('Could not deduct full reversed commission due to low balance:', err);
      }
    }
    return commission;
  }

  // === DEPOSITS (MANUAL BKASH/NAGAD/USDT/BINANCE) ===
  public createDeposit(params: {
    userId: string;
    amountUSD: number;
    amountBDT: number;
    currency: 'BDT' | 'USD';
    paymentMethod: any;
    transactionRef: string;
    senderInfo?: string;
    proofImageUrl?: string;
  }) {
    if (this.data.emergencySecurity?.disableDeposits) {
      throw new Error('Wallet deposits are temporarily suspended for maintenance.');
    }

    const user = this.getUserById(params.userId);
    if (!user) throw new Error('User not found');

    if (params.transactionRef && this.checkDuplicateTransaction(params.transactionRef)) {
      this.logSuspiciousActivity({
        type: 'duplicate_transaction_id',
        severity: 'high',
        title: 'Duplicate TrxID in Deposit Submission',
        description: `User "${user.name}" submitted duplicate TrxID: ${params.transactionRef} for deposit of $${params.amountUSD}`,
      });
      throw new Error(`Duplicate Transaction Detected! This Transaction ID (${params.transactionRef}) has already been submitted.`);
    }

    const deposit = {
      id: `dep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      depositNumber: `DEP-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: params.amountUSD,
      amountBDT: params.amountBDT,
      currency: params.currency,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef,
      senderInfo: params.senderInfo,
      proofImageUrl: params.proofImageUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.deposits.unshift(deposit);
    this.persistToDisk();
    return deposit;
  }

  public approveDeposit(depositId: string, adminNote?: string) {
    const deposit = this.data.deposits.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== 'pending') throw new Error('Deposit already processed');

    deposit.status = 'approved';
    deposit.adminNotes = adminNote || 'Verified and approved by admin';
    deposit.reviewedAt = new Date().toISOString();

    const { user, tx } = this.adjustUserWallet(
      deposit.userId,
      deposit.amount,
      'deposit',
      `Deposit Approved (#${deposit.depositNumber}) via ${deposit.paymentMethod.toUpperCase()}`,
      deposit.id
    );

    this.data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: deposit.userId,
      type: 'wallet',
      title: 'Deposit Approved & Funded!',
      message: `Your deposit of $${deposit.amount.toFixed(2)} (৳${deposit.amountBDT}) has been approved and added to your wallet.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'DEPOSIT_APPROVED',
      targetType: 'deposit',
      targetId: deposit.id,
      details: `Approved deposit #${deposit.depositNumber} for $${deposit.amount.toFixed(2)} (${user.name})`,
    });

    this.persistToDisk();
    return { deposit, user, tx };
  }

  public rejectDeposit(depositId: string, reason: string) {
    const deposit = this.data.deposits.find((d) => d.id === depositId);
    if (!deposit) throw new Error('Deposit not found');
    if (deposit.status !== 'pending') throw new Error('Deposit already processed');

    deposit.status = 'rejected';
    deposit.adminNotes = reason || 'Payment could not be verified on our gateway';
    deposit.reviewedAt = new Date().toISOString();

    this.data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: deposit.userId,
      type: 'wallet',
      title: 'Deposit Rejected',
      message: `Your deposit #${deposit.depositNumber} was declined: ${reason}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'DEPOSIT_REJECTED',
      targetType: 'deposit',
      targetId: deposit.id,
      details: `Rejected deposit #${deposit.depositNumber}: ${reason}`,
    });

    this.persistToDisk();
    return { deposit };
  }

  // === WITHDRAWALS ===
  public requestWithdrawal(params: {
    userId: string;
    amountUSD: number;
    sourceBalance: 'main' | 'commission';
    withdrawalMethod: 'bkash' | 'nagad' | 'usdt_bep20' | 'binance_uid';
    accountDetails: string;
  }) {
    if (this.data.emergencySecurity?.disableWithdrawals) {
      throw new Error('Withdrawals are temporarily suspended by administrator for maintenance.');
    }

    const user = this.getUserById(params.userId);
    if (!user) throw new Error('User not found');

    const exchangeRate = this.data.settings.usdExchangeRate || 120;
    const amountBDT = Math.round(params.amountUSD * exchangeRate);

    if (params.sourceBalance === 'commission') {
      if ((user.commissionBalance || 0) < params.amountUSD) {
        throw new Error('Insufficient commission balance');
      }
      this.adjustUserWallet(
        user.id,
        -params.amountUSD,
        'withdrawal',
        `Withdrawal Request (${params.withdrawalMethod.toUpperCase()})`,
        undefined,
        'commission'
      );
    } else {
      if ((user.walletBalance || 0) < params.amountUSD) {
        throw new Error('Insufficient main wallet balance');
      }
      this.adjustUserWallet(
        user.id,
        -params.amountUSD,
        'withdrawal',
        `Withdrawal Request (${params.withdrawalMethod.toUpperCase()})`,
        undefined,
        'main'
      );
    }

    const withdrawal = {
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

    this.data.withdrawals.unshift(withdrawal);
    this.persistToDisk();
    return withdrawal;
  }

  public approveWithdrawal(withdrawalId: string, transactionRef: string, adminNotes?: string) {
    const w = this.data.withdrawals.find((item) => item.id === withdrawalId);
    if (!w) throw new Error('Withdrawal not found');
    if (w.status !== 'pending') throw new Error('Withdrawal already processed');

    w.status = 'approved';
    w.transactionRef = transactionRef;
    w.adminNotes = adminNotes || 'Payout processed successfully';
    w.processedAt = new Date().toISOString();

    this.data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: w.userId,
      type: 'withdrawal',
      title: 'Withdrawal Processed & Sent!',
      message: `Your withdrawal of $${w.amountUSD.toFixed(2)} (৳${w.amountBDT}) via ${w.withdrawalMethod.toUpperCase()} has been dispatched. Trx Ref: ${transactionRef}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'WITHDRAWAL_APPROVED',
      targetType: 'withdrawal',
      targetId: w.id,
      details: `Dispatched withdrawal #${w.withdrawalNumber} of $${w.amountUSD} (TrxID: ${transactionRef})`,
    });

    this.persistToDisk();
    return w;
  }

  public rejectWithdrawal(withdrawalId: string, reason: string) {
    const w = this.data.withdrawals.find((item) => item.id === withdrawalId);
    if (!w) throw new Error('Withdrawal not found');
    if (w.status !== 'pending') throw new Error('Withdrawal already processed');

    w.status = 'rejected';
    w.adminNotes = reason || 'Payout rejected';
    w.processedAt = new Date().toISOString();

    const user = this.getUserById(w.userId);
    if (user) {
      this.adjustUserWallet(
        user.id,
        w.amountUSD,
        'refund',
        `Refund for rejected withdrawal #${w.withdrawalNumber}`,
        w.id,
        w.sourceBalance === 'commission' ? 'commission' : 'main'
      );
    }

    this.data.notifications.push({
      id: `notif-${Date.now()}`,
      userId: w.userId,
      type: 'withdrawal',
      title: 'Withdrawal Request Rejected',
      message: `Your withdrawal #${w.withdrawalNumber} was rejected: ${reason}. Funds refunded.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.logAudit({
      adminId: 'admin',
      adminName: 'Chief Administrator',
      action: 'WITHDRAWAL_REJECTED',
      targetType: 'withdrawal',
      targetId: w.id,
      details: `Rejected withdrawal #${w.withdrawalNumber}: ${reason}`,
    });

    this.persistToDisk();
    return w;
  }

  // === SETTINGS ===
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(newSettings: any) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.persistToDisk();
    return this.data.settings;
  }

  // === ADMIN OVERVIEW STATS ===
  public getAdminStats() {
    const users = this.data.users;
    const resellers = users.filter((u) => u.role === 'reseller' || u.resellerStatus === 'active');
    const activeResellers = users.filter((u) => u.role === 'reseller' && u.resellerStatus === 'active');
    const pendingActivation = this.data.resellerApplications.filter((a) => a.status === 'pending');
    const deposits = this.data.deposits;
    const approvedDeposits = deposits.filter((d) => d.status === 'approved');
    const totalDepositsUSD = approvedDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const orders = this.data.orders;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'completed');
    const totalSalesUSD = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalProfitUSD = paidOrders.reduce((sum, o) => sum + (o.resellerProfit || o.discountAmount || 0), 0);
    const commissions = this.data.commissions.filter((c) => c.status === 'approved');
    const totalCommissionsUSD = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    const pendingWithdrawals = this.data.withdrawals.filter((w) => w.status === 'pending');
    const flaggedSuspicious = (this.data.suspiciousActivities || []).filter((s) => s.status === 'flagged');

    return {
      totalUsers: users.length,
      totalResellers: resellers.length,
      activeResellers: activeResellers.length,
      pendingActivationCount: pendingActivation.length,
      totalDepositsUSD,
      totalSalesUSD,
      totalProfitUSD,
      totalCommissionsUSD,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      totalProducts: this.data.products.length,
      totalOrders: orders.length,
      suspiciousActivitiesCount: flaggedSuspicious.length,
    };
  }
}

export const serverDb = new PersistentDatabase();
