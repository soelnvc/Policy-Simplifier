import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
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
 * Deletes a policy from the user's dashboard.
 */
export async function deletePolicyAnalysis(userId, policyId) {
  if (!userId || !policyId) throw new Error("Invalid parameters for deletion.");
  
  const policyRef = doc(db, 'users', userId, 'policies', policyId);
  await deleteDoc(policyRef);
}
