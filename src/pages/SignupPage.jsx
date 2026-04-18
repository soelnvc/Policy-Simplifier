import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, signInWithGoogle } from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import './AuthPages.css';

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      navigate('/workspace');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 6 characters.'
        : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/workspace');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        {/* Left — Brand Panel */}
        <div className="auth-page__brand">
          <div className="auth-page__brand-content">
            <span className="auth-page__brand-badge">Policy Simplifier</span>
            <h1 className="auth-page__brand-heading">
              Start your<br />clarity journey.
            </h1>
            <p className="auth-page__brand-sub">
              Free forever. No credit card required.
            </p>
          </div>
          <div className="auth-page__brand-dots" />
        </div>

        {/* Right — Form */}
        <div className="auth-page__form-panel">
          <Card variant="lifted" className="auth-page__card">
            <h2 className="auth-page__title">Create Account</h2>
            <p className="auth-page__subtitle">
              Already have an account?{' '}
              <Link to="/login" className="auth-page__link">Log in</Link>
            </p>

            {error && <div className="auth-page__error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-page__form">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="auth-page__submit"
              >
                Create Account
              </Button>
            </form>

            <div className="auth-page__divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="auth-page__google-btn"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
