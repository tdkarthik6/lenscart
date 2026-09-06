import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, OwnerRoute, GuestRoute } from './components/RouteGuards';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Public Pages
import HomePage      from './pages/public/HomePage';
import ServicesPage  from './pages/public/ServicesPage';
import LoginPage     from './pages/public/LoginPage';
import RegisterPage  from './pages/public/RegisterPage';

// Customer Pages
import BookingPage     from './pages/customer/BookingPage';
import MyBookingsPage  from './pages/customer/MyBookingsPage';

// Owner Pages
import OwnerLoginPage    from './pages/owner/OwnerLoginPage';
import DashboardPage     from './pages/owner/DashboardPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import CalendarPage      from './pages/owner/CalendarPage';
import OwnerServicesPage from './pages/owner/OwnerServicesPage';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-container flex-center" style={{ minHeight: '60vh', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📷</div>
        <h1 className="gradient-text" style={{ marginBottom: '8px' }}>404</h1>
        <p className="text-secondary">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3500,
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
            },
          }}
        />
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />

            {/* Guest-only (redirect if logged in) */}
            <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/owner/login" element={<GuestRoute><OwnerLoginPage /></GuestRoute>} />

            {/* Customer-protected */}
            <Route path="/book/:serviceId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/my-bookings"     element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />

            {/* Owner-protected */}
            <Route path="/owner/dashboard" element={<OwnerRoute><DashboardPage /></OwnerRoute>} />
            <Route path="/owner/bookings"  element={<OwnerRoute><OwnerBookingsPage /></OwnerRoute>} />
            <Route path="/owner/calendar"  element={<OwnerRoute><CalendarPage /></OwnerRoute>} />
            <Route path="/owner/services"  element={<OwnerRoute><OwnerServicesPage /></OwnerRoute>} />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
