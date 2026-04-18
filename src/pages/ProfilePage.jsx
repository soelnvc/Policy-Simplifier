import React from 'react';
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user } = useAuth();

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="theme-main page-content page-enter">
      <div className="container" style={{ paddingTop: 'var(--space-3xl)' }}>
        <p className="text-overline" style={{ marginBottom: '0.5rem' }}>ACCOUNT</p>
        <h1 style={{ marginBottom: '1.5rem' }}>Your Profile</h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-lg)',
          padding: 'var(--space-xl)',
          background: 'var(--snow-container-low)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-xl)',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--onyx)',
            color: 'var(--snow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-headline)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}>
            {userInitial}
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-h4)', marginBottom: '0.25rem' }}>
              {user?.displayName || 'User'}
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-body-sm)' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)' }}>
          Full profile management, avatar upload, and account preferences will be available in a future update.
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
