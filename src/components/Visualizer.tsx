/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Eye, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Code, Share2, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';

export default function Visualizer() {
  const [activeType, setActiveType] = useState<'code' | 'graph' | 'tree'>('graph');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Mock data for BFS visualization
  const graphData = {
    nodes: [
      { id: 'A', x: 100, y: 100 },
      { id: 'B', x: 250, y: 50 },
      { id: 'C', x: 250, y: 150 },
      { id: 'D', x: 400, y: 50 },
      { id: 'E', x: 400, y: 150 },
      { id: 'F', x: 550, y: 100 },
    ],
    links: [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'E' },
      { source: 'D', target: 'F' },
      { source: 'E', target: 'F' },
    ],
    steps: [
      { active: ['A'], visited: [] },
      { active: ['B', 'C'], visited: ['A'] },
      { active: ['D', 'E'], visited: ['A', 'B', 'C'] },
      { active: ['F'], visited: ['A', 'B', 'C', 'D', 'E'] },
      { active: [], visited: ['A', 'B', 'C', 'D', 'E', 'F'] },
    ]
  };

  useEffect(() => {
    if (!svgRef.current || activeType !== 'graph') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 650;
    const height = 200;

    const currentStep = graphData.steps[step] || graphData.steps[0];

    // Draw links
    svg.selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('x1', d => graphData.nodes.find(n => n.id === d.source)!.x)
      .attr('y1', d => graphData.nodes.find(n => n.id === d.source)!.y)
      .attr('x2', d => graphData.nodes.find(n => n.id === d.target)!.x)
      .attr('y2', d => graphData.nodes.find(n => n.id === d.target)!.y)
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Draw nodes
    const nodes = svg.selectAll('g')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        if (currentStep.active.includes(d.id)) return '#3b82f6'; // Primary
        if (currentStep.visited.includes(d.id)) return '#10b981'; // Success
        return '#1f2937'; // Secondary
      })
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 2)
      .style('transition', 'all 0.5s ease');

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text(d => d.id);

  }, [step, activeType]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStep(prev => (prev + 1) % graphData.steps.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Interactive Visualizer</h1>
        <p className="text-muted-foreground">See how algorithms and code work step-by-step.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {[
                  { id: 'graph', label: 'BFS Traversal', icon: Share2 },
                  { id: 'tree', label: 'Binary Tree DFS', icon: Eye },
                  { id: 'code', label: 'Recursion: Factorial', icon: Code },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeType === item.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setActiveType(item.id as any);
                      setStep(0);
                      setIsPlaying(false);
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info size={16} className="text-primary" />
                Current Step
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="font-bold mb-1">Queue:</div>
                <div className="flex gap-2">
                  {graphData.steps[step]?.active.map(id => (
                    <Badge key={id} variant="default">{id}</Badge>
                  )) || <span className="text-muted-foreground">Empty</span>}
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {step === 0 && "Start at node A. Add it to the queue."}
                {step === 1 && "Visit A. Explore its neighbors B and C. Add them to the queue."}
                {step === 2 && "Visit B and C. Explore their neighbors D and E. Add them to the queue."}
                {step === 3 && "Visit D and E. Explore neighbor F. Add it to the queue."}
                {step === 4 && "Visit F. All nodes visited. Traversal complete."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Visualization</Badge>
                <span className="text-sm font-medium">Breadth First Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep(prev => Math.max(0, prev - 1))}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setStep(prev => (prev + 1) % graphData.steps.length)}>
                  <ChevronRight size={20} />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <Button variant="ghost" size="icon" onClick={() => { setStep(0); setIsPlaying(false); }}>
                  <RotateCcw size={20} />
                </Button>
              </div>
            </div>
            <CardContent className="p-12 flex items-center justify-center min-h-[400px]">
              <svg ref={svgRef} width="650" height="200" className="overflow-visible" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Execution Trace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm bg-black/20 p-6 rounded-xl space-y-2 border border-white/5">
                <div className={step >= 0 ? 'text-primary' : 'text-muted-foreground opacity-50'}>1. queue = [A]</div>
                <div className={step >= 1 ? 'text-primary' : 'text-muted-foreground opacity-50'}>2. visit(A), queue = [B, C]</div>
                <div className={step >= 2 ? 'text-primary' : 'text-primary'}>
                  <span className={step === 2 ? 'bg-primary/20 px-1 rounded' : ''}>3. visit(B), visit(C), queue = [D, E]</span>
                </div>
                <div className={step >= 3 ? 'text-primary' : 'text-muted-foreground opacity-50'}>4. visit(D), visit(E), queue = [F]</div>
                <div className={step >= 4 ? 'text-primary' : 'text-muted-foreground opacity-50'}>5. visit(F), queue = []</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
