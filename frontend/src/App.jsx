import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { OwnerRoute, GuestRoute } from './components/RouteGuards';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Public Pages
import HomePage     from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';

// Customer Pages (now public — no login needed)
import BookingPage from './pages/customer/BookingPage';

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
        <h1 className="text-shimmer" style={{ marginBottom: '8px', fontFamily: 'var(--font-display)' }}>404</h1>
        <p className="text-secondary" style={{ marginBottom: '24px' }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-luxury" style={{ display: 'inline-flex' }}>Go Home</a>
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

            {/* Booking — now fully public, no login required */}
            <Route path="/book/:serviceId" element={<BookingPage />} />

            {/* Owner auth */}
            <Route path="/owner/login" element={<GuestRoute><OwnerLoginPage /></GuestRoute>} />

            {/* Owner dashboard — protected */}
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
