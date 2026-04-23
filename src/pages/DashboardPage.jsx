import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { getUserPolicies, deletePolicyAnalysis } from '../services/dbService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, policyId: null });

  const initiateDelete = (e, policyId) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ isOpen: true, policyId });
  };

  const executeDelete = async () => {
    const policyId = confirmModal.policyId;
    if (!policyId) return;
    
    try {
      await deletePolicyAnalysis(user.uid, policyId);
      setPolicies(prev => prev.filter(p => p.id !== policyId));
      addToast('Policy safely removed from your portfolio.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete policy.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, policyId: null });
    }
  };

  const handleViewPolicy = (policy) => {
    navigate('/workspace', { state: { policy } });
  };

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const data = await getUserPolicies(user.uid);
        setPolicies(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Derived Statistics
  const data = useMemo(() => {
    if (!policies || policies.length === 0) return null;

    let totalScore = 0;
    let totalRisks = 0;
    const allRisks = [];
    const typeCount = { Health: 0, Auto: 0, Home: 0, Life: 0, Other: 0 };
    const typeScore = { Health: 0, Auto: 0, Home: 0, Life: 0, Other: 0 };

    policies.forEach(p => {
      totalScore += (p.coverageScore || 0);
      
      const risks = p.riskFlags || [];
      totalRisks += risks.length;
      risks.forEach(r => allRisks.push({ ...r, policyName: p.policyOverview?.name }));

      let cType = p.policyOverview?.type || 'Other';
      if (cType.toLowerCase().includes('health') || cType.toLowerCase().includes('medical')) cType = 'Health';
      else if (cType.toLowerCase().includes('auto') || cType.toLowerCase().includes('motor') || cType.toLowerCase().includes('car')) cType = 'Auto';
      else if (cType.toLowerCase().includes('home') || cType.toLowerCase().includes('property')) cType = 'Home';
      else if (cType.toLowerCase().includes('life')) cType = 'Life';
      else cType = 'Other';

      if (!typeCount[cType]) {
        typeCount[cType] = 0;
        typeScore[cType] = 0;
      }
      typeCount[cType]++;
      typeScore[cType] += (p.coverageScore || 0);
    });

    const avgCoverage = Math.round(totalScore / policies.length);
    let grade = '—';
    if (avgCoverage >= 80) grade = 'A';
    else if (avgCoverage >= 60) grade = 'B';
    else if (avgCoverage >= 40) grade = 'C';
    else grade = 'F';

    // Sort risks (Critical -> Warning -> Info)
    const severityMap = { critical: 3, warning: 2, info: 1 };
    allRisks.sort((a, b) => severityMap[b.level] - severityMap[a.level]);

    // Categories Breakdown
    const categories = [
      { category: 'Health', color: '#2ecc71', icon: '🛡️' },
      { category: 'Auto', color: '#3498db', icon: '🚗' },
      { category: 'Home', color: '#f39c12', icon: '🏠' },
      { category: 'Life', color: '#a1a1a6', icon: '❤️' },
    ].map(cat => ({
      ...cat,
      policies: typeCount[cat.category] || 0,
      score: typeCount[cat.category] > 0 ? Math.round(typeScore[cat.category] / typeCount[cat.category]) : 0
    }));

    return {
      stats: {
        totalPolicies: policies.length,
        avgCoverage,
        openRisks: totalRisks,
        totalSaved: '₹0', // Requires deeper financial mock/model, keeping static
      },
      portfolioScore: avgCoverage,
      portfolioGrade: grade,
      categoryBreakdown: categories,
      recentAnalyses: policies.slice(0, 5),
      topRisks: allRisks.slice(0, 4),
    };
  }, [policies]);

  if (loading) {
    return (
      <div className="theme-main page-content page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader variant="orb" />
      </div>
    );
  }

  const isEmpty = !data;

  return (
    <div className="theme-main page-content page-enter">
      <div className="dashboard">
        <div className="container">
          {/* Header */}
          <div className="dashboard__header">
            <div>
              <p className="text-overline" style={{ marginBottom: '0.25rem' }}>DASHBOARD</p>
              <h1 className="dashboard__title">Welcome back, {firstName}</h1>
              <p className="dashboard__subtitle">
                {isEmpty ? 'Your insurance portfolio is waiting to be built.' : "Here's an overview of your insurance portfolio."}
              </p>
            </div>
            <Link to="/workspace">
              <Button variant="primary" icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              }>
                New Analysis
              </Button>
            </Link>
          </div>

          {/* ── Empty State ── */}
          {isEmpty ? (
            <div className="dashboard__empty">
              <Card variant="lifted" className="dashboard__empty-card">
                <div className="dashboard__empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </div>
                <h2 className="dashboard__empty-title">No policies analyzed yet</h2>
                <p className="dashboard__empty-desc">
                  Upload your first insurance policy to get a comprehensive AI-powered breakdown with coverage scores, risk flags, and decoded jargon.
                </p>
                <Link to="/workspace">
                  <Button variant="primary" size="lg" icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  }>
                    Analyze Your First Policy
                  </Button>
                </Link>

                {/* Empty state feature grid */}
                <div className="dashboard__empty-features">
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">Coverage Scoring</p>
                      <p className="dashboard__empty-feature-desc">Know exactly how protected you are</p>
                    </div>
                  </div>
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">Risk Detection</p>
                      <p className="dashboard__empty-feature-desc">Spot hidden dangers before they cost you</p>
                    </div>
                  </div>
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /></svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">Policy Comparison</p>
                      <p className="dashboard__empty-feature-desc">Side-by-side gap analysis</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <>
              {/* ── Stats Row ── */}
              <div className="dashboard__stats">
                <Card variant="lifted" className="dashboard__stat-card">
                  <div className="dashboard__stat-content">
                    <p className="dashboard__stat-label">Policies Analyzed</p>
                    <p className="dashboard__stat-value">{data.stats.totalPolicies}</p>
                  </div>
                  <div className="dashboard__stat-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <div className="dashboard__stat-content">
                    <p className="dashboard__stat-label">Avg. Coverage</p>
                    <p className="dashboard__stat-value">{data.stats.avgCoverage}%</p>
                  </div>
                  <div className="dashboard__stat-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <div className="dashboard__stat-content">
                    <p className="dashboard__stat-label">Open Risks</p>
                    <p className="dashboard__stat-value dashboard__stat-value--risk">{data.stats.openRisks}</p>
                  </div>
                  <div className="dashboard__stat-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </div>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <div className="dashboard__stat-content">
                    <p className="dashboard__stat-label">Est. Savings Found</p>
                    <p className="dashboard__stat-value dashboard__stat-value--green">{data.stats.totalSaved}</p>
                  </div>
                  <div className="dashboard__stat-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
                    </svg>
                  </div>
                </Card>
              </div>

              {/* ── Main Row: Portfolio Health + Top Risks ── */}
              <div className="dashboard__main-row">
                {/* Portfolio Health Card (larger) */}
                <Card variant="lifted" className="dashboard__portfolio-card">
                  <div className="dashboard__portfolio-top">
                    <div>
                      <p className="text-overline" style={{ marginBottom: 'var(--space-sm)' }}>PORTFOLIO HEALTH</p>
                      <p className="dashboard__portfolio-desc">
                        Your overall coverage score based on {data.stats.totalPolicies} analyzed policies.
                        {data.portfolioScore >= 80 ? ' Looking strong.' : data.portfolioScore >= 60 ? ' Room for improvement.' : ' Needs immediate attention.'}
                      </p>
                    </div>
                    <div className="dashboard__portfolio-dial">
                      <svg viewBox="0 0 100 100" className="dashboard__dial-svg">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="7" />
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke={data.portfolioScore >= 80 ? '#2ecc71' : data.portfolioScore >= 60 ? '#f39c12' : '#e74c3c'}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${(data.portfolioScore / 100) * 264} 264`}
                          transform="rotate(-90 50 50)"
                          className="dashboard__dial-ring"
                        />
                      </svg>
                      <div className="dashboard__dial-center">
                        <span className="dashboard__dial-number">{data.portfolioScore}</span>
                        <span className="dashboard__dial-grade">{data.portfolioGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="dashboard__categories">
                    {data.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="dashboard__category">
                        <div className="dashboard__category-header">
                          <span className="dashboard__category-icon">{cat.icon}</span>
                          <span className="dashboard__category-name">{cat.category}</span>
                          <span className="dashboard__category-score">
                            {cat.policies > 0 ? `${cat.score}%` : '—'}
                          </span>
                        </div>
                        <div className="dashboard__category-bar">
                          <div
                            className="dashboard__category-fill"
                            style={{
                              width: cat.policies > 0 ? `${cat.score}%` : '0%',
                              background: cat.color,
                            }}
                          />
                        </div>
                        <p className="dashboard__category-meta">
                          {cat.policies > 0 ? `${cat.policies} policy` : 'No policy analyzed'}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Risk Alerts (smaller, right) */}
                <Card variant="lifted" className="dashboard__risks-card">
                  <p className="text-overline" style={{ marginBottom: 'var(--space-md)' }}>TOP RISK ALERTS</p>
                  {data.topRisks.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No major risks detected across your portfolio!</p>
                  ) : (
                    <div className="dashboard__risk-list">
                      {data.topRisks.map((risk, i) => (
                        <div key={i} className={`dashboard__risk-item dashboard__risk-item--${risk.level}`}>
                          <span className="dashboard__risk-dot" />
                          <div className="dashboard__risk-info">
                            <p className="dashboard__risk-flag">{risk.flag}</p>
                            <p className="dashboard__risk-policy">{risk.policyName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* ── Recent Analyses — Full Width ── */}
              <Card variant="lifted" className="dashboard__recent-card">
                <div className="dashboard__recent-header">
                  <p className="text-overline">RECENT ANALYSES</p>
                  <Link to="/policies" className="dashboard__see-all">View all</Link>
                </div>
                <div className="dashboard__recent-list">
                  {data.recentAnalyses.map((analysis) => (
                    <div 
                      key={analysis.id} 
                      className="dashboard__recent-item dashboard__recent-item--clickable"
                      onClick={() => handleViewPolicy(analysis)}
                    >
                      <div className="dashboard__recent-score-ring">
                        <svg viewBox="0 0 36 36" className="dashboard__mini-dial">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15"
                            fill="none"
                            stroke={analysis.coverageScore >= 80 ? '#2ecc71' : analysis.coverageScore >= 60 ? '#f39c12' : '#e74c3c'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${((analysis.coverageScore || 0) / 100) * 94.2} 94.2`}
                            transform="rotate(-90 18 18)"
                          />
                        </svg>
                        <span className="dashboard__mini-score">{analysis.coverageScore || 0}</span>
                      </div>
                      <div className="dashboard__recent-info">
                        <p className="dashboard__recent-name">{analysis.policyOverview?.name || 'Unknown Policy'}</p>
                        <p className="dashboard__recent-meta">{analysis.policyOverview?.type || 'Standard'} · {analysis.capturedDate || 'Recent'}</p>
                      </div>
                      <div className="dashboard__recent-actions">
                        {(analysis.riskFlags?.length || 0) > 0 && (
                          <span className="dashboard__recent-risks">{analysis.riskFlags.length} risks</span>
                        )}
                        <button 
                          className="dashboard__recent-delete"
                          onClick={(e) => initiateDelete(e, analysis.id)}
                          aria-label="Delete analysis"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* ── Quick Actions — 3 Cards Row ── */}
              <div className="dashboard__actions-row">
                <Card variant="lifted" className="dashboard__action-card">
                  <Link to="/workspace" className="dashboard__action-link">
                    <span className="dashboard__action-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    </span>
                    <span className="dashboard__action-label">Upload New Policy</span>
                  </Link>
                </Card>
                <Card variant="lifted" className="dashboard__action-card">
                  <Link to="/compare" className="dashboard__action-link">
                    <span className="dashboard__action-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /></svg>
                    </span>
                    <span className="dashboard__action-label">Compare Policies</span>
                  </Link>
                </Card>
                <Card variant="lifted" className="dashboard__action-card">
                  <Link to="/policies" className="dashboard__action-link">
                    <span className="dashboard__action-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    </span>
                    <span className="dashboard__action-label">View All Policies</span>
                  </Link>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Remove Policy"
        message="Are you sure you want to remove this policy from your portfolio? This action is permanent and cannot be undone."
        confirmText="Remove Policy"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, policyId: null })}
      />
    </div>
  );
}

export default DashboardPage;
