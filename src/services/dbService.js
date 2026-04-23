import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Database Interaction Layer — Firestore implementation.
 * Handles policies, comparisons, and user settings.
 */

/**
 * Saves a new AI policy analysis mapped to the user.
 * We are using Option A (Lightweight): We store the structured JSON only.
 * 
 * @param {string} userId - The authenticated user's Firebase UID
 * @param {object} analysisData - The complete structured JSON from Gemini
 * @returns {Promise<string>} The Firestore document ID
 */
export async function savePolicyAnalysis(userId, analysisData) {
  if (!userId) throw new Error("Authentication required to save policy.");

  // Path: /users/{userId}/policies/{auto-id}
  const policiesRef = collection(db, 'users', userId, 'policies');
  
  const payload = {
    ...analysisData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(policiesRef, payload);
  return docRef.id;
}

/**
 * Fetches all policies analyzed by a given user.
 * 
 * @param {string} userId - The authenticated user's Firebase UID
 * @returns {Promise<Array>} Array of policy objects
 */
export async function getUserPolicies(userId) {
  if (!userId) return [];

  const policiesRef = collection(db, 'users', userId, 'policies');
  const q = query(policiesRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert server timestamp to serializable readable date if exists
    capturedDate: doc.data().createdAt?.toDate().toLocaleDateString() || doc.data().analyzedAt
  }));
}

/**
 * Fetches only policies that have been marked as saved/favorite by the user.
 */
export async function getFavoritePolicies(userId) {
  if (!userId) return [];

  const policiesRef = collection(db, 'users', userId, 'policies');
  // Removed orderBy('createdAt') from the query to avoid requiring a composite index setup in Firestore
  const q = query(policiesRef, where('isFavorite', '==', true));
  
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    capturedDate: doc.data().createdAt?.toDate().toLocaleDateString() || doc.data().analyzedAt
  }));

  // Sort client-side by descending creation time
  return results.sort((a, b) => {
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA;
  });
}

/**
 * Toggles the favorite/saved status of a specific policy analysis.
 */
export async function toggleFavoritePolicy(userId, policyId, isFavorite) {
  if (!userId || !policyId) throw new Error("Invalid parameters to update favorite status.");
  
  const policyRef = doc(db, 'users', userId, 'policies', policyId);
  await updateDoc(policyRef, {
    isFavorite: isFavorite
  });
}

/**
 * Saves a side-by-side comparison.
 */
export async function saveComparison(userId, comparisonData) {
  if (!userId) throw new Error("Authentication required to save comparison.");

  const comparisonsRef = collection(db, 'users', userId, 'comparisons');
  const payload = {
    ...comparisonData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(comparisonsRef, payload);
  return docRef.id;
}

/**
 * Fetches comparison history with 30-day auto-delete (filtering).
 */
export async function getComparisonHistory(userId) {
  if (!userId) return [];

  const comparisonsRef = collection(db, 'users', userId, 'comparisons');
  const q = query(comparisonsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const now = new Date();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  const allComparisons = snapshot.docs.map(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate();
    return {
      id: doc.id,
      ...data,
      createdAt,
      displayDate: createdAt?.toLocaleDateString() || 'Just now'
    };
  });

  // Client-side auto-delete logic: Filter out old items
  // Real removal from DB can be done asynchronously here too
  const validHistory = allComparisons.filter(item => {
    if (!item.createdAt) return true;
    return (now - item.createdAt) < thirtyDaysInMs;
  });

  // Optional: Background cleanup for genuinely old docs
  allComparisons.forEach(async (item) => {
    if (item.createdAt && (now - item.createdAt) > thirtyDaysInMs) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'comparisons', item.id));
      } catch (e) {
        console.warn("Auto-delete cleanup failed", e);
      }
    }
  });

  return validHistory;
}

/**
 * Deletes a policy from the user's dashboard.
 */
export async function deletePolicyAnalysis(userId, policyId) {
  if (!userId || !policyId) throw new Error("Invalid parameters for deletion.");
  
  const policyRef = doc(db, 'users', userId, 'policies', policyId);
  await deleteDoc(policyRef);
}
