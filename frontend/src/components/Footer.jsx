import { Link } from 'react-router-dom';

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="divider-gold" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="navbar-logo" style={{ marginBottom: '12px' }}>
              <span className="navbar-logo-icon"><CameraIcon /></span>
              <span className="navbar-logo-text">Lens<span className="gradient-text">Craft</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', maxWidth: 280 }}>
              Capturing your most precious moments with artistry, passion, and timeless elegance.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><Link to="/services">Wedding Photography</Link></li>
              <li><Link to="/services">Portrait Sessions</Link></li>
              <li><Link to="/services">Event Coverage</Link></li>
              <li><Link to="/services">Cinematography</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/login">Customer Login</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/owner/login">Studio Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li>📍 Mumbai, India</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ hello@lenscraft.in</li>
              <li>🕐 Mon–Sat, 9am – 7pm IST</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="text-muted text-sm">© {year} LensCraft Photography. All rights reserved.</span>
          <span className="text-muted text-sm">Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
}
