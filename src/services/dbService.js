import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

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
 * Deletes a policy from the user's dashboard.
 */
export async function deletePolicyAnalysis(userId, policyId) {
  if (!userId || !policyId) throw new Error("Invalid parameters for deletion.");
  
  const policyRef = doc(db, 'users', userId, 'policies', policyId);
  await deleteDoc(policyRef);
}
