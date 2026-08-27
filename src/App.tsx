import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Common & Layout Components
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { ResellerApplyPage } from './pages/ResellerApplyPage';
import { ResellerPromoPage } from './pages/ResellerPromoPage';
import { LegalPage } from './pages/LegalPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Customer Dashboard Pages
import { CustomerOverview } from './pages/customer/CustomerOverview';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { CustomerWalletPage } from './pages/customer/CustomerWalletPage';
import { CustomerSupportPage } from './pages/customer/CustomerSupportPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';
import { CustomerNotificationsPage } from './pages/customer/CustomerNotificationsPage';

// Reseller Dashboard Pages
import { ResellerOverview } from './pages/reseller/ResellerOverview';
import { ResellerWholesaleProducts } from './pages/reseller/ResellerWholesaleProducts';
import { ResellerPlaceOrderPage } from './pages/reseller/ResellerPlaceOrderPage';
import { ResellerOrdersPage } from './pages/reseller/ResellerOrdersPage';
import { ResellerProfitAnalyticsPage } from './pages/reseller/ResellerProfitAnalyticsPage';
import { ResellerCustomersPage } from './pages/reseller/ResellerCustomersPage';
import { ResellerReferralPage } from './pages/reseller/ResellerReferralPage';

// Admin Dashboard Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminCurrencySettingsPage } from './pages/admin/AdminCurrencySettingsPage';
import { AdminPaymentSettingsPage } from './pages/admin/AdminPaymentSettingsPage';
import { AdminResellersPage } from './pages/admin/AdminResellersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminAccountPage } from './pages/admin/AdminAccountPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProductionConfigGuide } from './pages/admin/AdminProductionConfigGuide';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminSecurityAuditPage } from './pages/admin/AdminSecurityAuditPage';

const AppRouter: React.FC = () => {
  const { path } = useNavigation();
  const { user } = useAuth();

  // Helper to render customer portal routes
  const renderCustomerRoute = () => {
    if (path === '/dashboard/orders') return <CustomerOrdersPage />;
    if (path === '/dashboard/wallet' || path === '/dashboard/transactions') return <CustomerWalletPage />;
    if (path === '/dashboard/support') return <CustomerSupportPage />;
    if (path === '/dashboard/profile') return <CustomerProfilePage />;
    if (path === '/dashboard/notifications') return <CustomerNotificationsPage />;
    return <CustomerOverview />;
  };

  // Helper to render reseller portal routes
  const renderResellerRoute = () => {
    if (path === '/reseller/products') return <ResellerWholesaleProducts />;
    if (path === '/reseller/place-order') return <ResellerPlaceOrderPage />;
    if (path === '/reseller/orders') return <ResellerOrdersPage />;
    if (path === '/reseller/analytics' || path === '/reseller/profit') return <ResellerProfitAnalyticsPage />;
    if (path === '/reseller/customers') return <ResellerCustomersPage />;
    if (path === '/reseller/referral') return <ResellerReferralPage />;
    if (path === '/reseller/wallet') return <CustomerWalletPage />;
    if (path === '/reseller/support') return <CustomerSupportPage />;
    return <ResellerOverview />;
  };

  // Helper to render admin portal routes
  const renderAdminRoute = () => {
    if (path === '/admin/products' || path === '/admin/products/add') return <AdminProductsPage />;
    if (path === '/admin/orders') return <AdminOrdersPage />;
    if (path === '/admin/customers') return <AdminCustomersPage />;
    if (path === '/admin/payments') return <AdminPaymentsPage />;
    if (path === '/admin/currency') return <AdminCurrencySettingsPage />;
    if (path === '/admin/payment-settings') return <AdminPaymentSettingsPage />;
    if (path === '/admin/resellers') return <AdminResellersPage />;
    if (path === '/admin/inventory') return <AdminInventoryPage />;
    if (path === '/admin/coupons') return <AdminCouponsPage />;
    if (path === '/admin/support') return <AdminSupportPage />;
    if (path === '/admin/account') return <AdminAccountPage />;
    if (path === '/admin/security' || path === '/admin/audit' || path === '/admin/backups') return <AdminSecurityAuditPage />;
    if (path === '/admin/settings') return <AdminSettingsPage />;
    if (path === '/admin/config-guide') return <AdminProductionConfigGuide />;
    return <AdminOverview />;
  };

  // Standalone Admin Login & Portal Secret Links
  if (
    path === '/admin/login' ||
    path === '/admin-login' ||
    path === '/admin-portal' ||
    path === '/admin-secret'
  ) {
    return <AdminLoginPage />;
  }

  // 1. Dashboard Layout Container (Customer, Reseller, Admin)
  if (path.startsWith('/dashboard')) {
    return (
      <DashboardLayout>
        {renderCustomerRoute()}
      </DashboardLayout>
    );
  }

  if (path.startsWith('/reseller') && path !== '/reseller/apply') {
    return (
      <DashboardLayout>
        {renderResellerRoute()}
      </DashboardLayout>
    );
  }

  if (path.startsWith('/admin')) {
    // Strict protection: Only authenticated Super Admin can access admin routes
    if (!user || user.role !== 'admin') {
      return <AdminLoginPage />;
    }

    return (
      <DashboardLayout>
        {renderAdminRoute()}
      </DashboardLayout>
    );
  }

  // 2. Public Storefront Layout
  const renderPublicPage = () => {
    if (path === '/' || path === '') return <HomePage />;
    if (path === '/products') return <ProductsPage />;
    if (path.startsWith('/product/') || path.startsWith('/products/')) return <ProductDetailPage />;
    if (path === '/checkout') return <CheckoutPage />;
    if (path === '/order-success') return <OrderSuccessPage />;
    if (path === '/reseller/apply') return <ResellerApplyPage />;
    if (path === '/reseller-program' || path === '/resellers') return <ResellerPromoPage />;
    if (path === '/login') return <LoginPage />;
    if (path === '/register') return <RegisterPage />;
    if (path === '/forgot-password') return <ForgotPasswordPage />;
    if (
      path === '/terms' ||
      path === '/privacy' ||
      path === '/refund' ||
      path === '/compliance'
    ) {
      return <LegalPage />;
    }
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-slate-950 light:bg-slate-50 text-slate-100 light:text-slate-900 flex flex-col font-sans transition-colors duration-200 selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderPublicPage()}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
            <NavigationProvider>
              <div className="relative min-h-screen">
                <GlobalSearchModal />
                <AppRouter />
              </div>
            </NavigationProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
