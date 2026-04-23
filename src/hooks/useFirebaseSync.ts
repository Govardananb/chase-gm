import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

export function useFirebaseSync<T>(key: string, initialValue: T) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const hasLoadedFromFirestore = useRef(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'app_state', key);

    const unsubscribe = onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
      // Don't let server updates overwrite local typing/pending state
      if (snapshot.metadata.hasPendingWrites) {
        setLoading(false);
        return;
      }

      if (snapshot.exists()) {
        const val = snapshot.data()?.value as T;
        setData(val);
        window.localStorage.setItem(key, JSON.stringify(val));
      } else {
        // If document doesn't exist, we don't overwrite local 'data' yet,
        // but we mark it as loaded so the first write is safe.
      }
      
      hasLoadedFromFirestore.current = true;
      setLoading(false);
    }, (err) => {
      console.error(`Sync Error [${key}]:`, err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [key]);

  const setSyncedData = async (newData: T | ((val: T) => T)) => {
    // CRITICAL PROTECTION: Prevent writing to the database until we have 
    // at least tried to load the existing data from Firestore once.
    // This prevents a new user from accidentally overwriting the DB with empty state.
    if (!hasLoadedFromFirestore.current) {
       console.warn(`Sync Warning: Global write blocked until database hydration for "${key}".`);
       return; 
    }

    setData(prev => {
      const valueToStore = newData instanceof Function ? newData(prev) : newData;
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      const docRef = doc(db, 'app_state', key);
      setDoc(docRef, { value: valueToStore }).catch(e => {
        alert(`❌ Database Sync Failed: ${e.message}`);
      });

      return valueToStore;
    });
  };

  return [data, setSyncedData, loading] as const;
}
