/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Zap, Upload, Link as LinkIcon, FileText, Youtube, Sparkles, Loader2, ChevronRight, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { geminiService } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function FastLearning() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; keyPoints: string[] } | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const res = await geminiService.summarizeContent(input);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fast Learning Mode</h1>
        <p className="text-muted-foreground">Upload any source and Lumina will distill it into a summary and key points.</p>
      </div>

      {!result ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
                <TabsTrigger value="text" className="gap-2"><FileText size={16} /> Text</TabsTrigger>
                <TabsTrigger value="url" className="gap-2"><LinkIcon size={16} /> URL</TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2"><Upload size={16} /> PDF</TabsTrigger>
                <TabsTrigger value="youtube" className="gap-2"><Youtube size={16} /> YouTube</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="text" className="space-y-4">
                  <textarea
                    placeholder="Paste your text here..."
                    className="w-full min-h-[200px] p-4 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary outline-none resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <Input placeholder="Enter article URL..." className="h-12 bg-secondary/30 border-none" />
                </TabsContent>
                <TabsContent value="pdf" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT (max 10MB)</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="youtube" className="space-y-4">
                  <Input placeholder="Enter YouTube video URL..." className="h-12 bg-secondary/30 border-none" />
                </TabsContent>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleProcess} 
              className="w-full h-12 text-lg gap-2" 
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing Source...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Start Fast Learning
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setResult(null)} className="gap-2">
              <ChevronRight size={18} className="rotate-180" />
              Back to Upload
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Brain size={16} />
                Generate Mind Map
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Zap size={16} />
                Create Quiz
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Key Learning Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.keyPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 p-3 bg-secondary/30 rounded-xl text-sm"
                    >
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <span>{point}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <div className="font-bold">Ready to test yourself?</div>
                  <p className="text-sm text-muted-foreground">Take a quick quiz based on this summary to lock in your knowledge.</p>
                  <Button className="w-full">Start Topic Quiz</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
