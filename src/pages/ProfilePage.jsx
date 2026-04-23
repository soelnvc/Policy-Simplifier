import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserPolicies } from '../services/dbService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const data = await getUserPolicies(user.uid);
        setPolicies(data);
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const stats = useMemo(() => {
    if (!policies || policies.length === 0) return { count: 0, score: '—', risks: 0 };
    
    const totalScore = policies.reduce((acc, p) => acc + (p.coverageScore || 0), 0);
    const totalRisks = policies.reduce((acc, p) => acc + (p.riskFlags?.length || 0), 0);
    const avgScore = Math.round(totalScore / policies.length);
    
    return {
      count: policies.length,
      score: `${avgScore}%`,
      risks: totalRisks
    };
  }, [policies]);

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const lastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  const provider = user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email';

  if (loading) {
    return (
      <div className="theme-main page-content page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader variant="orb" />
      </div>
    );
  }

  return (
    <div className="theme-main page-content page-enter">
      <div className="profile">
        <div className="container">
          {/* ── Hero Banner ── */}
          <div className="profile__hero">
            <div className="profile__hero-bg" />
            <div className="profile__hero-content">
              <div className="profile__avatar-wrapper">
                <div className="profile__avatar">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="profile__avatar-img" />
                  ) : (
                    <span className="profile__avatar-letter">{userInitial}</span>
                  )}
                </div>
                <div className="profile__avatar-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              </div>
              <div className="profile__hero-info">
                <h1 className="profile__name">{user?.displayName || 'User'}</h1>
                <p className="profile__email">{user?.email}</p>
                <div className="profile__badges">
                  <span className="profile__badge">{provider} Account</span>
                  <span className="profile__badge">Member since {joinDate}</span>
                </div>
              </div>
              <Link to="/settings" className="profile__edit-link">
                <Button variant="secondary" size="sm" icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                }>
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="profile__stats">
            <Card variant="lifted" className="profile__stat-card">
              <p className="profile__stat-number">{stats.count}</p>
              <p className="profile__stat-label">Policies Analyzed</p>
            </Card>
            <Card variant="lifted" className="profile__stat-card">
              <p className="profile__stat-number">{stats.score}</p>
              <p className="profile__stat-label">Coverage Score</p>
            </Card>
            <Card variant="lifted" className="profile__stat-card">
              <p className="profile__stat-number">0</p>
              <p className="profile__stat-label">Comparisons Made</p>
            </Card>
            <Card variant="lifted" className="profile__stat-card">
              <p className="profile__stat-number">{stats.risks}</p>
              <p className="profile__stat-label">Risks Flagged</p>
            </Card>
          </div>

          {/* ── Tabs ── */}
          <div className="profile__tabs">
            <button
              className={`profile__tab ${activeTab === 'overview' ? 'profile__tab--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`profile__tab ${activeTab === 'activity' ? 'profile__tab--active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="profile__tab-content">
              <div className="profile__overview-grid">
                {/* Account Details */}
                <Card variant="lifted" className="profile__detail-card">
                  <p className="text-overline" style={{ marginBottom: 'var(--space-lg)' }}>ACCOUNT DETAILS</p>
                  <div className="profile__detail-list">
                    <div className="profile__detail-item">
                      <span className="profile__detail-label">Full Name</span>
                      <span className="profile__detail-value">{user?.displayName || '—'}</span>
                    </div>
                    <div className="profile__detail-item">
                      <span className="profile__detail-label">Email Address</span>
                      <span className="profile__detail-value">{user?.email || '—'}</span>
                    </div>
                    <div className="profile__detail-item">
                      <span className="profile__detail-label">Login Method</span>
                      <span className="profile__detail-value">{provider}</span>
                    </div>
                    <div className="profile__detail-item">
                      <span className="profile__detail-label">User ID</span>
                      <span className="profile__detail-value profile__detail-value--mono">{user?.uid?.substring(0, 16)}…</span>
                    </div>
                    <div className="profile__detail-item">
                      <span className="profile__detail-label">Last Sign In</span>
                      <span className="profile__detail-value">{lastSignIn}</span>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card variant="lifted" className="profile__actions-card">
                  <p className="text-overline" style={{ marginBottom: 'var(--space-lg)' }}>QUICK ACTIONS</p>
                  <div className="profile__action-list">
                    <Link to="/workspace" className="profile__action-item">
                      <span className="profile__action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      </span>
                      <div>
                        <p className="profile__action-label">Analyze a Policy</p>
                        <p className="profile__action-desc">Upload and decode a new document</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile__action-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                    <Link to="/dashboard" className="profile__action-item">
                      <span className="profile__action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                      </span>
                      <div>
                        <p className="profile__action-label">View Dashboard</p>
                        <p className="profile__action-desc">Portfolio overview and insights</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile__action-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                    <Link to="/compare" className="profile__action-item">
                      <span className="profile__action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /></svg>
                      </span>
                      <div>
                        <p className="profile__action-label">Compare Policies</p>
                        <p className="profile__action-desc">Side-by-side gap analysis</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile__action-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                    <Link to="/settings" className="profile__action-item">
                      <span className="profile__action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      </span>
                      <div>
                        <p className="profile__action-label">Settings</p>
                        <p className="profile__action-desc">Preferences and account</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile__action-arrow"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── Activity Tab ── */}
          {activeTab === 'activity' && (
            <div className="profile__tab-content">
              <Card variant="lifted" className="profile__activity-card">
                {policies.length === 0 ? (
                  <div className="profile__activity-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <p className="profile__activity-empty-title">No activity yet</p>
                    <p className="profile__activity-empty-desc">
                      Your analysis history, comparisons, and exports will appear here as you use the platform.
                    </p>
                    <Link to="/workspace">
                      <Button variant="primary" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      }>
                        Start Your First Analysis
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="profile__activity-feed">
                    <p className="text-overline" style={{ marginBottom: 'var(--space-lg)' }}>RECENT ANALYSES</p>
                    <div className="profile__activity-list">
                      {policies.slice(0, 5).map((policy) => (
                        <div 
                          key={policy.id} 
                          className="profile__activity-item"
                          onClick={() => navigate('/workspace', { state: { policy } })}
                        >
                          <div className="profile__activity-icon">
                            {policy.policyOverview?.type?.toLowerCase().includes('health') ? '🛡️' : 
                             policy.policyOverview?.type?.toLowerCase().includes('auto') ? '🚗' : 
                             policy.policyOverview?.type?.toLowerCase().includes('home') ? '🏠' : '📄'}
                          </div>
                          <div className="profile__activity-info">
                            <p className="profile__activity-name">{policy.policyOverview?.name || 'Untitled Policy'}</p>
                            <p className="profile__activity-meta">
                              {policy.policyOverview?.type || 'Standard'} · {policy.capturedDate || 'Recently'}
                            </p>
                          </div>
                          <div className="profile__activity-score">
                            <span className="profile__activity-score-label">Score</span>
                            <span className={`profile__activity-score-val ${policy.coverageScore >= 80 ? 'text-success' : policy.coverageScore >= 60 ? 'text-warning' : 'text-danger'}`}>
                              {policy.coverageScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="profile__activity-footer">
                      <Link to="/policies">
                        <Button variant="secondary" size="sm">
                          View All Policies
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
