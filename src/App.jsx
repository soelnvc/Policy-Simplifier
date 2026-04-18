import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/common/ProtectedRoute';

// Eagerly loaded pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WorkspacePage from './pages/WorkspacePage';
import DashboardPage from './pages/DashboardPage';

// Lazy-loaded pages
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

/**
 * Suspense fallback — centered pulsing orb loader.
 */
function PageLoader() {
  return (
    <div className="page-content flex-center" style={{ minHeight: '60vh' }}>
      <Loader variant="orb" text="Loading..." />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route path="/workspace" element={
              <ProtectedRoute><WorkspacePage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute><ComparisonPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div className="theme-main page-content flex-center" style={{ minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontSize: 'var(--text-display)', marginBottom: '1rem' }}>404</h1>
                  <p>This page doesn't exist.</p>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
