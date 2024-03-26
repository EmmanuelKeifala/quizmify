import {prisma} from '@/lib/db';
import {Clock, CopyCheck, Edit2} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

type Props = {
  limit: number;
  userId: string;
};

const IncompleteGames = async ({limit, userId}: Props) => {
  const games = await prisma.game.findMany({
    take: limit,
    where: {
      userId,
      timeEnded: null, // fetch all the games that are not completed
    },
    orderBy: {
      timeStarted: 'desc',
    },
  });
  return (
    <div className="space-y-8">
      {games.map(game => {
        return (
          <div className="flex items-center justify-between" key={game.id}>
            <div className="flex items-center">
              {game.gameType === 'mcq' ? (
                <CopyCheck className="mr-3" />
              ) : (
                <Edit2 className="mr-3" />
              )}
              <div className="ml-4 space-y-1">
                // Redirect them to go and complete the game
                <Link
                  className="text-base font-medium leading-none underline"
                  href={`/play/${game.gameType}/${game.id}`}>
                  {game.topic}
                  <span className="text-muted-foreground">Incomplete</span>
                </Link>
                <p className="flex items-center px-2 py-1 text-xs text-white rounded-lg w-fit bg-slate-800">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(game.timeEnded ?? 0).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {game.gameType === 'mcq' ? 'Multiple Choice' : 'Open-Ended'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncompleteGames;
