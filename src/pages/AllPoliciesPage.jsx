import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserPolicies, deletePolicyAnalysis, toggleFavoritePolicy } from '../services/dbService';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ConfirmModal from '../components/common/ConfirmModal';
import './AllPoliciesPage.css';

function AllPoliciesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('date-desc');
  const [filterType, setFilterType] = useState('All');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, policyId: null });

  const categories = ['All', 'Health', 'Life', 'Auto', 'Home'];
  const activeIndex = categories.indexOf(filterType);

  // ── Swipe Logic ──
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handlePointerDown = (e) => setDragStart(e.clientX);
  const handlePointerMove = (e) => {
    if (dragStart !== null) setDragOffset(e.clientX - dragStart);
  };
  const handlePointerUp = () => {
    if (Math.abs(dragOffset) > 40) {
      if (dragOffset > 0) {
        const nextIdx = (activeIndex - 1 + categories.length) % categories.length;
        setFilterType(categories[nextIdx]);
      } else {
        const nextIdx = (activeIndex + 1) % categories.length;
        setFilterType(categories[nextIdx]);
      }
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const handleCategoryClick = (cat) => {
    if (Math.abs(dragOffset) < 10) { // Small threshold to distinguish click from drag
      setFilterType(cat);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const data = await getUserPolicies(user.uid);
        setPolicies(data || []);
      } catch (err) {
        console.error("Failed to load policies", err);
        addToast('Failed to load your policies.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, addToast]);

  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    if (filterType === 'All') return policies;
    
    return policies.filter(p => {
      const type = p.policyOverview?.type?.toLowerCase() || '';
      return type.includes(filterType.toLowerCase());
    });
  }, [policies, filterType]);

  const sortedPolicies = useMemo(() => {
    return [...filteredPolicies].sort((a, b) => {
      switch (sortOption) {
        case 'score-desc':
          return (b.coverageScore || 0) - (a.coverageScore || 0);
        case 'score-asc':
          return (a.coverageScore || 0) - (b.coverageScore || 0);
        case 'date-desc':
          return new Date(b.createdAt || b.capturedDate).getTime() - new Date(a.createdAt || a.capturedDate).getTime();
        case 'date-asc':
          return new Date(a.createdAt || a.capturedDate).getTime() - new Date(b.createdAt || b.capturedDate).getTime();
        case 'risks-desc':
          return (b.riskFlags?.length || 0) - (a.riskFlags?.length || 0);
        case 'risks-asc':
          return (a.riskFlags?.length || 0) - (b.riskFlags?.length || 0);
        default:
          return 0;
      }
    });
  }, [filteredPolicies, sortOption]);

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
      addToast('Policy safely removed.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete policy.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, policyId: null });
    }
  };

  const handleToggleFavorite = async (e, policy) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = !policy.isFavorite;
    
    try {
      await toggleFavoritePolicy(user.uid, policy.id, newStatus);
      setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, isFavorite: newStatus } : p));
      addToast(newStatus ? 'Added to your favorites.' : 'Removed from your favorites.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update favorite status.', 'error');
    }
  };

  const handleViewPolicy = (policy) => {
    navigate('/workspace', { state: { policy } });
  };

  if (loading) {
    return (
      <div className="all-policies page-content flex-center">
        <Loader variant="orb" text="Loading portfolio..." />
      </div>
    );
  }

  return (
    <div className="all-policies">
      {/* ── HERO SECTION (White Strip) ── */}
      <div className="all-policies__hero">
        <div className="container">
          {/* ── 3D Carousel Filter ── */}
          <div className="all-policies__filters-top">
            <div 
              className="all-policies__carousel-container"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <div className="all-policies__carousel">
                {categories.map((cat, idx) => {
                  let distance = idx - activeIndex;
                  if (distance > categories.length / 2) distance -= categories.length;
                  if (distance < -categories.length / 2) distance += categories.length;

                  const absDistance = Math.abs(distance);
                  const offset = distance * 150 + dragOffset;
                  
                  const scale = 1 - absDistance * 0.25;
                  const opacity = 1 - absDistance * 0.6;
                  const zIndex = 10 - absDistance;

                  return (
                    <button
                      key={cat}
                      className={`all-policies__carousel-item ${idx === activeIndex ? 'all-policies__carousel-item--active' : ''}`}
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        transform: `translateX(${offset}px) scale(${scale})`,
                        opacity: opacity < 0 ? 0 : opacity,
                        zIndex,
                        pointerEvents: absDistance > 1.5 ? 'none' : 'auto'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <div className="all-policies__carousel-indicator">
                <div className="all-policies__carousel-dot" style={{ transform: `translateX(${activeIndex * 120}px)` }} />
              </div>
            </div>
          </div>

          <div className="all-policies__header">
            <div>
              <h1 className="all-policies__title">Your Policy Portfolio</h1>
              <p className="all-policies__subtitle">
                Manage all your analyzed documents and track identified risks over time.
              </p>
            </div>
            
            {policies.length > 0 && (
              <div className="all-policies__sort-pill">
                <span className="all-policies__sort-label">SORT BY:</span>
                <select 
                  className="all-policies__select-invisible"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="score-desc">Rating: High to Low</option>
                  <option value="score-asc">Rating: Low to High</option>
                  <option value="risks-desc">Most Risks</option>
                  <option value="risks-asc">Fewest Risks</option>
                </select>
                <span className="all-policies__sort-value">
                  {sortOption === 'date-desc' ? 'Newest First' : 
                   sortOption === 'date-asc' ? 'Oldest First' : 
                   sortOption === 'score-desc' ? 'Rating: High to Low' : 
                   sortOption === 'score-asc' ? 'Rating: Low to High' : 
                   sortOption === 'risks-desc' ? 'Most Risks' : 'Fewest Risks'}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: '4px' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--space-3xl)' }}>
        {policies.length === 0 ? (
        <div className="all-policies__empty">
          <div className="all-policies__empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </div>
          <p>You haven't analyzed any policies yet.</p>
          <Button variant="primary" onClick={() => navigate('/workspace')}>
            Analyze Your First Policy
          </Button>
        </div>
      ) : sortedPolicies.length === 0 ? (
        <div className="all-policies__empty">
          <div className="all-policies__empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <p>No {filterType} policies found in your portfolio.</p>
          <Button variant="secondary" onClick={() => setFilterType('All')}>
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="all-policies__grid">
          {sortedPolicies.map((policy) => (
            <Card 
              key={policy.id} 
              variant="lifted" 
              className="all-policies__card"
              onClick={() => handleViewPolicy(policy)}
            >
              <div className="all-policies__card-header">
                <div className="all-policies__score-wrap">
                  <div className="all-policies__score-ring">
                    <svg viewBox="0 0 48 48" className="all-policies__dial">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                      <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke={policy.coverageScore >= 80 ? '#2ecc71' : policy.coverageScore >= 60 ? '#f39c12' : '#e74c3c'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${((policy.coverageScore || 0) / 100) * 125.6} 125.6`}
                      />
                    </svg>
                    <span className="all-policies__score-val">{policy.coverageScore || 0}</span>
                  </div>
                  <div>
                    <span className="all-policies__type">{policy.policyOverview?.type || 'Standard'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    className="all-policies__delete"
                    onClick={(e) => handleToggleFavorite(e, policy)}
                    aria-label={policy.isFavorite ? "Remove from saved" : "Save this policy"}
                    style={{ color: policy.isFavorite ? 'var(--accent-green)' : 'var(--text-tertiary)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={policy.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </button>
                  <button 
                    className="all-policies__delete"
                    onClick={(e) => initiateDelete(e, policy.id)}
                    aria-label="Delete policy"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="all-policies__info">
                <h3>{policy.policyOverview?.name || 'Unknown Policy'}</h3>
                <p className="all-policies__provider">{policy.policyOverview?.provider || 'Unknown Provider'}</p>
              </div>

              <div className="all-policies__footer">
                <span className="all-policies__date">{policy.capturedDate || 'Recent'}</span>
                {(policy.riskFlags && policy.riskFlags.length > 0) && (
                  <span className="all-policies__risk-pill">{policy.riskFlags.length} Risks Detected</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Permanently Delete Policy"
        message="Are you sure you want to completely remove this policy? This action cannot be undone and will affect your overall portfolio stats."
        confirmText="Delete Policy"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, policyId: null })}
      />
    </div>
    </div>
  );
}

export default AllPoliciesPage;
