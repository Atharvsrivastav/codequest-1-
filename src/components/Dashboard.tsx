/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BookOpen, 
  Code, 
  Languages, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Target,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { useUserStore } from '../lib/store';

export default function Dashboard() {
  const { points, streak, badges } = useUserStore();
  const stats = [
    { label: 'Total Learning Time', value: '42h 15m', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Courses Completed', value: '8', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Current Accuracy', value: '88%', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Knowledge Points', value: points.toLocaleString(), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const recentActivity = [
    { title: 'Python Recursion', type: 'Programming', status: 'In Progress', progress: 65, icon: Code },
    { title: 'German Verb Conjugation', type: 'Language', status: 'Completed', progress: 100, icon: Languages },
    { title: 'Data Structures: Trees', type: 'DSA', status: 'In Progress', progress: 30, icon: BookOpen },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Neelam!</h1>
        <p className="text-muted-foreground">You've mastered 3 new concepts this week. Keep the momentum going!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentActivity.map((activity, i) => (
              <div key={activity.title} className="flex items-center gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <activity.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.title}</span>
                    <Badge variant={activity.progress === 100 ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={activity.progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground w-8">{activity.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Mistake Tracking</CardTitle>
            <CardDescription>Spaced repetition focus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <AlertCircle size={16} />
                <span>High Priority</span>
              </div>
              <p className="text-sm">You've struggled with <b>Binary Search Trees</b> recently. Would you like a quick review?</p>
              <Button variant="destructive" size="sm" className="w-full">Start Review</Button>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Weaknesses</div>
              {['Pointers in C++', 'French Subjunctive', 'Time Complexity'].map(w => (
                <div key={w} className="flex items-center justify-between text-sm p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                  <span>{w}</span>
                  <TrendingUp size={14} className="text-destructive rotate-45" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
            <CardDescription>Milestones you've achieved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center gap-2 p-4 bg-secondary/30 rounded-2xl w-32 text-center group hover:bg-primary/10 transition-colors">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {badge.icon === 'Zap' && <Zap size={24} />}
                    {badge.icon === 'Flame' && <Flame size={24} />}
                  </div>
                  <div className="font-bold text-xs">{badge.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{badge.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71 12 2v7.29H20L12 22v-7.29H4z" />
    </svg>
  )
}
