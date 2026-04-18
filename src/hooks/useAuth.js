import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Convenience hook for accessing auth state.
 * Returns { user, loading, error }.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
