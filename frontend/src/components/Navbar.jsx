import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { isLoggedIn, isOwner, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isOwner
    ? [
        { to: '/owner/dashboard', label: 'Dashboard' },
        { to: '/owner/bookings',  label: 'Bookings'  },
        { to: '/owner/calendar',  label: 'Calendar'  },
        { to: '/owner/services',  label: 'Services'  },
      ]
    : [
        { to: '/',            label: 'Home'     },
        { to: '/services',    label: 'Services' },
        ...(isLoggedIn ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
      ];

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="container flex-between" style={{ height: 'var(--nav-height)' }}>
          {/* Logo */}
          <Link to={isOwner ? '/owner/dashboard' : '/'} className="navbar-logo">
            <span className="navbar-logo-icon"><CameraIcon /></span>
            <span className="navbar-logo-text">Lens<span className="gradient-text">Craft</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-links hide-mobile">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`navbar-link${location.pathname === l.to ? ' active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions hide-mobile">
            {isLoggedIn ? (
              <div className="navbar-user">
                <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="navbar-mobile-menu">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="navbar-mobile-link">{l.label}</Link>
            ))}
            <div className="navbar-mobile-actions">
              {isLoggedIn ? (
                <button className="btn btn-ghost w-full" onClick={handleLogout}>Logout</button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost w-full">Login</Link>
                  <Link to="/register" className="btn btn-primary w-full">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <div style={{ height: 'var(--nav-height)' }} />
    </>
  );
}
