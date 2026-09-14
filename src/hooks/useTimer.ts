import { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';

export type TimerPhase = 'PREPARATION' | 'WORK' | 'REST' | 'DONE';

export interface TimerConfig {
  id: string;
  name: string;
  roundLength: number; // seconds
  restLength: number; // seconds
  totalRounds: number;
}

export const defaultConfigs: TimerConfig[] = [
  { id: 'mma', name: 'MMA Pro', roundLength: 300, restLength: 60, totalRounds: 3 },
  { id: 'boxing', name: 'Boxing Pro', roundLength: 180, restLength: 60, totalRounds: 12 },
  { id: 'bjj', name: 'BJJ', roundLength: 300, restLength: 60, totalRounds: 5 },
  { id: 'custom', name: 'Custom', roundLength: 60, restLength: 15, totalRounds: 3 },
];

interface UseTimerProps {
  config: TimerConfig;
}

export function useTimer({ config }: UseTimerProps) {
  const [phase, setPhase] = useState<TimerPhase>('PREPARATION');
  const [currentRound, setCurrentRound] = useState(1);
  
  // Time remaining in current phase (in seconds)
  const [timeLeft, setTimeLeft] = useState(10); // 10s prep time
  const [isRunning, setIsRunning] = useState(false);
  
  const endTimeRef = useRef<number | null>(null);
  const pausedTimeLeftRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const lastPlayedSecondRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setPhase('PREPARATION');
    setCurrentRound(1);
    setTimeLeft(10);
    endTimeRef.current = null;
    pausedTimeLeftRef.current = null;
    lastPlayedSecondRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const changePhase = useCallback((newPhase: TimerPhase, round: number) => {
    setPhase(newPhase);
    setCurrentRound(round);
    lastPlayedSecondRef.current = null;
    
    let duration = 0;
    if (newPhase === 'WORK') duration = config.roundLength;
    if (newPhase === 'REST') duration = config.restLength;
    if (newPhase === 'PREPARATION') duration = 10;
    
    setTimeLeft(duration);
    if (isRunning) {
      endTimeRef.current = Date.now() + duration * 1000;
    } else {
      pausedTimeLeftRef.current = duration;
    }
  }, [config, isRunning]);

  const toggleTimer = () => {
    // Initialize audio engine on first user interaction to satisfy browser policies
    audioEngine.init();

    if (phase === 'DONE') {
      resetTimer();
      // We don't auto-start here, let user press play again
      return;
    }

    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (endTimeRef.current) {
        pausedTimeLeftRef.current = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
      }
      endTimeRef.current = null;
    } else {
      // Start or Resume
      setIsRunning(true);
      if (pausedTimeLeftRef.current !== null) {
        endTimeRef.current = Date.now() + pausedTimeLeftRef.current * 1000;
      } else {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      pausedTimeLeftRef.current = null;
    }
  };

  useEffect(() => {
    // When config changes, reset if not running, or adjust if needed.
    // For simplicity, we just reset the timer if config changes.
    resetTimer();
  }, [config, resetTimer]);

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const tick = () => {
      if (!endTimeRef.current) return;
      
      const now = Date.now();
      const remainingMs = endTimeRef.current - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      
      setTimeLeft(remainingSeconds);

      // Trigger sounds exactly once per second boundary
      if (lastPlayedSecondRef.current !== remainingSeconds) {
        lastPlayedSecondRef.current = remainingSeconds;
        
        // Countdown 3, 2, 1 beeps for all phases
        if (remainingSeconds <= 3 && remainingSeconds > 0) {
          audioEngine.playCountdownBeep();
        }
      }

      if (remainingMs <= 0) {
        // Play the long beep when ANY phase ends
        audioEngine.playStartBeep();
        
        // Phase transition
        if (phase === 'PREPARATION') {
          changePhase('WORK', currentRound);
        } else if (phase === 'WORK') {
          if (currentRound >= config.totalRounds) {
            setPhase('DONE');
            setIsRunning(false);
            setTimeLeft(0);
            return;
          } else {
            changePhase('REST', currentRound);
          }
        } else if (phase === 'REST') {
          changePhase('WORK', currentRound + 1);
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, phase, currentRound, config, changePhase]);

  return {
    phase,
    currentRound,
    timeLeft,
    isRunning,
    toggleTimer,
    resetTimer,
  };
}
