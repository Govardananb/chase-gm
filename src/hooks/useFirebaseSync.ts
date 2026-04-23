import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebaseClient';

export function useFirebaseSync<T>(key: string, initialValue: T) {
  // Seed from localStorage instantly so UI never flickers
  const [data, setData] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (!db) return; // No Firebase config yet — local only

    const docRef = doc(db, 'app_state', key);

    // Subscribe to realtime updates
    const unsubscribe = onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
      // If we have pending local writes, don't let the server snapshot overwrite our optimistic UI
      if (snapshot.metadata.hasPendingWrites) return;

      if (snapshot.exists()) {
        const val = snapshot.data()?.value as T;
        setData(val);
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    }, (err) => {
      console.warn(`useFirebaseSync: snapshot error for "${key}"`, err.message);
    });

    return () => unsubscribe();
  }, [key]);

  const setSyncedData = async (newData: T | ((val: T) => T)) => {
    const valueToStore = newData instanceof Function ? newData(data) : newData;

    // Optimistic local update
    setData(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));

    // Write to Firebase
    if (db) {
      try {
        const docRef = doc(db, 'app_state', key);
        await setDoc(docRef, { value: valueToStore });
      } catch (e: any) {
        console.warn(`useFirebaseSync: write error for "${key}"`, e.message);
      }
    }
  };

  return [data, setSyncedData] as const;
}
