export type UserRole = 'customer' | 'reseller' | 'admin' | 'guest';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type ResellerStatus = 'active' | 'pending_payment' | 'pending_approval' | 'suspended' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  resellerStatus?: ResellerStatus;
  walletBalance: number;
  commissionBalance: number;
  referralCode: string;
  referredBy?: string; // ID of the user who referred this user
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  resellerDetails?: {
    businessName: string;
    country: string;
    website?: string;
    applicationStatus: 'pending' | 'approved' | 'suspended' | 'rejected';
    discountRate: number; // e.g. 0.20 for 20% discount
    totalProfit: number;
    activationFeePaid: number;
    activatedAt?: string;
  };
}

export interface ResellerProfile {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName?: string;
  phone?: string;
  activationFee: number;
  activationStatus: 'pending' | 'active' | 'suspended' | 'rejected';
  paymentMethod: PaymentMethodType;
  transactionRef: string;
  senderInfo?: string;
  screenshotUrl?: string;
  adminNote?: string;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount?: number;
}

export interface Plan {
  id: string;
  name: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly' | 'Lifetime' | 'One-Time';
  retailPrice: number;    // Regular Customer Price
  resellerPrice: number;  // Wholesale Reseller Price
  originalPrice?: number;
  features: string[];
  deliveryMethod: 'Instant Key' | 'Account Invitation' | 'License Activation' | 'Manual Provisioning';
  deliveryTime: string;
  isPopular?: boolean;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  shortDescription: string;
  image: string;
  iconName: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isFeatured: boolean;
  plans: Plan[];
  requirements?: string[];
  refundPolicy: string;
  faq: { question: string; answer: string }[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export type CurrencyCode = 'BDT' | 'USD';

export type OrderStatus =
  | 'pending'
  | 'payment_review'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'payment_rejected'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'review' | 'paid' | 'rejected' | 'failed' | 'cancelled' | 'refunded';

export type PaymentMethodType =
  | 'bkash'
  | 'nagad'
  | 'usdt_bep20'
  | 'binance_uid'
  | 'wallet'
  | 'commission_balance'
  | 'card'
  | 'crypto'
  | 'bank_transfer'
  | 'paypal';

export interface OrderTimelineItem {
  status: OrderStatus | 'payment_confirmed';
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderPaymentDetails {
  senderNumber?: string;
  senderWallet?: string;
  senderBinanceUid?: string;
  transactionId?: string;
  screenshotUrl?: string;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  resellerId?: string;
  resellerName?: string;
  productId: string;
  productName: string;
  productImage: string;
  planId: string;
  planName: string;
  billingCycle: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  currency: CurrencyCode;
  exchangeRateUsed: number;
  totalAmountInUSD: number;
  totalAmountInBDT: number;
  resellerCost?: number;     // Reseller wholesale price
  resellerProfit?: number;   // Unit profit = regular price - reseller price
  referralCommissionAmount?: number; // Snapshot 5% commission on profit
  referrerUserId?: string;
  couponCode?: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMethod: string;
  paymentDetails?: OrderPaymentDetails;
  deliveryDetails?: {
    licenseKey?: string;
    instructions?: string;
    accountEmail?: string;
    deliveredAt?: string;
  };
  internalNotes?: string;
  timeline: OrderTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'deposit'
  | 'order_payment'
  | 'refund'
  | 'commission'
  | 'adjustment'
  | 'withdrawal'
  | 'reseller_activation'
  | 'commission_transfer';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceBefore: number;
  balanceAfter: number;
  currency: CurrencyCode;
  referenceId?: string; // order id, deposit id, or commission id
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  createdAt: string;
}

export interface WalletDeposit {
  id: string;
  depositNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number; // in USD
  amountBDT: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethodType;
  transactionRef: string;
  senderInfo?: string;
  proofNote?: string;
  proofImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Withdrawal {
  id: string;
  withdrawalNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountUSD: number;
  amountBDT: number;
  sourceBalance: 'main' | 'commission';
  withdrawalMethod: 'bkash' | 'nagad' | 'usdt_bep20' | 'binance_uid';
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  referralCode: string;
  status: 'active' | 'inactive';
  totalOrdersCount: number;
  totalSalesVolumeUSD: number;
  totalProfitGeneratedUSD: number;
  totalCommissionEarnedUSD: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  customerPrice: number; // Retail selling price
  resellerPrice: number; // Wholesale cost
  profitAmount: number;  // Profit on which commission is calculated
  commissionRate: number; // e.g. 5 for 5%
  commissionAmount: number; // profitAmount * (commissionRate / 100)
  status: 'pending' | 'approved' | 'reversed';
  createdAt: string;
  reversedAt?: string;
}

export interface ResellerApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  country: string;
  website?: string;
  reason: string;
  expectedVolume: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  activationFee?: number;
  paymentMethod?: PaymentMethodType;
  transactionRef?: string;
  senderPhone?: string;
  senderInfo?: string;
  screenshotUrl?: string;
  adminFeedback?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  maxUses?: number;
  usageCount?: number;
  usedCount?: number;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  category: 'Billing' | 'Fulfillment' | 'Technical' | 'Reseller Inquiry' | 'General';
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'order' | 'payment' | 'wallet' | 'reseller' | 'referral' | 'commission' | 'withdrawal' | 'system' | 'support';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'order' | 'product' | 'user' | 'reseller' | 'deposit' | 'withdrawal' | 'commission' | 'coupon' | 'settings';
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface UsdPaymentConfig {
  usdtBep20Address: string;
  binanceUid: string;
  instructions: string;
}

export interface BdtPaymentConfig {
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant' | 'Agent';
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  instructions: string;
}

export interface AdminAccountConfig {
  username: string;
  passwordHash: string;
  salt: string;
  is2FAEnabled?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  sessionExpiryMinutes?: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  updatedAt: string;
}

export type SuspiciousActivityType =
  | 'failed_admin_login'
  | 'duplicate_transaction_id'
  | 'excessive_requests'
  | 'referral_abuse'
  | 'unauthorized_api_access'
  | 'abnormal_wallet_activity';

export interface SuspiciousActivity {
  id: string;
  type: SuspiciousActivityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  targetId?: string;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  status: 'flagged' | 'reviewed' | 'resolved' | 'pending';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface EmergencySecuritySettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  disableRegistrations: boolean;
  disableResellerRegistrations: boolean;
  disableDeposits: boolean;
  disableWithdrawals: boolean;
  disableOrders?: boolean;
  disableNewOrders?: boolean;
  enableStrictRateLimiting?: boolean;
  maxFailedLoginAttempts?: number;
  sessionExpirationMinutes?: number;
}

export interface DatabaseBackupSnapshot {
  id: string;
  label: string;
  createdAt: string;
  isAutomatic: boolean;
  fileSizeBytes: number;
  summary: {
    productsCount: number;
    ordersCount: number;
    usersCount: number;
    transactionsCount: number;
  };
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  whatsappSupportNumber: string;
  currency: string;
  currencySymbol: string;
  usdExchangeRate: number; // e.g. 120 means 1 USD = 120 BDT
  resellerActivationFeeBDT: number; // Default ৳300
  referralCommissionRate: number; // Default 5%
  commissionDestination: 'commission_wallet' | 'main_wallet';
  allowPublicRegistration: boolean;
  allowResellerApplications: boolean;
  defaultResellerDiscountPercentage: number;
  maintenanceMode: boolean;
  usd: UsdPaymentConfig;
  bdt: BdtPaymentConfig;
  paymentSettings: {
    usd: UsdPaymentConfig;
    bdt: BdtPaymentConfig;
  };
  bankPaymentDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    routingNumber?: string;
  };
  cryptoPaymentDetails: {
    usdtTronAddress: string;
    btcAddress: string;
    ethAddress: string;
  };
  enabledGateways: {
    stripe: boolean;
    paypal: boolean;
    crypto: boolean;
    bankTransfer: boolean;
    wallet: boolean;
  };
}
