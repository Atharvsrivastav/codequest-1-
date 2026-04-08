/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Crown, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { LeaderboardEntry } from '../types';

export default function Leaderboard() {
  const leaderboard: LeaderboardEntry[] = [
    { userId: '1', name: 'Sarah Chen', points: 4850, streak: 24, avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { userId: '2', name: 'Alex Rivera', points: 4200, streak: 15, avatar: 'https://picsum.photos/seed/alex/100/100' },
    { userId: '3', name: 'Neelam Kaushik', points: 2450, streak: 12, avatar: 'https://picsum.photos/seed/neelam/100/100' },
    { userId: '4', name: 'James Wilson', points: 2100, streak: 8, avatar: 'https://picsum.photos/seed/james/100/100' },
    { userId: '5', name: 'Elena Petrova', points: 1950, streak: 5, avatar: 'https://picsum.photos/seed/elena/100/100' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground">Compete with learners worldwide and climb the ranks!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboard.slice(0, 3).map((user, i) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative overflow-hidden border-none ${
              i === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 ring-2 ring-yellow-500/50' : 
              i === 1 ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/5 ring-2 ring-slate-400/50' : 
              'bg-gradient-to-br from-orange-400/20 to-orange-500/5 ring-2 ring-orange-400/50'
            }`}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative inline-block">
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-background shadow-xl" referrerPolicy="no-referrer" />
                  <div className="absolute -top-2 -right-2">
                    {i === 0 && <Crown className="text-yellow-500 w-8 h-8 drop-shadow-lg" />}
                    {i === 1 && <Medal className="text-slate-400 w-8 h-8 drop-shadow-lg" />}
                    {i === 2 && <Medal className="text-orange-400 w-8 h-8 drop-shadow-lg" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.points.toLocaleString()} pts</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-orange-500 font-bold">
                  <Flame size={16} />
                  <span>{user.streak} day streak</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {leaderboard.map((user, i) => (
              <div key={user.userId} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <div className="w-8 text-center font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    {user.name}
                    {user.userId === '3' && <Badge variant="secondary" className="text-[10px] h-4">You</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><Trophy size={12} className="text-yellow-500" /> {user.points} pts</span>
                    <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {user.streak} days</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-500 flex items-center gap-1">
                    <TrendingUp size={14} />
                    +12%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
