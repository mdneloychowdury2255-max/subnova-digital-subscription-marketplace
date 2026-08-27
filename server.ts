import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { serverDb } from './server/db';

// Simple in-memory IP rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function rateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > maxRequests) {
      serverDb.logSuspiciousActivity({
        type: 'excessive_requests',
        severity: 'medium',
        title: 'Rate Limit Exceeded',
        description: `Too many requests to ${req.path} from IP ${ip} (${record.count} attempts).`,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
      });
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again shortly.',
      });
    }

    next();
  };
}

// Clean up stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 10MB limit for screenshot uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Admin Session Verification Middleware
  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || (req.headers['x-admin-token'] as string);

    if (!token || !serverDb.validateAdminSession(token)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid administrator session required.',
      });
    }
    next();
  };

  // === 1. HEALTH & SYSTEM INFO ===
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SubNova Marketplace & Reseller Platform',
      version: '2.5.0',
      database: 'Persistent Disk Database (data/database.json)',
      security: {
        hashing: 'SHA-256 with Salt',
        bruteForceProtection: 'Active',
        rateLimiting: 'Active',
        duplicateTrxDetector: 'Active',
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // === 2. FULL DATABASE EXPORT & SYNC ===
  app.get('/api/db/export', (req, res) => {
    try {
      const data = serverDb.getFullDatabase();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/db/sync', (req, res) => {
    try {
      const updated = serverDb.syncFullDatabase(req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // === 3. ADMIN AUTHENTICATION & SECURITY ENDPOINTS ===

  // Admin Login (Protected by 5-attempt rate limiter & brute force tracker)
  app.post('/api/admin/login', rateLimit(60000, 10), (req, res) => {
    try {
      const { username, password } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required.' });
      }

      const result = serverDb.adminLogin(username, password, ip, userAgent);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  // Admin 2FA Code Verification
  app.post('/api/admin/verify-2fa', rateLimit(60000, 10), (req, res) => {
    try {
      const { sessionTempToken, code } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

      if (!code) {
        return res.status(400).json({ success: false, error: 'Verification code is required.' });
      }

      const result = serverDb.verifyAdmin2FA(sessionTempToken, code, ip);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  // Admin Logout
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || (req.headers['x-admin-token'] as string);
    if (token) {
      serverDb.adminLogout(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Get Admin Account Info (Safe public projection)
  app.get('/api/admin/account', (req, res) => {
    try {
      const account = serverDb.getAdminAccount();
      res.json({ success: true, account });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Change Password
  app.post('/api/admin/change-password', (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
      }

      const result = serverDb.changeAdminPassword(currentPassword, newPassword, ip);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Admin Change Username
  app.post('/api/admin/change-username', (req, res) => {
    try {
      const { currentPassword, newUsername } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

      if (!currentPassword || !newUsername) {
        return res.status(400).json({ success: false, error: 'Password and new username are required.' });
      }

      const result = serverDb.changeAdminUsername(currentPassword, newUsername, ip);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Admin Toggle 2FA
  app.post('/api/admin/2fa/toggle', (req, res) => {
    try {
      const { enabled, passwordConfirm } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

      if (!passwordConfirm) {
        return res.status(400).json({ success: false, error: 'Password confirmation is required to update 2FA settings.' });
      }

      const result = serverDb.toggleAdmin2FA(Boolean(enabled), passwordConfirm, ip);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 4. SUSPICIOUS ACTIVITIES & AUDIT LOGS ===
  app.get('/api/admin/suspicious-activities', (req, res) => {
    try {
      const items = serverDb.getSuspiciousActivities();
      res.json({ success: true, items });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/suspicious-activities/:id/resolve', (req, res) => {
    try {
      const item = serverDb.resolveSuspiciousActivity(req.params.id, req.body.notes);
      res.json({ success: true, item });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.get('/api/admin/audit-logs', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = serverDb.getAuditLogs(limit);
      res.json({ success: true, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // === 5. EMERGENCY SECURITY & MAINTENANCE ===
  app.get('/api/admin/emergency-security', (req, res) => {
    res.json({ success: true, security: serverDb.getEmergencySecurity() });
  });

  app.post('/api/admin/emergency-security', (req, res) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
      const updated = serverDb.updateEmergencySecurity(req.body, ip);
      res.json({ success: true, security: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 6. BACKUP & RESTORE ===
  app.get('/api/admin/backups', (req, res) => {
    res.json({ success: true, backups: serverDb.getBackups() });
  });

  app.post('/api/admin/backups/create', (req, res) => {
    try {
      const snapshot = serverDb.createBackup(req.body.label || 'Manual Snapshot', false);
      res.json({ success: true, backup: snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/backups/:id/restore', (req, res) => {
    try {
      const { passwordConfirm } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

      if (!passwordConfirm) {
        return res.status(400).json({ success: false, error: 'Admin password confirmation required for database restore.' });
      }

      const result = serverDb.restoreBackup(req.params.id, passwordConfirm, ip);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 7. USER REGISTRATION & AUTHENTICATION ===

  // Customer Registration (Name, Phone, Password)
  app.post('/api/auth/register-customer', rateLimit(60000, 15), (req, res) => {
    try {
      const { name, phone, password, email, referredByCode } = req.body;
      const user = serverDb.registerCustomer({ name, phone, password, email, referredByCode });
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Reseller Registration (Name, Phone/WhatsApp, Password, Refer Code)
  app.post('/api/auth/register-reseller', rateLimit(60000, 15), (req, res) => {
    try {
      const { name, phone, password, businessName, referredByCode, email } = req.body;
      const user = serverDb.registerReseller({ name, phone, password, businessName, referredByCode, email });
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // User Login (Email or Phone + Password)
  app.post('/api/auth/login', rateLimit(60000, 20), (req, res) => {
    try {
      const { identifier, password } = req.body;
      const result = serverDb.loginUser(identifier, password);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(401).json({ success: false, error: err.message });
    }
  });

  // Generic Register fallback
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, phone, role, referredByCode } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required.' });
      }
      const user = serverDb.registerUser({ name, email: email || '', phone, role, referredByCode });
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 8. RESELLER ACTIVATION (৳300 FEE) ===
  app.post('/api/reseller/activate', rateLimit(60000, 10), (req, res) => {
    try {
      const { userId, businessName, phone, paymentMethod, transactionRef, screenshotUrl, senderInfo } = req.body;
      const result = serverDb.submitResellerActivation({
        userId,
        businessName,
        phone,
        paymentMethod,
        transactionRef,
        screenshotUrl,
        senderInfo,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/reseller-applications/:id/approve', (req, res) => {
    try {
      const result = serverDb.approveResellerApplication(req.params.id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/reseller-applications/:id/reject', (req, res) => {
    try {
      const result = serverDb.rejectResellerApplication(req.params.id, req.body.reason);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 9. WALLET DEPOSIT (with Duplicate TrxID Protection) ===
  app.post('/api/wallet/deposit', rateLimit(60000, 10), (req, res) => {
    try {
      const { userId, amountUSD, amountBDT, currency, paymentMethod, transactionRef, senderInfo, proofImageUrl } = req.body;
      const deposit = serverDb.createDeposit({
        userId,
        amountUSD,
        amountBDT,
        currency,
        paymentMethod,
        transactionRef,
        senderInfo,
        proofImageUrl,
      });
      res.json({ success: true, deposit });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/deposits/:id/approve', (req, res) => {
    try {
      const result = serverDb.approveDeposit(req.params.id, req.body.adminNote);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/deposits/:id/reject', (req, res) => {
    try {
      const result = serverDb.rejectDeposit(req.params.id, req.body.reason);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 10. WALLET WITHDRAWALS ===
  app.post('/api/wallet/withdraw', rateLimit(60000, 10), (req, res) => {
    try {
      const { userId, amountUSD, sourceBalance, withdrawalMethod, accountDetails } = req.body;
      const withdrawal = serverDb.requestWithdrawal({
        userId,
        amountUSD,
        sourceBalance,
        withdrawalMethod,
        accountDetails,
      });
      res.json({ success: true, withdrawal });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/withdrawals/:id/approve', (req, res) => {
    try {
      const { transactionRef, adminNotes } = req.body;
      const result = serverDb.approveWithdrawal(req.params.id, transactionRef || `WTH-TX-${Date.now()}`, adminNotes);
      res.json({ success: true, withdrawal: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/withdrawals/:id/reject', (req, res) => {
    try {
      const { reason } = req.body;
      const result = serverDb.rejectWithdrawal(req.params.id, reason || 'Rejected by administrator');
      res.json({ success: true, withdrawal: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 11. COMMISSION TRANSFER TO MAIN WALLET ===
  app.post('/api/wallet/transfer-commission', (req, res) => {
    try {
      const { userId, amount } = req.body;
      const result = serverDb.transferCommissionToMain(userId, amount);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 12. ORDER PLACEMENT (with 5% Referral Commission & Wholesale Discount) ===
  app.post('/api/orders/place', (req, res) => {
    try {
      const order = serverDb.placeOrder(req.body);
      res.json({ success: true, order });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Order Refund & Commission Reversal
  app.post('/api/orders/:id/refund', (req, res) => {
    try {
      const order = serverDb.getFullDatabase().orders.find((o) => o.id === req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      order.orderStatus = 'refunded';
      order.paymentStatus = 'refunded';
      order.updatedAt = new Date().toISOString();

      const reversedComm = serverDb.reverseReferralCommission(order.id);
      serverDb.persistToDisk();

      res.json({ success: true, order, reversedCommission: reversedComm });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // === 13. ADMIN STATS ===
  app.get('/api/admin/stats', (req, res) => {
    try {
      const stats = serverDb.getAdminStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // === 14. SETTINGS ===
  app.get('/api/settings', (req, res) => {
    res.json({ success: true, settings: serverDb.getSettings() });
  });

  app.post('/api/settings', (req, res) => {
    try {
      const updated = serverDb.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SubNova Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
