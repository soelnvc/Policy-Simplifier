import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { analyzePolicy, formatFileSize } from '../services/aiService';
import { savePolicyAnalysis } from '../services/dbService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import './WorkspacePage.css';

/**
 * WorkspacePage — Core product: Upload → Analyze → Results.
 * Three states: upload | processing | results
 */
function WorkspacePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [state, setState] = useState('upload'); // 'upload' | 'processing' | 'results'
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('coverage');
  const fileInputRef = useRef(null);

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // ── File Handling ──
  const handleFile = useCallback((selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, image, or text file.');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File must be under 25 MB.');
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleBrowse = () => fileInputRef.current?.click();
  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const removeFile = () => { setFile(null); setError(''); };

  // ── Analysis ──
  const startAnalysis = async () => {
    if (!file) return;
    setState('processing');
    setProgress(0);
    setProgressLabel('Initializing...');

    try {
      const result = await analyzePolicy(file, (p, label) => {
        setProgress(p);
        setProgressLabel(label);
      });
      
      setProgress(99);
      setProgressLabel('Saving to secure vault...');
      if (user?.uid) {
        await savePolicyAnalysis(user.uid, result);
        addToast('Policy safely stored in your portfolio.', 'success');
      } else {
        addToast('Analysis completed. (Not saved, please log in)', 'info');
      }

      setAnalysis(result);
      setState('results');
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again or check your document.');
      addToast('Failed to analyze document via AI.', 'error');
      setState('upload');
    }
  };

  const startOver = () => {
    setState('upload');
    setFile(null);
    setProgress(0);
    setAnalysis(null);
    setError('');
    setActiveTab('coverage');
  };

  // ── Render ──
  return (
    <div className="theme-main page-content page-enter">
      <div className="workspace">
        <div className="container">
          {/* Header */}
          <div className="workspace__header">
            <div>
              <p className="text-overline" style={{ marginBottom: '0.25rem' }}>ANALYSIS WORKSPACE</p>
              <h1 className="workspace__title">
                {state === 'upload' && `Hey ${firstName}, let's decode a policy`}
                {state === 'processing' && 'Analyzing your policy...'}
                {state === 'results' && 'Analysis Complete'}
              </h1>
              {state === 'upload' && (
                <p className="workspace__subtitle">
                  Upload an insurance policy document and our AI will break it down into clear, structured insights.
                </p>
              )}
            </div>
            {state === 'results' && (
              <Button variant="secondary" onClick={startOver} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              }>
                New Analysis
              </Button>
            )}
          </div>

          {/* ── UPLOAD STATE ── */}
          {state === 'upload' && (
            <div className="workspace__upload-area">
              {/* Drop Zone */}
              <div
                className={`workspace__dropzone ${dragOver ? 'workspace__dropzone--active' : ''} ${file ? 'workspace__dropzone--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!file ? handleBrowse : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleInputChange}
                  hidden
                />

                {!file ? (
                  <div className="workspace__dropzone-empty">
                    <div className="workspace__dropzone-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <h3 className="workspace__dropzone-title">Drop your policy here</h3>
                    <p className="workspace__dropzone-sub">or click to browse files</p>
                    <div className="workspace__dropzone-formats">
                      <span>PDF</span><span>PNG</span><span>JPG</span><span>TXT</span>
                    </div>
                    <p className="workspace__dropzone-limit">Max 25 MB</p>
                  </div>
                ) : (
                  <div className="workspace__file-preview">
                    <div className="workspace__file-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div className="workspace__file-info">
                      <p className="workspace__file-name">{file.name}</p>
                      <p className="workspace__file-size">{formatFileSize(file.size)}</p>
                    </div>
                    <button className="workspace__file-remove" onClick={(e) => { e.stopPropagation(); removeFile(); }} aria-label="Remove file">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {error && <div className="workspace__error">{error}</div>}

              {file && (
                <div className="workspace__actions">
                  <Button variant="primary" size="lg" onClick={startAnalysis} icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  }>
                    Analyze Policy
                  </Button>
                </div>
              )}

              {/* Feature hints */}
              <div className="workspace__hints">
                <div className="workspace__hint">
                  <div className="workspace__hint-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <p className="workspace__hint-title">Coverage Analysis</p>
                    <p className="workspace__hint-desc">What's covered and what's not</p>
                  </div>
                </div>
                <div className="workspace__hint">
                  <div className="workspace__hint-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  </div>
                  <div>
                    <p className="workspace__hint-title">Risk Flags</p>
                    <p className="workspace__hint-desc">Hidden dangers in the fine print</p>
                  </div>
                </div>
                <div className="workspace__hint">
                  <div className="workspace__hint-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  </div>
                  <div>
                    <p className="workspace__hint-title">Terms Decoded</p>
                    <p className="workspace__hint-desc">Jargon translated to plain English</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROCESSING STATE ── */}
          {state === 'processing' && (
            <div className="workspace__processing">
              <Card variant="lifted" className="workspace__processing-card">
                <div className="workspace__processing-visual">
                  <Loader variant="orb" />
                </div>
                <div className="workspace__processing-info">
                  <div className="workspace__progress-bar">
                    <div className="workspace__progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="workspace__progress-label">{progressLabel}</p>
                  <p className="workspace__progress-pct">{progress}%</p>
                </div>
                <p className="workspace__processing-file">
                  Analyzing <strong>{file?.name}</strong>
                </p>
              </Card>
            </div>
          )}

          {/* ── RESULTS STATE ── */}
          {state === 'results' && analysis && (
            <div className="workspace__results">
              {/* Top Row: Overview + Score */}
              <div className="workspace__results-top">
                <Card variant="lifted" className="workspace__overview-card">
                  <p className="text-overline" style={{ marginBottom: 'var(--space-md)' }}>POLICY OVERVIEW</p>
                  <h2 className="workspace__policy-name">{analysis.policyOverview.name}</h2>
                  <p className="workspace__policy-type">{analysis.policyOverview.type}</p>
                  <div className="workspace__overview-grid">
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Provider</span>
                      <span className="workspace__overview-value">{analysis.policyOverview.provider}</span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Policy No.</span>
                      <span className="workspace__overview-value">{analysis.policyOverview.policyNumber}</span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Sum Insured</span>
                      <span className="workspace__overview-value workspace__overview-value--highlight">{analysis.policyOverview.sumInsured}</span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Premium</span>
                      <span className="workspace__overview-value">{analysis.policyOverview.premium}</span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Valid From</span>
                      <span className="workspace__overview-value">{analysis.policyOverview.effectiveDate}</span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Expires</span>
                      <span className="workspace__overview-value">{analysis.policyOverview.expiryDate}</span>
                    </div>
                  </div>
                </Card>

                <Card variant="lifted" className="workspace__score-card">
                  <p className="text-overline" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>COVERAGE SCORE</p>
                  <div className="workspace__score-dial">
                    <svg viewBox="0 0 100 100" className="workspace__score-svg">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={analysis.coverageScore >= 80 ? '#2ecc71' : analysis.coverageScore >= 60 ? '#f39c12' : '#e74c3c'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(analysis.coverageScore / 100) * 264} 264`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        className="workspace__score-ring"
                      />
                    </svg>
                    <div className="workspace__score-center">
                      <span className="workspace__score-number">{analysis.coverageScore}</span>
                      <span className="workspace__score-grade">{analysis.coverageGrade}</span>
                    </div>
                  </div>
                  <p className="workspace__score-summary">
                    {analysis.coverageScore >= 80 ? 'Strong coverage across most categories' :
                     analysis.coverageScore >= 60 ? 'Decent coverage with some notable gaps' :
                     'Significant coverage gaps detected'}
                  </p>
                </Card>
              </div>

              {/* Summary */}
              <Card variant="lifted" className="workspace__summary-card">
                <p className="text-overline" style={{ marginBottom: 'var(--space-sm)' }}>AI SUMMARY</p>
                <p className="workspace__summary-text">{analysis.summary}</p>
              </Card>

              {/* Tab Navigation */}
              <div className="workspace__tabs">
                {[
                  { key: 'coverage', label: 'Coverage', count: analysis.coverageItems.length },
                  { key: 'exclusions', label: 'Exclusions', count: analysis.exclusions.length },
                  { key: 'terms', label: 'Key Terms', count: analysis.keyTerms.length },
                  { key: 'risks', label: 'Risk Flags', count: analysis.riskFlags.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`workspace__tab ${activeTab === tab.key ? 'workspace__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    <span className="workspace__tab-count">{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="workspace__tab-content">
                {/* Coverage Tab */}
                {activeTab === 'coverage' && (
                  <div className="workspace__coverage-list">
                    {analysis.coverageItems.map((item, i) => (
                      <div key={i} className={`workspace__coverage-item workspace__coverage-item--${item.status}`}>
                        <div className="workspace__coverage-status">
                          {item.status === 'covered' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                          {item.status === 'partial' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          )}
                          {item.status === 'not_covered' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          )}
                        </div>
                        <div className="workspace__coverage-info">
                          <p className="workspace__coverage-category">{item.category}</p>
                          <p className="workspace__coverage-detail">{item.detail}</p>
                        </div>
                        <span className={`workspace__coverage-badge workspace__coverage-badge--${item.status}`}>
                          {item.status === 'covered' ? 'Covered' : item.status === 'partial' ? 'Partial' : 'Not Covered'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exclusions Tab */}
                {activeTab === 'exclusions' && (
                  <div className="workspace__exclusions-list">
                    {analysis.exclusions.map((exc, i) => (
                      <Card key={i} variant="lifted" className={`workspace__exclusion-card workspace__exclusion-card--${exc.severity}`}>
                        <div className="workspace__exclusion-header">
                          <span className={`workspace__severity workspace__severity--${exc.severity}`}>
                            {exc.severity}
                          </span>
                          <h4 className="workspace__exclusion-title">{exc.title}</h4>
                        </div>
                        <p className="workspace__exclusion-detail">{exc.detail}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Key Terms Tab */}
                {activeTab === 'terms' && (
                  <div className="workspace__terms-list">
                    {analysis.keyTerms.map((term, i) => (
                      <div key={i} className="workspace__term-item">
                        <h4 className="workspace__term-word">{term.term}</h4>
                        <p className="workspace__term-meaning">{term.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Flags Tab */}
                {activeTab === 'risks' && (
                  <div className="workspace__risks-list">
                    {analysis.riskFlags.map((risk, i) => (
                      <Card key={i} variant="lifted" className={`workspace__risk-card workspace__risk-card--${risk.level}`}>
                        <div className="workspace__risk-header">
                          <span className={`workspace__risk-level workspace__risk-level--${risk.level}`}>
                            {risk.level === 'critical' && '🔴'}
                            {risk.level === 'warning' && '🟡'}
                            {risk.level === 'info' && '🔵'}
                            {' '}{risk.level}
                          </span>
                        </div>
                        <h4 className="workspace__risk-flag">{risk.flag}</h4>
                        <p className="workspace__risk-detail">{risk.detail}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
