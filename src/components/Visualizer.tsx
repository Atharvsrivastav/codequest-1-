/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Code, 
  Terminal, 
  Layers, 
  Cpu,
  Settings2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/gemini';
import { ExecutionStep } from '../types';

const DEFAULT_CODE = `function factorial(n) {
  if (n <= 1) return 1;
  let result = n * factorial(n - 1);
  return result;
}

console.log(factorial(3));`;

export default function Visualizer() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState([1000]); // ms per step
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[currentStepIdx];

  const handleVisualize = async () => {
    if (!code.trim()) {
      setError("Please enter some code first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const generatedSteps = await geminiService.generateExecutionSteps(code, language);
      if (!generatedSteps || generatedSteps.length === 0) {
        throw new Error("No execution steps were generated.");
      }
      setSteps(generatedSteps);
      setCurrentStepIdx(0);
      setIsPlaying(false);
    } catch (err) {
      setError("Lumina Engine: Failed to map execution trace. Please double-check your code's syntax or try a simpler example.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && steps.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed[0]);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length, playbackSpeed]);

  const nextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Code Visualization Engine</h1>
        <p className="text-muted-foreground">See how your code executes step-by-step with AI-powered insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code size={18} className="text-primary" />
                  Source Code
                </CardTitle>
                <select 
                  className="bg-secondary text-xs rounded px-2 py-1 outline-none border-none"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-black/30 border border-border/50 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Write your code here..."
              />
              <Button 
                className="w-full gap-2" 
                onClick={handleVisualize}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isLoading ? "Generating Trace..." : "Visualize Execution"}
              </Button>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 size={16} className="text-primary" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={prevStep} disabled={currentStepIdx === 0 || steps.length === 0}>
                  <ChevronLeft size={20} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={steps.length === 0}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={nextStep} disabled={currentStepIdx === steps.length - 1 || steps.length === 0}>
                  <ChevronRight size={20} />
                </Button>
                <Button variant="ghost" size="icon" onClick={reset} disabled={steps.length === 0}>
                  <RotateCcw size={20} />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Playback Speed</span>
                  <span>{playbackSpeed[0]}ms</span>
                </div>
                <Slider
                  value={playbackSpeed}
                  onValueChange={(val) => setPlaybackSpeed(val as number[])}
                  min={200}
                  max={3000}
                  step={100}
                  className="py-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Section */}
        <div className="lg:col-span-8 space-y-6 relative">
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md rounded-xl flex flex-col items-center justify-center gap-4 border border-primary/20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-primary">Analyzing Code</h3>
                  <p className="text-sm text-muted-foreground">Lumina is mapping the execution trace...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code View with Highlighting */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code size={16} className="text-primary" />
                  Execution Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 font-mono text-sm h-[400px] overflow-auto">
                <div className="relative">
                  {code.split('\n').map((line, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start px-4 py-0.5 transition-colors duration-200 ${
                        currentStep?.line === i + 1 ? 'bg-primary/20 border-l-4 border-primary' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <span className="w-8 text-muted-foreground text-right mr-4 select-none opacity-50">{i + 1}</span>
                      <span className="whitespace-pre">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Variables Panel */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cpu size={16} className="text-primary" />
                  Memory State
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-auto">
                <AnimatePresence mode="popLayout">
                  {currentStep?.variables && Object.keys(currentStep.variables).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(currentStep.variables).map(([key, value]) => (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 bg-secondary/30 rounded border border-border/50"
                        >
                          <span className="text-primary font-bold">{key}</span>
                          <motion.span 
                            key={JSON.stringify(value)}
                            initial={{ scale: 1.2, color: '#3b82f6' }}
                            animate={{ scale: 1, color: '#fff' }}
                            className="font-mono"
                          >
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                      No variables in scope
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Explanation Panel */}
            <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 min-h-[120px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm leading-relaxed"
                  >
                    {currentStep?.explanation || "Start the visualization to see step-by-step explanations."}
                  </motion.p>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Terminal size={16} className="text-primary" />
                  Console Output
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-xs bg-black/40 h-[120px] overflow-auto">
                {steps.slice(0, currentStepIdx + 1).map((s, i) => s.output && (
                  <div key={i} className="text-green-400 mb-1">{s.output}</div>
                ))}
                {(!currentStep || !steps.some(s => s.output)) && (
                  <span className="text-muted-foreground opacity-50">No output yet...</span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Call Stack Panel */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                Call Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {currentStep?.callStack && currentStep.callStack.length > 0 ? (
                    currentStep.callStack.map((frame, i) => (
                      <motion.div
                        key={`${frame}-${i}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="px-3 py-1 bg-primary/20 border border-primary/50 rounded text-xs font-mono flex items-center gap-2"
                      >
                        <span className="opacity-50">{i}</span>
                        {frame}
                      </motion.div>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Global Scope</span>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
