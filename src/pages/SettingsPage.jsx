import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFavoritePolicies, toggleFavoritePolicy } from '../services/dbService';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import './SettingsPage.css';

function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState({
    renewalReminders: true,
    analysisComplete: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  // Export
  const [exportFormat, setExportFormat] = useState('pdf');

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Saved (Favorite) policies
  const navigate = useNavigate();
  const [favoritePolicies, setFavoritePolicies] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Fetch Favorites
  useEffect(() => {
    async function fetchFavs() {
      if (!user?.uid) return;
      try {
        const favs = await getFavoritePolicies(user.uid);
        setFavoritePolicies(favs);
      } catch (err) {
        console.error("Failed fetching favorites", err);
      } finally {
        setLoadingFavorites(false);
      }
    }
    fetchFavs();
  }, [user]);

  const handleUnfavorite = async (e, policyId) => {
    e.stopPropagation();
    try {
      await toggleFavoritePolicy(user.uid, policyId, false);
      setFavoritePolicies(prev => prev.filter(p => p.id !== policyId));
      addToast('Removed from favorites.', 'info');
    } catch (err) {
      addToast('Failed to update.', 'error');
    }
  };

  const handleViewPolicy = (policy) => {
    navigate('/workspace', { state: { policy } });
  };

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  // Handlers
  const handleProfileSave = (e) => {
    e.preventDefault();
    addToast('Profile information saved successfully.', 'success');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    
    addToast('Password updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    setDeleteConfirm('');
    addToast('Account deletion initiated.', 'warning');
    // In production: call Firebase deleteUser()
  };

  return (
    <div className="theme-main page-content page-enter">
      <div className="settings">
        <div className="container">
          {/* Header */}
          <div className="settings__header">
            <div>
              <p className="text-overline" style={{ marginBottom: '0.25rem' }}>ACCOUNT</p>
              <h1 className="settings__title">Settings</h1>
              <p className="settings__subtitle">Manage your profile, preferences, and account.</p>
            </div>
          </div>

          <div className="settings__layout">
            {/* ── Sidebar Nav ── */}
            <nav className="settings__nav">
              <a href="#profile" className="settings__nav-item settings__nav-item--active">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </a>
              <a href="#security" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Security
              </a>
              <a href="#policies" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Saved Policies
              </a>
              <a href="#notifications" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                Notifications
              </a>
              <a href="#export" className="settings__nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Export
              </a>
              <a href="#danger" className="settings__nav-item settings__nav-item--danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Danger Zone
              </a>
            </nav>

            {/* ── Content ── */}
            <div className="settings__content">
              {/* ─── Profile Section ─── */}
              <section id="profile">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Profile Information</h2>
                    <p className="settings__card-desc">Update your personal details.</p>
                  </div>
                  <form onSubmit={handleProfileSave}>
                    <div className="settings__avatar-row">
                      <div className="settings__avatar">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="" className="settings__avatar-img" />
                        ) : (
                          <span className="settings__avatar-letter">{userInitial}</span>
                        )}
                      </div>
                      <div className="settings__avatar-info">
                        <p className="settings__avatar-name">{user?.displayName || 'User'}</p>
                        <p className="settings__avatar-email">{email}</p>
                      </div>
                    </div>

                    <div className="settings__field-group">
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                      <Input
                        label="Email"
                        value={email}
                        disabled
                        helperText="Email cannot be changed."
                      />
                    </div>

                    <div className="settings__card-actions">
                      <Button type="submit" variant="primary">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              </section>

              {/* ─── Security Section ─── */}
              <section id="security">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Password & Security</h2>
                    <p className="settings__card-desc">Keep your account secure.</p>
                  </div>
                  <form onSubmit={handlePasswordChange}>
                    <div className="settings__field-group">
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={passwordError}
                      />
                    </div>
                    <div className="settings__card-actions">
                      <Button type="submit" variant="primary">
                        Update Password
                      </Button>
                    </div>
                  </form>

                  <div className="settings__security-info">
                    <div className="settings__security-item">
                      <div className="settings__security-icon settings__security-icon--ok">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p className="settings__security-label">Login method</p>
                        <p className="settings__security-value">
                          {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password'}
                        </p>
                      </div>
                    </div>
                    <div className="settings__security-item">
                      <div className="settings__security-icon settings__security-icon--ok">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p className="settings__security-label">Account created</p>
                        <p className="settings__security-value">
                          {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* ─── Favorite Policies Section ─── */}
              <section id="policies">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Saved Insights</h2>
                    <p className="settings__card-desc">Your bookmarked policy analyses for quick access.</p>
                  </div>

                  {loadingFavorites ? (
                    <div className="settings__empty" style={{ padding: '2rem 0' }}>Loading your favorites...</div>
                  ) : favoritePolicies.length === 0 ? (
                    <div className="settings__empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                      <p className="settings__empty-title">No saved insights</p>
                      <p className="settings__empty-desc">Bookmark an analysis in the Workspace to access it here.</p>
                    </div>
                  ) : (
                    <div className="settings__policies-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                      {favoritePolicies.map((p) => (
                        <div 
                          key={p.id} 
                          className="settings__policy-item" 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => handleViewPolicy(p)}
                          title="Click to view full analysis"
                        >
                          <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.policyOverview?.name || 'Saved Policy'}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Coverage Score: {p.coverageScore}</p>
                          </div>
                          <Button variant="ghost" onClick={(e) => handleUnfavorite(e, p.id)} style={{ color: 'var(--accent-red)' }} aria-label="Remove from favorites">
                             Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </section>

              {/* ─── Notifications Section ─── */}
              <section id="notifications">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Notifications</h2>
                    <p className="settings__card-desc">Choose what you'd like to hear about.</p>
                  </div>

                  <div className="settings__toggles">
                    <ToggleRow
                      label="Renewal Reminders"
                      desc="Get notified 30 days before a policy expires."
                      checked={notifications.renewalReminders}
                      onChange={() => handleToggle('renewalReminders')}
                    />
                    <ToggleRow
                      label="Analysis Complete"
                      desc="Email notification when AI finishes analyzing a policy."
                      checked={notifications.analysisComplete}
                      onChange={() => handleToggle('analysisComplete')}
                    />
                    <ToggleRow
                      label="Weekly Digest"
                      desc="A weekly summary of your portfolio health."
                      checked={notifications.weeklyDigest}
                      onChange={() => handleToggle('weeklyDigest')}
                    />
                    <ToggleRow
                      label="Marketing & Updates"
                      desc="Product updates and feature announcements."
                      checked={notifications.marketingEmails}
                      onChange={() => handleToggle('marketingEmails')}
                    />
                  </div>
                </Card>
              </section>

              {/* ─── Export Section ─── */}
              <section id="export">
                <Card variant="lifted" className="settings__card">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title">Export & Data</h2>
                    <p className="settings__card-desc">Download your data in your preferred format.</p>
                  </div>

                  <div className="settings__export-options">
                    <label className={`settings__export-option ${exportFormat === 'pdf' ? 'settings__export-option--active' : ''}`}>
                      <input type="radio" name="format" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} />
                      <div className="settings__export-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div>
                        <p className="settings__export-label">PDF Report</p>
                        <p className="settings__export-desc">Formatted analysis report</p>
                      </div>
                    </label>
                    <label className={`settings__export-option ${exportFormat === 'csv' ? 'settings__export-option--active' : ''}`}>
                      <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} />
                      <div className="settings__export-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
                      </div>
                      <div>
                        <p className="settings__export-label">CSV Spreadsheet</p>
                        <p className="settings__export-desc">Raw data for spreadsheets</p>
                      </div>
                    </label>
                    <label className={`settings__export-option ${exportFormat === 'json' ? 'settings__export-option--active' : ''}`}>
                      <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={() => setExportFormat('json')} />
                      <div className="settings__export-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                      </div>
                      <div>
                        <p className="settings__export-label">JSON Data</p>
                        <p className="settings__export-desc">Machine-readable format</p>
                      </div>
                    </label>
                  </div>

                  <div className="settings__card-actions">
                    <Button 
                      variant="secondary" 
                      onClick={() => addToast(`Exporting data as ${exportFormat.toUpperCase()}...`, 'default')}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      }
                    >
                      Export All Analyses
                    </Button>
                  </div>
                </Card>
              </section>

              {/* ─── Danger Zone ─── */}
              <section id="danger">
                <Card variant="lifted" className="settings__card settings__card--danger">
                  <div className="settings__card-header">
                    <h2 className="settings__card-title settings__card-title--danger">Danger Zone</h2>
                    <p className="settings__card-desc">Irreversible actions. Proceed with caution.</p>
                  </div>

                  <div className="settings__danger-actions">
                    <div className="settings__danger-row">
                      <div>
                        <p className="settings__danger-label">Sign out of all devices</p>
                        <p className="settings__danger-desc">This will log you out everywhere.</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={logout}>Sign Out</Button>
                    </div>
                    <div className="settings__danger-row">
                      <div>
                        <p className="settings__danger-label">Delete account</p>
                        <p className="settings__danger-desc">Permanently delete your account and all data. This cannot be undone.</p>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="settings__delete-modal">
          <p className="settings__delete-warning">
            This will permanently delete your account, all analyzed policies, and saved data. This action cannot be undone.
          </p>
          <Input
            label='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <div className="settings__delete-actions">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Toggle Row Component ── */
function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="settings__toggle-row">
      <div className="settings__toggle-info">
        <p className="settings__toggle-label">{label}</p>
        <p className="settings__toggle-desc">{desc}</p>
      </div>
      <button
        type="button"
        className={`settings__toggle ${checked ? 'settings__toggle--on' : ''}`}
        onClick={onChange}
        aria-label={`Toggle ${label}`}
      >
        <span className="settings__toggle-knob" />
      </button>
    </div>
  );
}

export default SettingsPage;
