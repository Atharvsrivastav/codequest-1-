/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BrainCircuit, 
  Eye, 
  Zap, 
  Settings, 
  Moon, 
  Sun,
  Trophy,
  Flame,
  Target,
  Menu,
  X,
  Map as MapIcon,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import Dashboard from './components/Dashboard';
import AITutor from './components/AITutor';
import QuizSystem from './components/QuizSystem';
import Visualizer from './components/Visualizer';
import FastLearning from './components/FastLearning';
import Leaderboard from './components/Leaderboard';
import LearningPathView, { PathDisplay } from './components/LearningPath';
import ProgressAnalytics from './components/ProgressAnalytics';
import { useUserStore } from './lib/store';

type Tab = 'dashboard' | 'tutor' | 'quiz' | 'visualizer' | 'fast-learning' | 'leaderboard' | 'path' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { points, streak, badges, learningPath, setLearningPath } = useUserStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'path', label: 'Learning Path', icon: MapIcon },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'quiz', label: 'Adaptive Quiz', icon: BrainCircuit },
    { id: 'visualizer', label: 'Visualizer', icon: Eye },
    { id: 'fast-learning', label: 'Fast Learning', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="border-r border-border bg-card flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-bold text-xl tracking-tight"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                L
              </div>
              <span>Lumina</span>
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="shrink-0"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-2 py-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 h-11 ${!isSidebarOpen && 'px-0 justify-center'}`}
                onClick={() => setActiveTab(item.id as Tab)}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-primary' : 'text-muted-foreground'} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-2">
            {isSidebarOpen && <span className="text-sm text-muted-foreground">Appearance</span>}
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
          {isSidebarOpen && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Your Progress</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Pro</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Flame size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold">{streak} Day Streak</div>
                  <div className="text-[10px] text-muted-foreground">Keep it up!</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm font-medium">
              <Trophy size={16} className="text-yellow-500" />
              <span>{points.toLocaleString()} pts</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto h-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'path' && (
                learningPath ? <PathDisplay path={learningPath} /> : <LearningPathView onPathGenerated={setLearningPath} />
              )}
              {activeTab === 'tutor' && <AITutor />}
              {activeTab === 'quiz' && <QuizSystem />}
              {activeTab === 'visualizer' && <Visualizer />}
              {activeTab === 'fast-learning' && <FastLearning />}
              {activeTab === 'leaderboard' && <Leaderboard />}
              {activeTab === 'analytics' && <ProgressAnalytics />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
