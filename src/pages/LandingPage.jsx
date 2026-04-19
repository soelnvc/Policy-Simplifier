import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ScrollSequence from '../components/animation/ScrollSequence';
import Button from '../components/common/Button';
import './LandingPage.css';

// Reusable component to handle the scroll reveal logic cleanly
function RevealBlock({ children, direction = 'up', className = '', delayClass = '', style = {} }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div 
      ref={ref} 
      className={`reveal-${direction} ${delayClass} ${isVisible ? 'is-visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  // Enforce Dark Page Context & Scroll Snap natively on the HTML element
  useEffect(() => {
    document.body.classList.add('is-dark-page');
    document.documentElement.classList.add('snap-scroll-active');
    
    return () => {
      document.body.classList.remove('is-dark-page');
      document.documentElement.classList.remove('snap-scroll-active');
    };
  }, []);

  return (
    <div className="landing-page">
      
      {/* ── SCREEN 1: HERO (Cinematic Sequence) ── */}
      <section className="hero-track">
        <div className="hero-sticky">
          {/* The Animation Engine */}
          <ScrollSequence 
            frameCount={82} 
            path="/web_sequence/animation_policy_"
            extension="webp"
          />

          {/* Accent Circle (Hides watermark + Holds Title) */}
          <div className="hero-accent-circle">
            <div className="hero-integrated-content">
              <RevealBlock direction="up" delayClass="delay-300">
                <h1>Policy Simplifier</h1>
                <p>Clarity for the common man.</p>
              </RevealBlock>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREEN 2: THE PROBLEM ── */}
      <section className="snap-section">
        {/* Mirror Circle for Shared Decor Effect */}
        <div className="shared-circle-screen2" />
        
        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-100">
            <p className="text-overline" style={{ color: 'var(--accent-red)', marginBottom: 'var(--space-sm)' }}>THE PROBLEM</p>
            <h2 className="landing-headline" style={{ fontSize: 'var(--text-h1)' }}>Defining the problem</h2>
            <p className="landing-subheadline">
              Insurance companies bury their exclusions, limits, and traps deep inside 40-page PDF documents full of archaic legal jargon. When tragedy strikes, people find out they aren't actually covered.
            </p>
          </RevealBlock>
          
          <RevealBlock direction="right" delayClass="delay-200">
            <div className="placeholder-box">
              <span>[ Image defining statistics how people suffer ]</span>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 3: THE SOLUTION ── */}
      <section className="snap-section">
        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-200">
            <div className="placeholder-box">
              <span>[ Cool animation of AI ]</span>
            </div>
          </RevealBlock>

          <RevealBlock direction="right" delayClass="delay-100">
            <p className="text-overline" style={{ color: 'var(--accent-green)', marginBottom: 'var(--space-sm)' }}>THE SOLUTION</p>
            <h2 className="landing-headline" style={{ fontSize: 'var(--text-h1)' }}>How we are solving it</h2>
            <p className="landing-subheadline">
              Our neural engine instantly reads the entire policy, extracting hidden limits, mapping exact coverage scores, and flagging critical dangers—transforming an unreadable contract into an editorial dashboard.
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 4: HOW TO USE ── */}
      <section className="snap-section">
        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-100">
            <p className="text-overline" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>WORKFLOW</p>
            <h2 className="landing-headline" style={{ fontSize: 'var(--text-h1)' }}>How to use</h2>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--snow)' }}>1.</span>
                <p className="landing-subheadline" style={{ fontSize: 'var(--text-body)' }}>Drag and drop your insurance PDF into the secure portal.</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--snow)' }}>2.</span>
                <p className="landing-subheadline" style={{ fontSize: 'var(--text-body)' }}>Wait 5 seconds for Gemini AI to process the document.</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--snow)' }}>3.</span>
                <p className="landing-subheadline" style={{ fontSize: 'var(--text-body)' }}>Review your generated risk dashboard and coverage score.</p>
              </div>
            </div>
          </RevealBlock>

          <RevealBlock direction="right" delayClass="delay-200">
            <div className="placeholder-box">
              <span>[ Demo Video of use ]</span>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 5: CAPABILITIES & FOOTER ALIGNMENT ── */}
      <section className="snap-section snap-section--auto">
        <div className="container" style={{ paddingBottom: 'var(--space-4xl)' }}>
          <RevealBlock direction="up" delayClass="delay-100" className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="landing-headline" style={{ fontSize: 'var(--text-h2)' }}>Rest of the functionalities and perks</h2>
            <p className="landing-subheadline" style={{ margin: '0 auto' }}>
              Built to protect your assets natively.
            </p>
          </RevealBlock>

          <div className="feature-grid">
            <RevealBlock direction="up" delayClass="delay-200">
              <div className="feature-card">
                <h3>Multi-Policy Memory</h3>
                <p>All your policies are saved securely to your Google Cloud Firestore dashboard for easy tracking across years.</p>
              </div>
            </RevealBlock>
            <RevealBlock direction="up" delayClass="delay-300">
              <div className="feature-card">
                <h3>Side-by-Side Compare</h3>
                <p>Upload two competing quotes and let the engine mathematically decide which one covers you better.</p>
              </div>
            </RevealBlock>
            <RevealBlock direction="up" delayClass="delay-400">
              <div className="feature-card">
                <h3>Jargon Decoder</h3>
                <p>Hover over complex terms like "Indemnity" or "Subrogation" to see instant plain-English definitions.</p>
              </div>
            </RevealBlock>
          </div>

          <RevealBlock direction="up" delayClass="delay-400" className="flex-center" style={{ marginTop: 'var(--space-3xl)' }}>
            <Link to="/workspace">
              <Button variant="primary" size="lg" style={{ background: 'var(--snow)', color: 'var(--onyx)', fontWeight: 'bold' }}>
                Join the Beta
              </Button>
            </Link>
          </RevealBlock>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
