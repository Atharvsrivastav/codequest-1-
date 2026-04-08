/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Badge, LeaderboardEntry, LearningPath } from '../types';

export function useUserStore() {
  const [points, setPoints] = useState<number>(() => {
    return Number(localStorage.getItem('lumina_points')) || 2450;
  });
  
  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem('lumina_streak')) || 12;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('lumina_badges');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Quick Learner', description: 'Completed 5 quizzes in a day', icon: 'Zap', unlockedAt: new Date().toISOString() },
      { id: '2', name: 'Streak Master', description: 'Maintained a 7-day streak', icon: 'Flame', unlockedAt: new Date().toISOString() }
    ];
  });

  const [learningPath, setLearningPath] = useState<LearningPath | null>(() => {
    const saved = localStorage.getItem('lumina_path');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('lumina_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('lumina_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lumina_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('lumina_path', JSON.stringify(learningPath));
  }, [learningPath]);

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  const unlockBadge = (badge: Badge) => {
    if (!badges.find(b => b.id === badge.id)) {
      setBadges(prev => [...prev, { ...badge, unlockedAt: new Date().toISOString() }]);
    }
  };

  return {
    points,
    streak,
    badges,
    learningPath,
    addPoints,
    unlockBadge,
    setLearningPath,
    setStreak
  };
}
