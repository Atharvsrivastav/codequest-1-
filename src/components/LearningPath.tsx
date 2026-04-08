/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Target, Sparkles, Loader2, ArrowRight, CheckCircle2, BookOpen, BrainCircuit, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { geminiService } from '../services/gemini';
import { LearningPath } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LearningPathViewProps {
  onPathGenerated: (path: LearningPath) => void;
}

export default function LearningPathView({ onPathGenerated }: LearningPathViewProps) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'goal' | 'diagnostic' | 'result'>('goal');
  const [diagnosticScore, setDiagnosticScore] = useState(0);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd run a mini diagnostic quiz here
      // For now, we'll simulate it
      const path = await geminiService.generateLearningPath(goal, "User is a beginner but knows basic syntax.");
      onPathGenerated(path);
      setStep('result');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
                  <Target size={32} />
                </div>
                <CardTitle className="text-2xl">Personalized Learning Path</CardTitle>
                <CardDescription>Tell us your goal, and we'll build a custom journey for you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">What is your learning goal?</label>
                  <Input 
                    placeholder="e.g., 'Learn Python for Web Development', 'Prepare for Java Interview'" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="h-12 bg-secondary/50 border-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Web Development', 'Data Science', 'Language Learning', 'Coding Interview'].map(g => (
                    <Button 
                      key={g} 
                      variant="outline" 
                      className="justify-start gap-2 h-12"
                      onClick={() => setGoal(g)}
                    >
                      <Sparkles size={16} className="text-primary" />
                      {g}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardContent>
                <Button 
                  onClick={() => setStep('diagnostic')} 
                  className="w-full h-12 text-lg gap-2" 
                  disabled={!goal.trim()}
                >
                  Next: Diagnostic Assessment
                  <ArrowRight size={20} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'diagnostic' && (
          <motion.div
            key="diagnostic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Diagnostic Assessment</CardTitle>
                <CardDescription>Let's see what you already know about {goal}.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 py-12 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                  <BrainCircuit size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Assessing Knowledge...</h3>
                  <p className="text-muted-foreground">Lumina is analyzing your profile and goals.</p>
                </div>
                <div className="max-w-xs mx-auto">
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
              <CardContent>
                <Button 
                  onClick={handleGenerate} 
                  className="w-full h-12 text-lg gap-2" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Generate My Path'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PathDisplay({ path }: { path: LearningPath }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Your Custom Journey</h1>
        <p className="text-muted-foreground">Goal: {path.goal} • Level: {path.level}</p>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-border before:to-transparent">
        {path.steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {step.type === 'lesson' && <BookOpen size={18} />}
              {step.type === 'quiz' && <BrainCircuit size={18} />}
              {step.type === 'visualization' && <Eye size={18} />}
            </div>
            {/* Content */}
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="capitalize">{step.type}</Badge>
                <span className="text-xs text-muted-foreground">{step.estimatedTime}</span>
              </div>
              <h3 className="font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{step.description}</p>
              {step.completed && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-500 font-medium">
                  <CheckCircle2 size={14} />
                  Completed
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button size="lg" className="gap-2 px-8">
          Continue Learning
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
