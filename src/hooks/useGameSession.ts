import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SaveGameSessionParams {
  puzzleId: number;
  difficulty: string;
  mistakes: number;
  timeSpent: number;
  completed: boolean;
  boardState?: any;
  score?: number;
}

export function useGameSession() {
  const { user } = useAuth();

  const saveGameSession = useCallback(async (params: SaveGameSessionParams) => {
    if (!user) {
      console.warn('Cannot save game session: user not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/game-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to save game session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  }, [user]);

  const getGameSessions = useCallback(async (limit = 10) => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetch(`/api/game-session?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to get game sessions');
      }

      const data = await response.json();
      return data.sessions;
    } catch (error) {
      console.error('Error getting game sessions:', error);
      return null;
    }
  }, [user]);

  const getStats = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to get stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }, [user]);

  return {
    saveGameSession,
    getGameSessions,
    getStats,
  };
}
