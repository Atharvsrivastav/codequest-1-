/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { geminiService } from '../services/gemini';
import { QuizQuestion, Difficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '../lib/store';

export default function QuizSystem() {
  const { addPoints } = useUserStore();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const q = await geminiService.generateQuiz(topic, difficulty);
      setQuestions(q);
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      // Award points: 100 per correct answer, bonus for completion
      const earned = (score * 100) + 500;
      addPoints(earned);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-xl font-bold">Generating Personalized Quiz</h3>
          <p className="text-muted-foreground">Lumina is crafting questions based on your level...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 || isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {isFinished ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Sparkles size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Quiz Completed!</h2>
              <p className="text-muted-foreground">Great job! You've earned some knowledge points.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-secondary/50 border-none">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className="text-4xl font-bold">{score} / {questions.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-none">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-4xl font-bold">{Math.round((score / questions.length) * 100)}%</div>
                </CardContent>
              </Card>
            </div>
            <Button onClick={() => setQuestions([])} className="w-full h-12 text-lg gap-2">
              <RefreshCcw size={20} />
              Try Another Topic
            </Button>
          </motion.div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
                <BrainCircuit size={32} />
              </div>
              <CardTitle className="text-2xl">Adaptive Quiz System</CardTitle>
              <CardDescription>Test your knowledge with AI-generated questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What do you want to be quizzed on?</label>
                <Input 
                  placeholder="e.g., Python Lists, French Verbs, React Hooks..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12 bg-secondary/50 border-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
                    <Button
                      key={d}
                      variant={difficulty === d ? 'default' : 'secondary'}
                      onClick={() => setDifficulty(d)}
                      className="capitalize"
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startQuiz} className="w-full h-12 text-lg gap-2" disabled={!topic.trim()}>
                Generate Quiz
                <ArrowRight size={20} />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{difficulty}</Badge>
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="text-sm font-bold text-primary">Score: {score}</div>
      </div>
      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                let variant: 'outline' | 'default' | 'destructive' | 'secondary' = 'outline';
                if (isAnswered) {
                  if (i === currentQuestion.correctAnswer) variant = 'default';
                  else if (i === selectedOption) variant = 'destructive';
                  else variant = 'secondary';
                }

                return (
                  <Button
                    key={i}
                    variant={variant}
                    className={`w-full h-auto py-4 px-6 justify-start text-left whitespace-normal relative overflow-hidden transition-all duration-300 ${
                      !isAnswered && 'hover:bg-primary/5 hover:border-primary/30'
                    }`}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold ${
                        isAnswered && i === currentQuestion.correctAnswer ? 'bg-primary text-primary-foreground border-primary' : ''
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {isAnswered && i === currentQuestion.correctAnswer && <CheckCircle2 size={20} className="text-primary-foreground" />}
                      {isAnswered && i === selectedOption && i !== currentQuestion.correctAnswer && <XCircle size={20} />}
                    </div>
                  </Button>
                );
              })}
            </CardContent>
            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-secondary/30 border-t border-border p-6 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Sparkles size={16} className="text-primary" />
                    Lumina's Explanation
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
                </div>
                <Button onClick={nextQuestion} className="w-full gap-2">
                  {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
