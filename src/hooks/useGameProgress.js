import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const GAME_TARGETS = {
  'block-blast': 20000,
  'flappy_drone': 100,
  'shoot-em-up': 2500000
};

export const useGameProgress = (userId) => {
  const [progress, setProgress] = useState({
    'block-blast': 0,
    'flappy_drone': 0,
    'shoot-em-up': 0
  });
  const [loading, setLoading] = useState(true);
  const [isAllGamesPassed, setIsAllGamesPassed] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('game_slug, score')
          .eq('user_id', userId);

        if (error) throw error;

        const newProgress = {
          'block-blast': 0,
          'flappy_drone': 0,
          'shoot-em-up': 0
        };

        if (data && data.length > 0) {
          data.forEach(row => {
            if (newProgress[row.game_slug] !== undefined) {
              // Keep the highest score if multiple exist
              if (row.score > newProgress[row.game_slug]) {
                newProgress[row.game_slug] = row.score;
              }
            }
          });
        }

        setProgress(newProgress);
        
        // Check if all targets are met
        const passed = 
          newProgress['block-blast'] >= GAME_TARGETS['block-blast'] &&
          newProgress['flappy_drone'] >= GAME_TARGETS['flappy_drone'] &&
          newProgress['shoot-em-up'] >= GAME_TARGETS['shoot-em-up'];
          
        setIsAllGamesPassed(passed);
      } catch (err) {
        console.error("Error fetching game progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return { progress, loading, isAllGamesPassed };
};
