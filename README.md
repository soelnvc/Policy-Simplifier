<div align="center">
  <h1>🛡️ Policy Simplifier (Antigravity Edition)</h1>

  <p>
    <strong>A next-generation AI-powered platform designed to decode, analyze, and demystify complex insurance documents.</strong>
  </p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/UX-Glassmorphism-black?style=for-the-badge&logo=css3" alt="UX"/></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Powered%20By-Gemini%20AI-blue?style=for-the-badge&logo=google" alt="AI"/></a>
    <a href="#architecture"><img src="https://img.shields.io/badge/Built%20With-React%2019-61dafb?style=for-the-badge&logo=react" alt="React"/></a>
    <a href="#ui-engineering"><img src="https://img.shields.io/badge/3D-Spline%20Integration-ff0055?style=for-the-badge&logo=spline" alt="Spline"/></a>
  </p>

  <br />

  <div align="center">
    <img src="public/demo.gif" width="90%" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.6);" alt="Policy Simplifier Demo" />
    <br/><br/>
    <p>
      <a href="public/Demo.mov" target="_blank">
        <img src="https://img.shields.io/badge/🎬%20Watch%20Full%204K%20Demo-white?style=for-the-badge" alt="Full Demo" />
      </a>
    </p>
  </div>
</div>

<br />

> **“Insurance companies bury their exclusions, limits, and traps deep inside 40-page PDF documents full of archaic legal jargon. We built a machine to dig them up.”**

---

## 📖 Table of Contents

- [The Problem vs. The Solution](#-the-problem-vs-the-solution)
- [Key Features](#-key-features)
- [Stunning UX & UI Engineering](#-stunning-ux--ui-engineering)
- [The Tech Stack](#%EF%B8%8F-the-tech-stack)
- [Getting Started](#-getting-started)
- [Project Architecture](#-project-architecture)

---

## 🎯 The Problem vs. The Solution

**The Problem:** Over 90% of consumers experience an "Understanding Gap" when buying insurance. They guess what is covered. Consequently, 1 in 4 insurance claims faces delays or outright rejection due to hidden clauses and archaic jargon.

**The Solution:** Policy Simplifier takes uploaded documents (PDFs, Images, Text) and pipes them through Google's cutting-edge **Gemini 3.1 Flash-Lite AI** engine. Within seconds, it breaks the policy down into a highly readable summary, generates a custom Coverage Score out of 100, and explicitly red-flags hidden risks.

---

## ⚡ Key Features

### 🧠 Cinematic AI Workspace

A dark-mode optimized, cinematic workspace environment where users upload their documents. Leveraging native CSS drag-and-drop and real-time visual feedback, the workspace parses documents and immediately transitions into an interactive, multi-tabbed breakdown (Coverage, Risks, and Terms).

### 📈 Intelligent Dashboard & Portfolio

Users build an active portfolio of analyzed policies. The application dynamically calculates an average **Portfolio Health Score**, counting open risks and grouping policies by type (Auto, Health, Home, Life).

<br/>
<img src="public/dashboard_preview.png" width="100%" style="border-radius: 12px; border: 1px solid var(--border-light); margin: 20px 0;" alt="Dashboard Preview" />
<br/>

### 🔖 Universal Bookmark System

A highly optimized state-management approach allows users to instantly bookmark ("Favorite") critical analyses. Marked insights bypass firestore re-querying directly into a unified **"Saved Insights"** tracking hub within the centralized settings.

---

## 🎨 Stunning UX & UI Engineering

Policy Simplifier avoids generic UI frameworks (like Material or Bootstrap) in favor of a strictly bespoke, highly-engineered frontend architecture:

- **Cinematic WebP Scroll Sequencing:** The landing page features a buttery-smooth, Apple-inspired scroll animation engine that scrubs through 82 highly compressed `.webp` frames dynamically tied to the user's scroll percentage.
- **Spline 3D Integration:** A sophisticated 3D robot scene, rendered natively in the browser via `@splinetool/react-spline`. We engineered intentional UI masking to seamlessly blend the 3D environment with our proprietary DOM structure.
- **Magnetic CSS Snap-Scrolling:** Taking advantage of modern CSS `scroll-snap-type: y mandatory`, bounding sections into immersive, full viewport experiences without heavy JS libraries.
- **Advanced Glassmorphism:** Employing intricate CSS architectures `backdrop-filter: blur(16px)` and variable structural Opacities to simulate frosted architectural glass overlaying deep Onyx backgrounds.
- **Dynamic SVG Dials:** Circular progress metrics map raw user-data natively to `stroke-dasharray` values, driving engaging radial loading animations organically across all Dashboards and Policy Cards.
- **Seamless Page Transitions:** Leveraging **Framer Motion** and strategic React `<Suspense />` wrappers to allow soft-fades between high-fidelity layouts, preventing abrupt flashes of unstyled content.

---

## 🛠️ The Tech Stack

### Core Frontend

- **React 19** (Vite Engine) - Lightning-fast HMR and optimized production bundling.
- **React Router v6** - Protected routing arrays with local storage authentication gates.
- **Vanilla CSS3 (Bespoke)** - utilizing advanced CSS variables methodology based on custom design tokens (referred to structurally as _The Stitch Design System_).

### AI & Backend Services

- **Google Gemini AI API** (`gemini-3.1-flash-lite-preview`) - Orchestrating the heavy lifting for OCR capabilities and deep semantic context digestion of legal documentation.
- **Firebase & Firestore** - Managing lightweight, heavily indexed NoSQL user graphs. Document schemas rely on scalable JSON payload structures rather than relational bloat.

---

## 🚀 Getting Started

To launch the development server and test the platform locally:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/policy-simplifier.git

# 2. Navigate into the application directory
cd policy-simplifier/Project_Simplifier

# 3. Install dependencies
npm install

# 4. Configure your environment
# Create a .env file at the root of Project_Simplifier and add:
VITE_GEMINI_API_KEY="your_api_key_here"
VITE_FIREBASE_API_KEY="your_firebase_key"

# 5. Boot the hyper-optimized dev server
npm run dev
```

---

## 🏗️ Project Architecture

A glimpse into our scalable structural directory:

```text
📦 src
 ┣ 📂 assets              # UI elements, static assets, and graphic overlays
 ┣ 📂 components          # Modular, reusable presentation logic
 ┃ ┣ 📂 animation         # Scroll sequence engines and layout transitions
 ┃ ┣ 📂 common            # Buttons, Cards, Modals, Spline wrappers
 ┃ ┗ 📂 layout            # Adaptive Mega-Menus, Navigations, and Footers
 ┣ 📂 context             # State Management (AuthContext, ToastContext)
 ┣ 📂 hooks               # Custom React Hooks (useAuth, useScrollReveal)
 ┣ 📂 pages               # High-level entry points
 ┃ ┣ 📜 LandingPage.jsx   # Hero entrance & Scroll Sequences
 ┃ ┣ 📜 WorkspacePage.jsx # AI Engine & Analysis Results
 ┃ ┣ 📜 DashboardPage.jsx # Portfolio Overview & Stats
 ┃ ┣ 📜 ComparisonPage.jsx # Multi-policy risk comparison
 ┃ ┣ 📜 AllPoliciesPage.jsx # Grid-based portfolio management
 ┃ ┣ 📜 SettingsPage.jsx  # Preferences & Saved Insights
 ┃ ┣ 📜 ProfilePage.jsx   # User identity & account management
 ┃ ┗ 📜 Auth (Login/Signup)
 ┣ 📂 services            # Business & AI Logic
 ┃ ┣ 📜 aiService.js      # Gemini Semantic Engine
 ┃ ┣ 📜 dbService.js      # Firestore Interaction layer
 ┃ ┣ 📜 authService.js    # Firebase Auth wrappers
 ┃ ┣ 📜 firebase.js       # Core initialization
 ┃ ┗ 📜 mockAnalysis.js   # Testing & Development data
 ┣ 📂 mock data           # Sample policy .txt files for testing
 ┗ 📜 App.jsx             # The Main Router & Gatekeeper
```

<div align="center">
  <br/>
  <p>Crafted with profound attention to detail and interaction fidelity.</p>
</div>
