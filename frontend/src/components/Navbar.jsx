import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
    <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="6" y1="12" x2="21" y2="12"/>
    <line x1="9" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { isLoggedIn, isOwner, user, logout } = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  /* Owner mode: show dashboard links */
  if (isOwner) {
    const ownerLinks = [
      { to: '/owner/dashboard', label: 'Dashboard' },
      { to: '/owner/bookings',  label: 'Bookings'  },
      { to: '/owner/calendar',  label: 'Calendar'  },
      { to: '/owner/services',  label: 'Services'  },
    ];
    return (
      <>
        <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
          <div className="container flex-between" style={{ height: 'var(--nav-height)' }}>
            <Link to="/owner/dashboard" className="navbar-logo">
              <span className="navbar-logo-icon"><CameraIcon /></span>
              <span className="navbar-logo-text">Lens<span className="gradient-text">Craft</span></span>
            </Link>
            <div className="navbar-links hide-mobile">
              {ownerLinks.map(l => (
                <Link key={l.to} to={l.to} className={`navbar-link${location.pathname.startsWith(l.to) ? ' active' : ''}`}>{l.label}</Link>
              ))}
            </div>
            <div className="navbar-actions hide-mobile">
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginRight: '8px' }}>{user?.name?.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
            <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
          </div>
          {menuOpen && (
            <div className="navbar-mobile-menu">
              {ownerLinks.map(l => <Link key={l.to} to={l.to} className="navbar-mobile-link">{l.label}</Link>)}
              <div className="navbar-mobile-actions">
                <button className="btn btn-ghost w-full" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </nav>
        <div style={{ height: 'var(--nav-height)' }} />
      </>
    );
  }

  /* Public / visitor navbar */
  const publicLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/services', label: 'Services' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="container flex-between" style={{ height: 'var(--nav-height)' }}>

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon"><CameraIcon /></span>
            <span className="navbar-logo-text" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Lens<span className="gradient-text">Craft</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="navbar-links hide-mobile">
            {publicLinks.map(l => (
              <Link key={l.to} to={l.to} className={`navbar-link${isActive(l.to) ? ' active' : ''}`}>{l.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="navbar-actions hide-mobile" style={{ gap: '16px' }}>
            {/* Subtle owner link */}
            <Link
              to="/owner/login"
              style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--color-gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
            >
              Owner
            </Link>
            <Link to="/services" className="btn btn-luxury btn-sm" style={{ padding: '10px 24px' }}>
              Book Now
            </Link>
          </div>

          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="navbar-mobile-menu">
            {publicLinks.map(l => (
              <Link key={l.to} to={l.to} className="navbar-mobile-link">{l.label}</Link>
            ))}
            <div className="navbar-mobile-actions">
              <Link to="/services" className="btn btn-luxury w-full">Book a Session</Link>
              <Link to="/owner/login" className="btn btn-ghost w-full" style={{ fontSize: '0.85rem' }}>Owner Login</Link>
            </div>
          </div>
        )}
      </nav>
      <div style={{ height: 'var(--nav-height)' }} />
    </>
  );
}
