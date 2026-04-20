import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '../../services/authService';
import './Navbar.css';

/**
 * Navbar — Frosted glass floating navigation bar.
 * Auth-aware: shows Login/Signup or user avatar + profile dropdown.
 * Uses React Router <Link> for SPA navigation.
 */
function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // 'workspace', 'dashboard', 'compare'
  const profileRef = useRef(null);
  const timeoutRef = useRef(null);

  // Mega Menu Content
  const megaMenuContent = {
    workspace: {
      header: 'Explore Workspace',
      columns: [
        {
          title: 'Actions',
          links: [
            { label: 'New Analysis', path: '/workspace', desc: 'Start a new policy breakdown' },
          ]
        },
        {
          title: 'Analysis Features',
          links: [
            { label: 'Coverage Breakdown', path: '/workspace', desc: "See exactly what is and isn't covered" },
            { label: 'Risk Identification', path: '/workspace', desc: 'Spot hidden dangers in fine print' },
            { label: 'Jargon Decoder', path: '/workspace', desc: 'Translate legal terms into plain English' },
          ]
        }
      ]
    },
    dashboard: {
      header: 'Portfolio Insights',
      columns: [
        {
          title: 'Analytics',
          links: [
            { label: 'Portfolio Overview', path: '/dashboard', desc: 'High-level performance metrics and score' },
            { label: 'Category Breakdown', path: '/dashboard', desc: 'Health, Auto, Home, and Life segments' },
          ]
        },
        {
          title: 'Reports',
          links: [
            { label: 'Critical Risks', path: '/dashboard', desc: 'Top vulnerabilities across all policies' },
            { label: 'Recent Analyses', path: '/policies', desc: 'Quickly access your latest policy data' },
          ]
        }
      ]
    },
    compare: {
      header: 'Policy Comparison',
      columns: [
        {
          title: 'Engines',
          links: [
            { label: 'Side-by-Side Comparison', path: '/compare', desc: 'Directly compare two policies clause-by-clause' },
          ]
        }
      ]
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await logOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  const handleProfileNav = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  // Mega Menu Hover Handlers
  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 300); // Increased for stability
  };

  const cancelLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const navClass = [
    'navbar',
    scrolled && 'navbar--scrolled',
    mobileOpen && 'navbar--mobile-open',
    activeMenu && 'navbar--menu-open'
  ].filter(Boolean).join(' ');

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const userName = user?.displayName || 'User';
  const userEmail = user?.email || '';

  return (
    <>
      <header 
        className={navClass} 
      >
        <nav 
          className="navbar__inner container"
          onMouseEnter={cancelLeave}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={closeMobile} onMouseEnter={() => setActiveMenu(null)}>
            <span className="navbar__logo-mark">P</span>
            <span className="navbar__logo-text">Policy Simplifier</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar__links hide-mobile">
            <Link 
              to="/workspace" 
              className={`navbar__link ${activeMenu === 'workspace' ? 'navbar__link--active' : ''}`}
              onMouseEnter={() => {
                console.log('Hovered Workspace');
                handleMouseEnter('workspace');
              }}
            >
              Workspace
            </Link>
            <Link 
              to="/dashboard" 
              className={`navbar__link ${activeMenu === 'dashboard' ? 'navbar__link--active' : ''}`}
              onMouseEnter={() => {
                console.log('Hovered Dashboard');
                handleMouseEnter('dashboard');
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/compare" 
              className={`navbar__link ${activeMenu === 'compare' ? 'navbar__link--active' : ''}`}
              onMouseEnter={() => {
                console.log('Hovered Compare');
                handleMouseEnter('compare');
              }}
            >
              Compare
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="navbar__actions hide-mobile">
            {user ? (
              <div className="navbar__profile" ref={profileRef}>
                <button
                  className={`navbar__avatar ${profileOpen ? 'navbar__avatar--active' : ''}`}
                  onClick={() => setProfileOpen(!profileOpen)}
                  onMouseEnter={() => setActiveMenu(null)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  {userInitial}
                </button>

                {/* ── Profile Dropdown ── */}
                <div className={`profile-dropdown ${profileOpen ? 'profile-dropdown--open' : ''}`}>
                  <button className="profile-dropdown__header" onClick={() => handleProfileNav('/profile')}>
                    <div className="profile-dropdown__avatar">{userInitial}</div>
                    <div className="profile-dropdown__user-info">
                      <span className="profile-dropdown__name">{userName}</span>
                      <span className="profile-dropdown__email">{userEmail}</span>
                    </div>
                  </button>
                  <div className="profile-dropdown__divider" />
                  <button className="profile-dropdown__item" onClick={() => handleProfileNav('/settings')}>Settings</button>
                  <button className="profile-dropdown__item profile-dropdown__item--danger" onClick={handleLogout}>Log Out</button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar__link" onMouseEnter={() => setActiveMenu(null)}>Log In</Link>
                <Link to="/signup" className="navbar__cta" onMouseEnter={() => setActiveMenu(null)}>Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </nav>
        {/* ── Mega Menu ── */}
        <div 
          className={`navbar__mega-menu ${activeMenu ? 'navbar__mega-menu--open' : ''}`}
          onMouseEnter={cancelLeave}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container navbar__mega-menu-inner">
            {['workspace', 'dashboard', 'compare'].map((key) => (
              <div 
                key={key}
                className="row" 
                style={{ display: activeMenu === key ? 'flex' : 'none' }}
              >
                <div className="navbar__mega-menu-left">
                  <p className="navbar__mega-menu-header">{megaMenuContent[key].header}</p>
                </div>
                <div className="navbar__mega-menu-grid">
                  {megaMenuContent[key].columns.map((col, idx) => (
                    <div key={idx} className="navbar__mega-menu-column">
                      <h4 className="navbar__mega-menu-title">{col.title}</h4>
                      <div className="navbar__mega-menu-links">
                        {col.links.map((link, lidx) => (
                          <Link key={lidx} to={link.path} className="navbar__mega-menu-link">
                            <span className="link-label">{link.label}</span>
                            <span className="link-desc">{link.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Menu (unchanged for simplicity) */}
        {mobileOpen && (
          <div className="navbar__mobile-menu">
            <Link to="/workspace" className="navbar__mobile-link" onClick={closeMobile}>Workspace</Link>
            <Link to="/dashboard" className="navbar__mobile-link" onClick={closeMobile}>Dashboard</Link>
            <Link to="/compare" className="navbar__mobile-link" onClick={closeMobile}>Compare</Link>
          </div>
        )}
      </header>
      
      {/* ── Background Blur Overlay (Moved outside header for z-index sanity) ── */}
      <div 
        className={`navbar__overlay ${activeMenu ? 'navbar__overlay--visible' : ''}`} 
      />
    </>
  );
}

export default Navbar;
