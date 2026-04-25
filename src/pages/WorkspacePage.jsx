import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { analyzePolicy, formatFileSize } from "../services/aiService";
import {
  savePolicyAnalysis,
  toggleFavoritePolicy,
} from "../services/dbService";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Loader from "../components/common/Loader";
import "./WorkspacePage.css";

/**
 * WorkspacePage — Core product: Upload → Analyze → Results.
 * Three states: upload | processing | results
 */
function WorkspacePage() {
  const { user } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const [state, setState] = useState("upload"); // 'upload' | 'processing' | 'results'
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("coverage");
  const fileInputRef = useRef(null);

  const firstName = user?.displayName?.split(" ")[0] || "there";

  // ── Auto-load saved policy from navigation state ──
  useEffect(() => {
    if (location.state?.policy) {
      setAnalysis(location.state.policy);
      setState("results");
      if (location.state.initialTab) {
        setActiveTab(location.state.initialTab);
      }
    }
  }, [location.state]);

  // ── File Handling ──
  const handleFile = useCallback((selectedFile) => {
    setError("");
    if (!selectedFile) return;

    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "text/plain",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, image, or text file.");
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError("File must be under 25 MB.");
      return;
    }
    setFile(selectedFile);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleBrowse = () => fileInputRef.current?.click();
  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  // ── Analysis ──
  const startAnalysis = async () => {
    if (!file) return;
    setState("processing");
    setProgress(0);
    setProgressLabel("Initializing...");

    try {
      const result = await analyzePolicy(file, (p, label) => {
        setProgress(p);
        setProgressLabel(label);
      });

      setProgress(99);
      let firestoreId = null;
      if (user?.uid) {
        firestoreId = await savePolicyAnalysis(user.uid, result);
        addToast("Policy safely stored in your portfolio.", "success");
      } else {
        addToast("Analysis completed. (Not saved, please log in)", "info");
      }

      setAnalysis({ ...result, id: firestoreId, isFavorite: false });
      setState("results");
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again or check your document.");
      addToast("Failed to analyze document via AI.", "error");
      setState("upload");
    }
  };

  const startOver = () => {
    setState("upload");
    setFile(null);
    setProgress(0);
    setAnalysis(null);
    setError("");
    setActiveTab("coverage");
  };

  const handleTrySample = async () => {
    try {
      // Create a mock file from the hardcoded demo data
      const sampleText = `INSURANCE POLICY: PREMIUM AUTO PROTECTION\nPolicy Number: PAP-99283-X\nPolicyholder: Sample User\nTerm: 12 Months\n\nSECTION 1: COVERAGES\n- Bodily Injury Liability: $100,000 per person / $300,000 per accident\n- Property Damage Liability: $50,000\n- Medical Payments: $5,000\n- Collision: $500 Deductible\n- Comprehensive: $250 Deductible\n\nSECTION 2: EXCLUSIONS\n- Intentional damage is NOT covered.\n- Racing or professional competition is NOT covered.\n- Using the vehicle for commercial delivery (e.g., Uber/Lyft) without an endorsement is NOT covered.\n- Wear and tear, mechanical breakdown, and tire damage are NOT covered.\n\nSECTION 3: CONDITIONS\n- Subrogation: If we pay for a loss, we may take over your right to recover from others.\n- Pro Rata: If you cancel mid-term, we will refund the unused premium proportionally.\n\nSECTION 4: DEFINITIONS\n- "You" and "Your" refers to the named insured.\n- "We", "Us" and "Our" refers to the insurance company.`;

      const blob = new Blob([sampleText], { type: "text/plain" });
      const sampleFile = new File([blob], "demo_policy.txt", {
        type: "text/plain",
      });

      setFile(sampleFile);
      addToast("Loaded sample policy successfully!", "success");
    } catch (err) {
      console.error("Failed to load sample policy", err);
      setError("Could not load sample policy.");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !analysis?.id) {
      addToast("Cannot favorite without an account or saved policy.", "error");
      return;
    }

    const newStatus = !analysis.isFavorite;
    try {
      await toggleFavoritePolicy(user.uid, analysis.id, newStatus);
      setAnalysis((prev) => ({ ...prev, isFavorite: newStatus }));
      addToast(
        newStatus ? "Added to your favorites." : "Removed from your favorites.",
        "success",
      );
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      addToast("Failed to update favorite status.", "error");
    }
  };

  // ── Render ──
  return (
    <div className="theme-main page-content page-enter">
      <div className="workspace">
        {/* Header - Full Width Banner */}
        <motion.div
          className="workspace__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container">
            <div className="workspace__header-content">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p
                  className="text-overline"
                  style={{ marginBottom: "0.25rem" }}
                >
                  ANALYSIS WORKSPACE
                </p>
                <h1 className="workspace__title">
                  {state === "upload" && (
                    <>
                      Hey {firstName}, let's{" "}
                      <span className="text-gradient">decode a policy</span>
                    </>
                  )}
                  {state === "processing" && "Analyzing your policy..."}
                  {state === "results" && (
                    <>
                      Analysis <span className="text-gradient--lime">Complete</span>
                    </>
                  )}
                </h1>
                {state === "upload" && (
                  <p className="workspace__subtitle">
                    Upload an insurance policy document and our AI will break it
                    down into clear, structured insights.
                  </p>
                )}
              </motion.div>
              {state === "results" && (
                <div
                  className="workspace__actions-group"
                  style={{ display: "flex", gap: "12px" }}
                >
                  {analysis?.id && (
                    <motion.button
                      className={`workspace__save-btn ${analysis.isFavorite ? "workspace__save-btn--active" : ""}`}
                      onClick={handleToggleFavorite}
                      whileHover={{ y: -2 }}
                      aria-label={
                        analysis.isFavorite
                          ? "Remove from saved"
                          : "Save this policy"
                      }
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          scale: analysis.isFavorite ? [1, 1.3, 1] : 1,
                          rotate: analysis.isFavorite ? [0, 15, -15, 0] : 0,
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={analysis.isFavorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </motion.div>
                      <div style={{ position: "relative", height: "1.2em", minWidth: "100px", display: "flex", alignItems: "center" }}>
                        <AnimatePresence mode="wait">
                          {analysis.isFavorite ? (
                            <motion.span
                              key="saved"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="workspace__save-btn-label"
                            >
                              Saved
                            </motion.span>
                          ) : (
                            <motion.span
                              key="save"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className="workspace__save-btn-label"
                            >
                              Save Analysis
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  )}
                  <Button
                    variant="primary"
                    className="workspace__new-btn"
                    onClick={startOver}
                    icon={
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    }
                  >
                    New Analysis
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="container">
          {/* ── UPLOAD STATE ── */}
          {state === "upload" && (
            <motion.div
              className="workspace__upload-area"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Pulse Wrapper for independent animation */}
              <div className="workspace__dropzone-wrapper">
                {/* Drop Zone */}
                <motion.div
                  className={`workspace__dropzone ${dragOver ? "workspace__dropzone--active" : ""} ${file ? "workspace__dropzone--has-file" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!file ? handleBrowse : undefined}
                  animate={{
                    y: dragOver ? -16 : 0,
                    scale: dragOver ? 1.02 : 1,
                    boxShadow: dragOver
                      ? "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4) inset"
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0px rgba(79, 140, 255, 0), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
                  }}
                  whileHover={{
                    y: -16,
                    scale: 1.02,
                    boxShadow:
                      "0 50px 80px -20px rgba(0, 0, 0, 0.15), 0 0 50px rgba(79, 140, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
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
                      {/* Animated Border SVG */}
                      <svg
                        className="workspace__dropzone-border-svg"
                        width="100%"
                        height="100%"
                      >
                        <defs>
                          <linearGradient
                            id="borderGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#4F8CFF" />
                            <stop offset="50%" stopColor="#7AA2FF" />
                            <stop offset="100%" stopColor="#4F8CFF" />
                          </linearGradient>
                        </defs>
                        <rect
                          className="workspace__dropzone-border-rect"
                          x="1"
                          y="1"
                          width="calc(100% - 2px)"
                          height="calc(100% - 2px)"
                          rx="24"
                          ry="24"
                        />
                      </svg>

                      <div className="workspace__dropzone-icon">
                        <svg
                          className="workspace__upload-icon-svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path
                            className="workspace__upload-arrow"
                            d="M12 3v12m0-12l-4 4m4-4l4 4"
                          />
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        </svg>
                      </div>
                      <h3 className="workspace__dropzone-title">
                        {dragOver
                          ? "Release to upload"
                          : "Drop your policy. Let AI do the headache."}
                      </h3>
                      <p className="workspace__dropzone-sub">
                        or click to browse files
                      </p>
                      <div className="workspace__dropzone-formats">
                        <span>PDF</span>
                        <span>PNG</span>
                        <span>JPG</span>
                        <span>TXT</span>
                      </div>

                      <button
                        className="workspace__dropzone-sample-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrySample();
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginRight: "6px" }}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Try with a sample policy
                      </button>

                      <p className="workspace__dropzone-limit">Max 25 MB</p>
                      <p className="workspace__dropzone-security">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            marginRight: "4px",
                            verticalAlign: "middle",
                          }}
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Your documents are private & secure
                      </p>
                    </div>
                  ) : (
                    <div className="workspace__file-preview">
                      <div className="workspace__file-icon">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                      </div>
                      <div className="workspace__file-info">
                        <p className="workspace__file-name">{file.name}</p>
                        <p className="workspace__file-size">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        className="workspace__file-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        aria-label="Remove file"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>

              {error && <div className="workspace__error">{error}</div>}

              {file && (
                <div className="workspace__actions">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startAnalysis}
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    }
                  >
                    Analyze Policy
                  </Button>
                </div>
              )}

              {/* Feature hints */}
              <div className="workspace__hints">
                {[
                  {
                    id: "coverage",
                    title: "Coverage Analysis",
                    desc: "What's covered and what's not!",
                    preview:
                      "AI scans for medical, liability, and property limits instantly.",
                    color: "green",
                    icon: (
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    ),
                  },
                  {
                    id: "risks",
                    title: "Risk Flags",
                    desc: "Hidden dangers in fine print!",
                    preview:
                      "Identify exclusions and tricky clauses before you sign.",
                    color: "red",
                    icon: (
                      <>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </>
                    ),
                  },
                  {
                    id: "terms",
                    title: "Terms Decoded",
                    desc: "Jargon to plain English for your ease!",
                    preview:
                      '"Pro rata", "Subrogation", and more translated for humans.',
                    color: "blue",
                    icon: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </>
                    ),
                  },
                ].map((hint, idx) => {
                  const cardVariants = {
                    initial: { opacity: 0, y: 20 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: 0.4 + idx * 0.1,
                        duration: 0.8,
                        ease: [0.23, 1, 0.32, 1],
                      },
                    },
                    hover: {
                      y: -12,
                      scale: 1.02,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.1)",
                      transition: {
                        duration: 0.4,
                        ease: [0.25, 1, 0.5, 1], // Physics-like feel
                        delay: 0, // Ensure no delay on hover
                      },
                    },
                  };

                  const contentVariants = {
                    initial: { height: 0, opacity: 0, marginTop: 0 },
                    hover: {
                      height: "auto",
                      opacity: 1,
                      marginTop: 12,
                      transition: { duration: 0.3, ease: "easeOut" },
                    },
                  };

                  return (
                    <motion.div
                      key={hint.id}
                      className="workspace__hint"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <motion.div
                        className={`workspace__hint-icon workspace__hint-icon--${hint.color}`}
                        variants={{
                          hover: { scale: 1.1, rotate: -5 },
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {hint.icon}
                        </svg>
                      </motion.div>
                      <div>
                        <p className="workspace__hint-title">{hint.title}</p>
                        <p className="workspace__hint-desc">{hint.desc}</p>
                        <div className="workspace__hint-preview-container">
                          <motion.p
                            className="workspace__hint-preview"
                            variants={contentVariants}
                          >
                            {hint.preview}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── PROCESSING STATE ── */}
          {state === "processing" && (
            <div className="workspace__processing">
              <div className="workspace__processing-card">
                <h2 className="workspace__ai-thinking">AI is thinking...</h2>
                <div className="workspace__processing-visual">
                  <Loader variant="orb" />
                </div>
                <div className="workspace__processing-info">
                  <div className="workspace__progress-bar">
                    <div
                      className="workspace__progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="workspace__progress-label">{progressLabel}</p>
                  <p className="workspace__progress-pct">{progress}%</p>
                </div>
                <p className="workspace__processing-file">
                  Analyzing <strong>{file?.name}</strong>
                </p>
              </div>
            </div>
          )}

          {/* ── RESULTS STATE ── */}
          {state === "results" && analysis && (
            <motion.div 
              className="workspace__results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Top Row: Overview + Score */}
              <div className="workspace__results-top">
                <Card 
                  variant="lifted" 
                  className="workspace__overview-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <p
                    className="text-overline"
                    style={{ marginBottom: "var(--space-md)" }}
                  >
                    POLICY OVERVIEW
                  </p>
                  <h2 className="workspace__policy-name">
                    {analysis.policyOverview.name}
                  </h2>
                  <p className="workspace__policy-type">
                    {analysis.policyOverview.type}
                  </p>
                  <div className="workspace__overview-grid">
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">
                        Provider
                      </span>
                      <span className="workspace__overview-value">
                        {analysis.policyOverview.provider}
                      </span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">
                        Policy No.
                      </span>
                      <span className="workspace__overview-value">
                        {analysis.policyOverview.policyNumber}
                      </span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">
                        Sum Insured
                      </span>
                      <span className="workspace__overview-value workspace__overview-value--highlight">
                        {analysis.policyOverview.sumInsured}
                      </span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Premium</span>
                      <span className="workspace__overview-value">
                        {analysis.policyOverview.premium}
                      </span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">
                        Valid From
                      </span>
                      <span className="workspace__overview-value">
                        {analysis.policyOverview.effectiveDate}
                      </span>
                    </div>
                    <div className="workspace__overview-item">
                      <span className="workspace__overview-label">Expires</span>
                      <span className="workspace__overview-value">
                        {analysis.policyOverview.expiryDate}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card 
                  variant="lifted" 
                  className="workspace__score-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p
                    className="text-overline"
                    style={{
                      marginBottom: "var(--space-md)",
                      textAlign: "center",
                    }}
                  >
                    COVERAGE SCORE
                  </p>
                  <div className="workspace__score-dial">
                    <svg viewBox="0 0 100 100" className="workspace__score-svg">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={
                          analysis.coverageScore >= 80
                            ? "#2ecc71"
                            : analysis.coverageScore >= 60
                              ? "#f39c12"
                              : "#e74c3c"
                        }
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(analysis.coverageScore / 100) * 264} 264`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        className="workspace__score-ring"
                      />
                    </svg>
                    <div className="workspace__score-center">
                      <span className="workspace__score-number">
                        {analysis.coverageScore}
                      </span>
                      <span className="workspace__score-grade">
                        {analysis.coverageGrade}
                      </span>
                    </div>
                  </div>
                  <p className="workspace__score-summary">
                    {analysis.coverageScore >= 80
                      ? "Strong coverage across most categories"
                      : analysis.coverageScore >= 60
                        ? "Decent coverage with some notable gaps"
                        : "Significant coverage gaps detected"}
                  </p>
                </Card>
              </div>

              {/* Summary */}
              <Card 
                variant="lifted" 
                className="workspace__summary-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p
                  className="text-overline"
                  style={{ marginBottom: "var(--space-sm)" }}
                >
                  AI SUMMARY
                </p>
                <p className="workspace__summary-text">{analysis.summary}</p>
              </Card>

              {/* Tab Navigation */}
              <div className="workspace__tabs">
                {[
                  {
                    key: "coverage",
                    label: "Coverage",
                    count: analysis.coverageItems.length,
                  },
                  {
                    key: "exclusions",
                    label: "Exclusions",
                    count: analysis.exclusions.length,
                  },
                  {
                    key: "terms",
                    label: "Key Terms",
                    count: analysis.keyTerms.length,
                  },
                  {
                    key: "risks",
                    label: "Risk Flags",
                    count: analysis.riskFlags.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`workspace__tab ${activeTab === tab.key ? "workspace__tab--active" : ""}`}
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
                {activeTab === "coverage" && (
                  <div className="workspace__coverage-list">
                    {analysis.coverageItems.map((item, i) => (
                      <div
                        key={i}
                        className={`workspace__coverage-item workspace__coverage-item--${item.status}`}
                      >
                        <div className="workspace__coverage-status">
                          {item.status === "covered" && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#2ecc71"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {item.status === "partial" && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#f39c12"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          )}
                          {item.status === "not_covered" && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#e74c3c"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                        <div className="workspace__coverage-info">
                          <p className="workspace__coverage-category">
                            {item.category}
                          </p>
                          <p className="workspace__coverage-detail">
                            {item.detail}
                          </p>
                        </div>
                        <span
                          className={`workspace__coverage-badge workspace__coverage-badge--${item.status}`}
                        >
                          {item.status === "covered"
                            ? "Covered"
                            : item.status === "partial"
                              ? "Partial"
                              : "Not Covered"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exclusions Tab */}
                {activeTab === "exclusions" && (
                  <div className="workspace__exclusions-list">
                    {analysis.exclusions.map((exc, i) => (
                      <Card
                        key={i}
                        variant="lifted"
                        className={`workspace__exclusion-card workspace__exclusion-card--${exc.severity}`}
                      >
                        <div className="workspace__exclusion-header">
                          <span
                            className={`workspace__severity workspace__severity--${exc.severity}`}
                          >
                            {exc.severity}
                          </span>
                          <h4 className="workspace__exclusion-title">
                            {exc.title}
                          </h4>
                        </div>
                        <p className="workspace__exclusion-detail">
                          {exc.detail}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Key Terms Tab */}
                {activeTab === "terms" && (
                  <div className="workspace__terms-list">
                    {analysis.keyTerms.map((term, i) => (
                      <div key={i} className="workspace__term-item">
                        <h4 className="workspace__term-word">{term.term}</h4>
                        <p className="workspace__term-meaning">
                          {term.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Flags Tab */}
                {activeTab === "risks" && (
                  <div className="workspace__risks-list">
                    {analysis.riskFlags.map((risk, i) => (
                      <Card
                        key={i}
                        variant="lifted"
                        className={`workspace__risk-card workspace__risk-card--${risk.level}`}
                      >
                        <div className="workspace__risk-header">
                          <span
                            className={`workspace__risk-level workspace__risk-level--${risk.level}`}
                          >
                            {risk.level === "critical" && "🔴"}
                            {risk.level === "warning" && "🟡"}
                            {risk.level === "info" && "🔵"} {risk.level}
                          </span>
                        </div>
                        <h4 className="workspace__risk-flag">{risk.flag}</h4>
                        <p className="workspace__risk-detail">{risk.detail}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage;
