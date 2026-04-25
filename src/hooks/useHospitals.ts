import { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Hospital } from '../types';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempting a simple getDocs first, or onSnapshot
    const unsub = onSnapshot(collection(db, 'hospitals'), (snap) => {
      if (!snap.empty) {
        setHospitals(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Hospital)));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching hospitals', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { hospitals, loading };
}
