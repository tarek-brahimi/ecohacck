'use client';

import { useAuth } from '@/lib/auth-context';
import { getLeaderboard } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const leaderboard = getLeaderboard();
  const userRank = leaderboard.find(entry => entry.userId === user?.id);

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Climb the ranks and earn points by joining activities</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current User Stats */}
        {userRank && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold text-primary"># {userRank.rank}</p>
              </div>
              <div className="text-center border-l border-r border-border">
                <p className="text-sm text-muted-foreground">Your Points</p>
                <p className="text-3xl font-bold text-foreground">{userRank.points}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-3xl font-bold text-foreground">{userRank.activities}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === user?.id;
                  return (
                    <tr
                      key={entry.userId}
                      className={`${
                        isCurrentUser
                          ? 'bg-primary/5 border-l-4 border-l-primary'
                          : 'hover:bg-muted/50 transition'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          {getRankMedal(entry.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {entry.userName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-bold text-primary">{entry.points}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{entry.activities}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 p-6 bg-muted/50 border-dashed">
          <h3 className="font-semibold text-foreground mb-2">How does scoring work?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Join an activity:</span> Earn 100 points
            </li>
            <li>
              <span className="font-medium text-foreground">Complete an activity:</span> Earn bonus points based on difficulty
            </li>
            <li>
              <span className="font-medium text-foreground">Easy activities:</span> +50 bonus points
            </li>
            <li>
              <span className="font-medium text-foreground">Medium activities:</span> +100 bonus points
            </li>
            <li>
              <span className="font-medium text-foreground">Hard activities:</span> +200 bonus points
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
