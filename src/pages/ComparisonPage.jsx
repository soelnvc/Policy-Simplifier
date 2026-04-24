import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { analyzePolicy, formatFileSize } from '../services/aiService';
import { saveComparison, getComparisonHistory } from '../services/dbService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import './ComparisonPage.css';

/**
 * ComparisonPage — Side-by-side policy diff & gap analysis.
 * Flow: Select 2 policies (upload) → Analyze both → Show comparison.
 */
function ComparisonPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Two policy slots
  const [policyA, setPolicyA] = React.useState({ file: null, analysis: null });
  const [policyB, setPolicyB] = React.useState({ file: null, analysis: null });
  const [comparing, setComparing] = React.useState(false);
  const [progress, setProgress] = React.useState({ a: 0, b: 0 });
  const [progressLabel, setProgressLabel] = React.useState({ a: '', b: '' });
  const [showResults, setShowResults] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('coverage');
  const [history, setHistory] = React.useState([]);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  
  const fileRefA = React.useRef(null);
  const fileRefB = React.useRef(null);

  // Fetch History
  React.useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) return;
      try {
        const data = await getComparisonHistory(user.uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [user]);

  const loadFromHistory = (item) => {
    setPolicyA({ file: { name: item.nameA, size: item.sizeA || 0 }, analysis: item.analysisA });
    setPolicyB({ file: { name: item.nameB, size: item.sizeB || 0 }, analysis: item.analysisB });
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // File handlers
  const handleFile = React.useCallback((slot, file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (!validTypes.includes(file.type) || file.size > 25 * 1024 * 1024) return;

    if (slot === 'a') setPolicyA({ file, analysis: null });
    else setPolicyB({ file, analysis: null });
  }, []);

  const removeFile = (slot) => {
    if (slot === 'a') setPolicyA({ file: null, analysis: null });
    else setPolicyB({ file: null, analysis: null });
    setShowResults(false);
  };

  // Run comparison
  const startComparison = async () => {
    if (!policyA.file || !policyB.file) return;
    setComparing(true);
    setShowResults(false);

    try {
      const [resultA, resultB] = await Promise.all([
        analyzePolicy(policyA.file, (p, l) => setProgress(prev => ({ ...prev, a: p })) || setProgressLabel(prev => ({ ...prev, a: l }))),
        analyzePolicy(policyB.file, (p, l) => setProgress(prev => ({ ...prev, b: p })) || setProgressLabel(prev => ({ ...prev, b: l }))),
      ]);

      setPolicyA(prev => ({ ...prev, analysis: resultA }));
      setPolicyB(prev => ({ ...prev, analysis: resultB }));
      
      // Save to History if logged in
      if (user?.uid) {
        const historyItem = {
          nameA: policyA.file.name,
          sizeA: policyA.file.size,
          analysisA: resultA,
          nameB: policyB.file.name,
          sizeB: policyB.file.size,
          analysisB: resultB,
        };
        const id = await saveComparison(user.uid, historyItem);
        setHistory(prev => [{ id, ...historyItem, displayDate: 'Just now' }, ...prev]);
      }

      addToast('Comparison completed successfully.', 'success');
      setComparing(false);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      addToast('Failed to analyze documents. Please try again.', 'error');
      setComparing(false);
    }
  };

  const startOver = () => {
    setPolicyA({ file: null, analysis: null });
    setPolicyB({ file: null, analysis: null });
    setShowResults(false);
    setActiveTab('coverage');
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const bothSelected = policyA.file && policyB.file;

  // ── Render ──
  return (
    <div className="theme-main page-content page-enter">
      <div className="compare">
        {/* Full-Width Header Banner */}
        <motion.div 
          className="compare__banner"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container">
            <div className="compare__header">
              <div>
                <p className="text-overline" style={{ marginBottom: '0.25rem' }}>POLICY COMPARISON</p>
                <h1 className="compare__title">
                  {showResults ? (
                    'Comparison Results'
                  ) : (
                    <>
                      <span className="text-gradient--alt">Compare</span> two policies
                    </>
                  )}
                </h1>
                <p className="compare__subtitle">
                  {showResults
                    ? 'Side-by-side analysis with gap detection.'
                    : 'Upload two insurance documents and we\'ll highlight the differences, gaps, and which one protects you better.'}
                </p>
              </div>
              {showResults && (
                <Button variant="secondary" onClick={startOver} icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                }>
                  New Comparison
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* ── Upload Slots ── */}
          {!showResults && (
            <>
              <motion.div className="compare__slots" variants={itemVariants}>
                {/* Slot A */}
                <UploadSlot
                  label="Policy A"
                  file={policyA.file}
                  onBrowse={() => fileRefA.current?.click()}
                  onRemove={() => removeFile('a')}
                  onDrop={(f) => handleFile('a', f)}
                  comparing={comparing}
                  progress={progress.a}
                  progressLabel={progressLabel.a}
                />
                <input ref={fileRefA} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => handleFile('a', e.target.files[0])} hidden />

                {/* VS Divider */}
                <div className="compare__vs">
                  <span className="compare__vs-text">VS</span>
                </div>

                {/* Slot B */}
                <UploadSlot
                  label="Policy B"
                  file={policyB.file}
                  onBrowse={() => fileRefB.current?.click()}
                  onRemove={() => removeFile('b')}
                  onDrop={(f) => handleFile('b', f)}
                  comparing={comparing}
                  progress={progress.b}
                  progressLabel={progressLabel.b}
                />
                <input ref={fileRefB} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => handleFile('b', e.target.files[0])} hidden />
              </motion.div>

              {bothSelected && !comparing && (
                <motion.div className="compare__actions" variants={itemVariants}>
                  <Button variant="primary" size="lg" onClick={startComparison} icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="4" width="8" height="16" rx="1" /><rect x="14" y="4" width="8" height="16" rx="1" />
                    </svg>
                  }>
                    Compare Policies
                  </Button>
                </motion.div>
              )}

              {/* ── Comparison History ── */}
              {!comparing && history.length > 0 && (
                <motion.div className="compare__history" variants={itemVariants}>
                  <div className="compare__history-header">
                    <p className="text-overline">RECENT COMPARISONS</p>
                    <span className="compare__history-disclaimer">Cleared after 30 days</span>
                  </div>
                  <div className="compare__history-grid">
                    {history.map((item) => (
                      <Card 
                        key={item.id} 
                        variant="lifted" 
                        className="compare__history-card"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="compare__history-info">
                          <div className="compare__history-names">
                            <span className="compare__history-name">{item.nameA}</span>
                            <span className="compare__history-vs">vs</span>
                            <span className="compare__history-name">{item.nameB}</span>
                          </div>
                          <p className="compare__history-date">{item.displayDate}</p>
                        </div>
                        <div className="compare__history-scores">
                          <div className={`compare__history-score ${item.analysisA.coverageScore >= 80 ? 'high' : item.analysisA.coverageScore >= 60 ? 'mid' : 'low'}`}>
                            {item.analysisA.coverageScore}
                          </div>
                          <div className={`compare__history-score ${item.analysisB.coverageScore >= 80 ? 'high' : item.analysisB.coverageScore >= 60 ? 'mid' : 'low'}`}>
                            {item.analysisB.coverageScore}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {loadingHistory && !history.length && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl) 0' }}>
                  <Loader variant="orb" />
                </div>
              )}
            </>
          )}

          {/* ── Results ── */}
          {showResults && policyA.analysis && policyB.analysis && (
            <motion.div className="compare__results" variants={itemVariants}>
              {/* Score Comparison */}
              <div className="compare__scores">
                <ScoreCard
                  label="Policy A"
                  name={policyA.analysis.policyOverview.name}
                  score={policyA.analysis.coverageScore}
                  grade={policyA.analysis.coverageGrade}
                  type={policyA.analysis.policyOverview.type}
                />
                <div className="compare__score-vs">
                  <span className="compare__score-diff">
                    {Math.abs(policyA.analysis.coverageScore - policyB.analysis.coverageScore)} pts
                  </span>
                  <span className="compare__score-diff-label">difference</span>
                </div>
                <ScoreCard
                  label="Policy B"
                  name={policyB.analysis.policyOverview.name}
                  score={policyB.analysis.coverageScore}
                  grade={policyB.analysis.coverageGrade}
                  type={policyB.analysis.policyOverview.type}
                />
              </div>

              {/* Overview Comparison */}
              <Card variant="lifted" className="compare__overview">
                <p className="text-overline" style={{ marginBottom: 'var(--space-lg)' }}>KEY METRICS</p>
                <div className="compare__metrics">
                  {[
                    { label: 'Sum Insured', a: policyA.analysis.policyOverview.sumInsured, b: policyB.analysis.policyOverview.sumInsured },
                    { label: 'Premium', a: policyA.analysis.policyOverview.premium, b: policyB.analysis.policyOverview.premium },
                    { label: 'Provider', a: policyA.analysis.policyOverview.provider, b: policyB.analysis.policyOverview.provider },
                    { label: 'Validity', a: `${policyA.analysis.policyOverview.effectiveDate} — ${policyA.analysis.policyOverview.expiryDate}`, b: `${policyB.analysis.policyOverview.effectiveDate} — ${policyB.analysis.policyOverview.expiryDate}` },
                  ].map((metric) => (
                    <div key={metric.label} className="compare__metric-row">
                      <span className="compare__metric-val compare__metric-val--a">{metric.a}</span>
                      <span className="compare__metric-label">{metric.label}</span>
                      <span className="compare__metric-val compare__metric-val--b">{metric.b}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tabs */}
              <div className="compare__tabs">
                {[
                  { key: 'coverage', label: 'Coverage Diff' },
                  { key: 'exclusions', label: 'Exclusions' },
                  { key: 'risks', label: 'Risk Flags' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`compare__tab ${activeTab === tab.key ? 'compare__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Coverage Diff */}
              {activeTab === 'coverage' && (
                <div className="compare__coverage-diff">
                  <div className="compare__diff-header">
                    <span className="compare__diff-col-label">Policy A</span>
                    <span className="compare__diff-col-label compare__diff-col-label--center">Category</span>
                    <span className="compare__diff-col-label">Policy B</span>
                  </div>
                  {(() => {
                    const allCategories = [...new Set([
                      ...policyA.analysis.coverageItems.map(c => c.category),
                      ...policyB.analysis.coverageItems.map(c => c.category),
                    ])];
                    return allCategories.map((cat) => {
                      const a = policyA.analysis.coverageItems.find(c => c.category === cat);
                      const b = policyB.analysis.coverageItems.find(c => c.category === cat);
                      const statusA = a?.status || 'not_covered';
                      const statusB = b?.status || 'not_covered';
                      const isDiff = statusA !== statusB;
                      return (
                        <div key={cat} className={`compare__diff-row ${isDiff ? 'compare__diff-row--highlight' : ''}`}>
                          <span className={`compare__diff-badge compare__diff-badge--${statusA}`}>
                            {statusA === 'covered' ? '✓' : statusA === 'partial' ? '~' : '✗'}
                          </span>
                          <span className="compare__diff-category">{cat}</span>
                          <span className={`compare__diff-badge compare__diff-badge--${statusB}`}>
                            {statusB === 'covered' ? '✓' : statusB === 'partial' ? '~' : '✗'}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Exclusions Side-by-Side */}
              {activeTab === 'exclusions' && (
                <div className="compare__exclusions-grid">
                  <div className="compare__exclusions-col">
                    <p className="compare__col-title">Policy A — {policyA.analysis.exclusions.length} exclusions</p>
                    {policyA.analysis.exclusions.map((exc, i) => (
                      <div key={i} className={`compare__exclusion compare__exclusion--${exc.severity}`}>
                        <span className={`compare__severity compare__severity--${exc.severity}`}>{exc.severity}</span>
                        <p className="compare__exclusion-title">{exc.title}</p>
                        <p className="compare__exclusion-detail">{exc.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="compare__exclusions-col">
                    <p className="compare__col-title">Policy B — {policyB.analysis.exclusions.length} exclusions</p>
                    {policyB.analysis.exclusions.map((exc, i) => (
                      <div key={i} className={`compare__exclusion compare__exclusion--${exc.severity}`}>
                        <span className={`compare__severity compare__severity--${exc.severity}`}>{exc.severity}</span>
                        <p className="compare__exclusion-title">{exc.title}</p>
                        <p className="compare__exclusion-detail">{exc.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Flags Side-by-Side */}
              {activeTab === 'risks' && (
                <div className="compare__risks-grid">
                  <div className="compare__risks-col">
                    <p className="compare__col-title">Policy A — {policyA.analysis.riskFlags.length} risks</p>
                    {policyA.analysis.riskFlags.map((risk, i) => (
                      <Card key={i} variant="lifted" className={`compare__risk-card compare__risk-card--${risk.level}`}>
                        <span className={`compare__risk-level compare__risk-level--${risk.level}`}>
                          {risk.level === 'critical' ? '🔴' : risk.level === 'warning' ? '🟡' : '🔵'} {risk.level}
                        </span>
                        <p className="compare__risk-flag">{risk.flag}</p>
                        <p className="compare__risk-detail">{risk.detail}</p>
                      </Card>
                    ))}
                  </div>
                  <div className="compare__risks-col">
                    <p className="compare__col-title">Policy B — {policyB.analysis.riskFlags.length} risks</p>
                    {policyB.analysis.riskFlags.map((risk, i) => (
                      <Card key={i} variant="lifted" className={`compare__risk-card compare__risk-card--${risk.level}`}>
                        <span className={`compare__risk-level compare__risk-level--${risk.level}`}>
                          {risk.level === 'critical' ? '🔴' : risk.level === 'warning' ? '🟡' : '🔵'} {risk.level}
                        </span>
                        <p className="compare__risk-flag">{risk.flag}</p>
                        <p className="compare__risk-detail">{risk.detail}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Verdict */}
              <Card variant="lifted" className="compare__verdict">
                <p className="text-overline" style={{ marginBottom: 'var(--space-sm)' }}>AI VERDICT</p>
                <p className="compare__verdict-text">
                  {policyA.analysis.coverageScore > policyB.analysis.coverageScore
                    ? `Policy A (${policyA.analysis.policyOverview.name}) scores ${policyA.analysis.coverageScore - policyB.analysis.coverageScore} points higher in overall coverage. However, both policies have unique strengths — review the coverage diff above to understand the specific gaps.`
                    : policyA.analysis.coverageScore < policyB.analysis.coverageScore
                    ? `Policy B (${policyB.analysis.policyOverview.name}) scores ${policyB.analysis.coverageScore - policyA.analysis.coverageScore} points higher in overall coverage. However, both policies have unique strengths — review the coverage diff above to understand the specific gaps.`
                    : `Both policies score equally at ${policyA.analysis.coverageScore}/100. Review the individual coverage items and risk flags to determine which better suits your needs.`
                  }
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Upload Slot Component ── */
function UploadSlot({ label, file, onBrowse, onRemove, onDrop, comparing, progress, progressLabel }) {
  const [dragOver, setDragOver] = React.useState(false);

  return (
    <motion.div
      className={`compare__slot ${dragOver ? 'compare__slot--drag' : ''} ${file ? 'compare__slot--has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e.dataTransfer.files[0]); }}
      onClick={!file ? onBrowse : undefined}
      animate={{ 
        y: dragOver ? -16 : 0,
        scale: dragOver ? 1.02 : 1,
        boxShadow: dragOver 
          ? "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4) inset" 
          : "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0px rgba(79, 140, 255, 0), 0 0 0 1px rgba(255, 255, 255, 0.4) inset"
      }}
      whileHover={{ 
        y: -16, 
        scale: 1.02,
        boxShadow: "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset"
      }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      <p className="compare__slot-label">{label}</p>
      {!file ? (
        <div className="compare__slot-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="compare__slot-hint">Drop PDF or click to browse</p>
        </div>
      ) : (
        <div className="compare__slot-file">
          <div className="compare__slot-file-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            <div>
              <p className="compare__slot-filename">{file.name}</p>
              <p className="compare__slot-filesize">{formatFileSize(file.size)}</p>
            </div>
          </div>
          {!comparing && (
            <button className="compare__slot-remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          {comparing && (
            <div className="compare__slot-progress">
              <div className="compare__slot-progress-bar">
                <div className="compare__slot-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="compare__slot-progress-label">{progressLabel}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ── Score Card Component ── */
function ScoreCard({ label, name, score, grade, type }) {
  return (
    <Card variant="lifted" className="compare__score-card">
      <p className="compare__score-label">{label}</p>
      <div className="compare__score-dial">
        <svg viewBox="0 0 80 80" className="compare__score-svg">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={score >= 80 ? '#2ecc71' : score >= 60 ? '#f39c12' : '#e74c3c'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            transform="rotate(-90 40 40)"
            className="compare__score-ring"
          />
        </svg>
        <div className="compare__score-center">
          <span className="compare__score-number">{score}</span>
          <span className="compare__score-grade">{grade}</span>
        </div>
      </div>
      <p className="compare__score-name">{name}</p>
      <p className="compare__score-type">{type}</p>
    </Card>
  );
}

export default ComparisonPage;
