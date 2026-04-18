import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  // Ensure the navbar knows we are on a dark page
  useEffect(() => {
    document.body.classList.add('is-dark-page');
    return () => document.body.classList.remove('is-dark-page');
  }, []);

  return (
    <div className="landing-page">
      {/* ── HERO SECTION ── */}
      <section className="hero-3d">
        <div className="hero-3d__content">
          <p className="text-overline animate-fade-in-up" style={{ color: 'var(--text-on-onyx-muted)', marginBottom: '1rem', animationDelay: '0.2s' }}>
            THE FUTURE OF INSURANCE
          </p>
          <h1 className="hero-3d__header animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Policy <br /> Simplifier
          </h1>
          <p className="hero-3d__subheader animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            Transforming complex insurance policies into structured, human-readable insights. 
            Confidence in your coverage, powered by intelligence.
          </p>
          
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', animationDelay: '0.8s' }}>
            <Link to="/signup" className="button button--primary" style={{ background: 'var(--snow)', color: 'var(--onyx)' }}>
              Get Started
            </Link>
            <Link to="/login" className="button button--secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--snow)' }}>
              Log In
            </Link>
          </div>
        </div>

        {/* The Floor Reference — Now an ambient gradient background */}
        <div className="hero-3d__floor" />
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="landing-section">
        <div className="container">
          <div style={{ maxWidth: '600px', marginBottom: 'var(--space-4xl)' }}>
            <p className="text-overline" style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>CAPABILITIES</p>
            <h2 style={{ color: 'var(--snow)', fontSize: 'var(--text-h1)' }}>Designed for Clarity.</h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'var(--space-xl)' 
          }}>
            <div className="glass--dark" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ color: 'var(--snow)', marginBottom: 'var(--space-sm)' }}>AI-Powered Analysis</h3>
              <p style={{ color: 'var(--text-on-onyx-muted)' }}>
                Upload any PDF policy. Our neural engine extracts exclusions, limits, and fine print in seconds.
              </p>
            </div>

            <div className="glass--dark" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ color: 'var(--snow)', marginBottom: 'var(--space-sm)' }}>Side-by-Side Compare</h3>
              <p style={{ color: 'var(--text-on-onyx-muted)' }}>
                Compare two policies instantly. We highlight the gaps your broker might have missed.
              </p>
            </div>

            <div className="glass--dark" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ color: 'var(--snow)', marginBottom: 'var(--space-sm)' }}>Risk Dashboard</h3>
              <p style={{ color: 'var(--text-on-onyx-muted)' }}>
                Visualize your coverage across health, life, and property in one unified editorial dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="landing-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'var(--snow)', fontSize: 'var(--text-h2)', marginBottom: 'var(--space-lg)' }}> Ready to simplify your protection?</h2>
          <Link to="/signup" className="button button--primary" style={{ background: 'var(--snow)', color: 'var(--onyx)', padding: 'var(--space-md) var(--space-2xl)' }}>
            Join the Alpha
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
