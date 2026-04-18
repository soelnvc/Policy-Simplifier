import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './DashboardPage.css';

/**
 * Dashboard data — starts empty. Will be populated from Firestore in production.
 */
const EMPTY_DATA = {
  stats: {
    totalPolicies: 0,
    avgCoverage: 0,
    openRisks: 0,
    totalSaved: '₹0',
  },
  portfolioScore: 0,
  portfolioGrade: '—',
  categoryBreakdown: [
    { category: 'Health', score: 0, policies: 0, color: '#2ecc71', icon: '🛡️' },
    { category: 'Motor', score: 0, policies: 0, color: '#3498db', icon: '🚗' },
    { category: 'Home', score: 0, policies: 0, color: '#f39c12', icon: '🏠' },
    { category: 'Life', score: 0, policies: 0, color: '#a1a1a6', icon: '❤️' },
  ],
  recentAnalyses: [],
  topRisks: [],
  premiumTimeline: [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
  ],
};

function DashboardPage() {
  const { user } = useAuth();
  const [data] = useState(EMPTY_DATA);
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const isEmpty = data.stats.totalPolicies === 0;

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
                  <p className="dashboard__stat-label">Policies Analyzed</p>
                  <p className="dashboard__stat-value">{data.stats.totalPolicies}</p>
                  <p className="dashboard__stat-change dashboard__stat-change--up">+1 this month</p>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <p className="dashboard__stat-label">Avg. Coverage</p>
                  <p className="dashboard__stat-value">{data.stats.avgCoverage}%</p>
                  <p className="dashboard__stat-change">across all policies</p>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <p className="dashboard__stat-label">Open Risks</p>
                  <p className="dashboard__stat-value dashboard__stat-value--risk">{data.stats.openRisks}</p>
                  <p className="dashboard__stat-change dashboard__stat-change--down">needs attention</p>
                </Card>
                <Card variant="lifted" className="dashboard__stat-card">
                  <p className="dashboard__stat-label">Est. Savings Found</p>
                  <p className="dashboard__stat-value dashboard__stat-value--green">{data.stats.totalSaved}</p>
                  <p className="dashboard__stat-change dashboard__stat-change--up">from gap analysis</p>
                </Card>
              </div>

              {/* ── Main Grid ── */}
              <div className="dashboard__grid">
                {/* Left Column */}
                <div className="dashboard__col-main">
                  {/* Portfolio Score */}
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

                  {/* Premium Timeline */}
                  <Card variant="lifted" className="dashboard__timeline-card">
                    <p className="text-overline" style={{ marginBottom: 'var(--space-lg)' }}>PREMIUM TIMELINE</p>
                    <div className="dashboard__chart">
                      {data.premiumTimeline.map((point) => (
                        <div key={point.month} className="dashboard__chart-bar-wrap">
                          <div className="dashboard__chart-bar">
                            <div
                              className="dashboard__chart-fill"
                              style={{ height: `${(point.amount / (Math.max(...data.premiumTimeline.map(d => d.amount), 1))) * 100}%` }}
                            />
                          </div>
                          <span className="dashboard__chart-label">{point.month}</span>
                        </div>
                      ))}
                    </div>
                    <p className="dashboard__chart-note">
                      Total annual premiums: <strong>₹0</strong>
                    </p>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="dashboard__col-side">
                  {/* Recent Analyses */}
                  <Card variant="lifted" className="dashboard__recent-card">
                    <div className="dashboard__recent-header">
                      <p className="text-overline">RECENT ANALYSES</p>
                      <Link to="/workspace" className="dashboard__see-all">View all</Link>
                    </div>
                    <div className="dashboard__recent-list">
                      {data.recentAnalyses.map((analysis) => (
                        <div key={analysis.id} className="dashboard__recent-item">
                          <div className="dashboard__recent-score-ring">
                            <svg viewBox="0 0 36 36" className="dashboard__mini-dial">
                              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                              <circle
                                cx="18" cy="18" r="15"
                                fill="none"
                                stroke={analysis.score >= 80 ? '#2ecc71' : analysis.score >= 60 ? '#f39c12' : '#e74c3c'}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${(analysis.score / 100) * 94.2} 94.2`}
                                transform="rotate(-90 18 18)"
                              />
                            </svg>
                            <span className="dashboard__mini-score">{analysis.score}</span>
                          </div>
                          <div className="dashboard__recent-info">
                            <p className="dashboard__recent-name">{analysis.name}</p>
                            <p className="dashboard__recent-meta">{analysis.type} · {analysis.date}</p>
                          </div>
                          {analysis.risks > 0 && (
                            <span className="dashboard__recent-risks">{analysis.risks} risks</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Top Risk Alerts */}
                  <Card variant="lifted" className="dashboard__risks-card">
                    <p className="text-overline" style={{ marginBottom: 'var(--space-md)' }}>TOP RISK ALERTS</p>
                    <div className="dashboard__risk-list">
                      {data.topRisks.map((risk, i) => (
                        <div key={i} className={`dashboard__risk-item dashboard__risk-item--${risk.level}`}>
                          <span className="dashboard__risk-dot" />
                          <div className="dashboard__risk-info">
                            <p className="dashboard__risk-flag">{risk.flag}</p>
                            <p className="dashboard__risk-policy">{risk.policy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card variant="lifted" className="dashboard__actions-card">
                    <p className="text-overline" style={{ marginBottom: 'var(--space-md)' }}>QUICK ACTIONS</p>
                    <div className="dashboard__quick-actions">
                      <Link to="/workspace" className="dashboard__quick-action">
                        <span className="dashboard__qa-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </span>
                        <span className="dashboard__qa-label">Upload New Policy</span>
                      </Link>
                      <Link to="/compare" className="dashboard__quick-action">
                        <span className="dashboard__qa-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" /><line x1="6" y1="8" x2="6" y2="8.01" /><line x1="18" y1="8" x2="18" y2="8.01" /></svg>
                        </span>
                        <span className="dashboard__qa-label">Compare Policies</span>
                      </Link>
                      <Link to="/settings" className="dashboard__quick-action">
                        <span className="dashboard__qa-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        </span>
                        <span className="dashboard__qa-label">Export Reports</span>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
