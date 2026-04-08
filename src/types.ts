/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  streak: number;
  avatar?: string;
}

export interface PathStep {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'visualization';
  description: string;
  estimatedTime: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  goal: string;
  level: string;
  steps: PathStep[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  history: { questionId: string; selectedOption: number; isCorrect: boolean }[];
}

export interface LearningSource {
  id: string;
  type: 'text' | 'url' | 'pdf' | 'youtube';
  title: string;
  content: string;
  summary?: string;
  mindMap?: any;
}

export interface UserProgress {
  streak: number;
  totalPoints: number;
  accuracy: number;
  completedTopics: string[];
  mistakes: string[];
}
