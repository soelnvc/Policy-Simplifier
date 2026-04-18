import React from 'react';
import './Footer.css';

/**
 * Footer — Premium dark glassmorphic footer with editorial layout.
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Decorative top edge */}
      <div className="footer__edge" />

      <div className="footer__inner container">
        {/* Brand Column */}
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-mark">P</span>
            <span className="footer__logo-text">Policy Simplifier</span>
          </div>
          <p className="footer__tagline">
            Clarity for the common man. We transform complex insurance policies into 
            structured insights — so you never sign what you don't understand.
          </p>
          <div className="footer__badge">
            <span className="footer__badge-dot" />
            <span className="footer__badge-text">AI-Powered Analysis</span>
          </div>
        </div>

        {/* Link Columns */}
        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Product</h4>
            <a href="/workspace" className="footer__link">Analysis Workspace</a>
            <a href="/dashboard" className="footer__link">Risk Dashboard</a>
            <a href="/compare" className="footer__link">Policy Comparison</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <a href="/login" className="footer__link">Log In</a>
            <a href="/signup" className="footer__link">Create Account</a>
            <a href="/settings" className="footer__link">Settings & Export</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Resources</h4>
            <span className="footer__link footer__link--muted">Documentation</span>
            <span className="footer__link footer__link--muted">Privacy Policy</span>
            <span className="footer__link footer__link--muted">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom container">
        <p className="footer__copy">
          © {currentYear} Policy Simplifier
        </p>
        <p className="footer__motto">
          From the people, for the people.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
