import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'app_state', key);

    const unsubscribe = onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
      // Avoid overwriting local optimistic state while write is pending
      if (snapshot.metadata.hasPendingWrites) {
        setLoading(false);
        return;
      }

      if (snapshot.exists()) {
        const val = snapshot.data()?.value as T;
        setData(val);
        window.localStorage.setItem(key, JSON.stringify(val));
      }
      setLoading(false);
    }, (err) => {
      console.error(`Sync Error [${key}]:`, err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [key]);

  const setSyncedData = async (newData: T | ((val: T) => T)) => {
    // Correctly handle functional updates by using the latest state
    setData(prev => {
      const valueToStore = newData instanceof Function ? newData(prev) : newData;
      
      // Persist to LocalStorage instantly
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Async write to Firebase
      const docRef = doc(db, 'app_state', key);
      setDoc(docRef, { value: valueToStore }).catch(e => {
        alert(`❌ Database Sync Failed: ${e.message}\nYour changes might not persist across devices.`);
      });

      return valueToStore;
    });
  };

  return [data, setSyncedData, loading] as const;
}
