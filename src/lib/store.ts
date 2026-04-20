/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Badge, LeaderboardEntry, LearningPath } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';

export function useUserStore() {
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPoints(0);
        setStreak(0);
        setBadges([]);
        setLearningPath(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const pathDocRef = doc(db, 'paths', user.uid);

    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPoints(data.points || 0);
        setStreak(data.streak || 0);
        setBadges(data.badges || []);
      } else {
        // Initialize new user
        setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          points: 0,
          streak: 0,
          badges: [],
          lastActivity: new Date().toISOString()
        });
      }
      setLoading(false);
    });

    const unsubPath = onSnapshot(pathDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setLearningPath(docSnap.data() as LearningPath);
      }
    });

    return () => {
      unsubUser();
      unsubPath();
    };
  }, [user]);

  const updateActivity = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    const lastActivityDateStr = data.lastActivity;
    
    let newStreak = data.streak || 0;
    
    if (lastActivityDateStr) {
      const lastActivityDate = new Date(lastActivityDateStr);
      const lastDate = new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate());
      
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // if diffDays is 0, we don't change the streak
    } else {
      newStreak = 1;
    }

    await updateDoc(userDocRef, {
      streak: newStreak,
      lastActivity: now.toISOString()
    });
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      points: increment(amount)
    });
    await updateActivity();
  };

  const saveLearningPath = async (path: LearningPath) => {
    setLearningPath(path);
    if (!user) return;
    const pathDocRef = doc(db, 'paths', user.uid);
    await setDoc(pathDocRef, { ...path, userId: user.uid });
  };

  return {
    user,
    points,
    streak,
    badges,
    learningPath,
    loading,
    addPoints,
    saveLearningPath
  };
}
