import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Database,
  Lock,
  CreditCard,
  Mail,
  HardDrive,
  Terminal,
  Copy,
  CheckCircle2,
  Server,
  Layers,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminProductionConfigGuide: React.FC = () => {
  const { showToast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(id);
    showToast('success', 'Copied!', 'Snippet copied to clipboard.');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSample = `# SubNova Production Environment Variables
# Server & Port
PORT=3000
NODE_ENV=production
APP_URL=https://subnova.io

# PostgreSQL / Supabase Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.subnova.io:5432/subnova_db?sslmode=require"

# Authentication Secrets
JWT_SECRET="super-secret-production-jwt-key-change-this-in-prod"
NEXTAUTH_SECRET="another-secure-hex-string"

# Stripe Payment Gateway
STRIPE_SECRET_KEY="sk_live_51M..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51M..."

# Crypto Gateway (BTCPay Server / Coinbase Commerce)
COINBASE_COMMERCE_API_KEY="cc_live_..."
USDT_TRC20_WALLET_ADDRESS="TX89a7B8c1E90f443D87229aBbc65eF39"

# Transactional Email (Resend / SendGrid)
RESEND_API_KEY="re_123456789"
EMAIL_FROM="SubNova Licenses <fulfillment@subnova.io>"

# AWS S3 / Cloudflare R2 Storage (For Invoices & Documents)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="wJalr..."
AWS_S3_BUCKET_NAME="subnova-production-assets"`;

  const sqlSchema = `-- SubNova Production PostgreSQL Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'reseller', 'admin'
  wallet_balance NUMERIC(12,2) DEFAULT 0.00,
  reseller_tier VARCHAR(50) DEFAULT 'silver',
  reseller_discount NUMERIC(5,2) DEFAULT 25.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(100),
  short_description TEXT,
  description TEXT,
  image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  billing_cycle VARCHAR(50) NOT NULL,
  retail_price NUMERIC(10,2) NOT NULL,
  reseller_price NUMERIC(10,2) NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  stock_count INTEGER DEFAULT 0
);

CREATE TABLE inventory_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  plan_id UUID REFERENCES subscription_plans(id),
  license_key TEXT NOT NULL,
  is_assigned BOOLEAN DEFAULT false,
  assigned_to_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  reseller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  plan_id UUID REFERENCES subscription_plans(id),
  total_amount NUMERIC(10,2) NOT NULL,
  reseller_profit NUMERIC(10,2) DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL, -- 'pending', 'paid', 'failed'
  order_status VARCHAR(50) NOT NULL,   -- 'processing', 'completed', 'refunded'
  credentials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Badge variant="purple">Architecture & DevOps</Badge>
        <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 mt-2 flex items-center gap-2">
          <Server className="w-7 h-7 text-purple-400" />
          Production Deployment & Backend Integration Guide
        </h1>
        <p className="text-xs text-slate-400">
          Step-by-step documentation for wiring SubNova to live databases, payment processors, transactional email, S3 buckets, and container hosts.
        </p>
      </div>

      {/* Guide Modules */}
      <div className="space-y-6">
        {/* Module 1: Database */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              1. PostgreSQL / Supabase Database Architecture
            </h3>
            <button
              onClick={() => handleCopy(sqlSchema, 'sql')}
              className="text-xs text-purple-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              {copiedSection === 'sql' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy SQL Schema
            </button>
          </div>

          <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
            The application currently utilizes a centralized transactional repository (<code className="text-purple-400">src/services/api.ts</code>) with browser storage persistence. To migrate to a live relational database, run the DDL schema below in PostgreSQL or Supabase SQL Editor and connect Drizzle ORM or Prisma:
          </p>

          <pre className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 text-[11px] font-mono text-purple-300 overflow-x-auto border border-slate-800 max-h-60">
            {sqlSchema}
          </pre>
        </div>

        {/* Module 2: Stripe & Crypto Payments */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            2. Payment Gateway & Webhook Synchronization
          </h3>
          <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
            For production payments, wire up Stripe Checkout and USDT Webhooks:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-300 light:text-slate-700 space-y-2">
            <li>
              <strong>Stripe Webhook (<code className="text-purple-400">/api/webhooks/stripe</code>):</strong> Listen for <code className="text-emerald-400">checkout.session.completed</code> to automatically trigger license key allocation from the inventory table and notify the customer.
            </li>
            <li>
              <strong>USDT Crypto Gateway:</strong> Integrate with BTCPay Server or Coinbase Commerce to watch blockchain confirmations for TRC-20 deposits.
            </li>
          </ul>
        </div>

        {/* Module 3: Transactional Email */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            3. Transactional Email Delivery (Resend / SendGrid)
          </h3>
          <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
            Set up <code className="text-purple-400">RESEND_API_KEY</code> to automatically dispatch HTML emails containing the customer's license key, activation steps, and invoice PDF immediately after purchase.
          </p>
        </div>

        {/* Module 4: Environment Variables */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 light:bg-white border border-slate-800 light:border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              4. Production .env Variables Checklist
            </h3>
            <button
              onClick={() => handleCopy(envSample, 'env')}
              className="text-xs text-purple-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              {copiedSection === 'env' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy .env.production
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 light:bg-slate-100 text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
            {envSample}
          </pre>
        </div>
      </div>
    </div>
  );
};
