import type { TimerPhase } from '../hooks/useTimer';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number; // to calculate progress
  phase: TimerPhase;
  currentRound: number;
  totalRounds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeLeft,
  totalTime,
  phase,
  currentRound,
  totalRounds,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // SVG Circle properties
  const radius = 220;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let phaseColor = 'var(--accent-color)';
  if (phase === 'REST') phaseColor = 'var(--rest-accent)';
  if (phase === 'PREPARATION') phaseColor = '#f5a623'; // Orange for prep
  if (phase === 'DONE') phaseColor = '#4caf50'; // Green for done

  return (
    <div className="timer-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '540px', height: '540px' }}>
      
      {/* Background Circle */}
      <svg width="540" height="540" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle
          cx="270"
          cy="270"
          r={radius}
          fill="none"
          stroke="var(--panel-border)"
          strokeWidth="16"
        />
        {/* Progress Circle */}
        <circle
          cx="270"
          cy="270"
          r={radius}
          fill="none"
          stroke={phaseColor}
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 16px ${phaseColor})`
          }}
        />
      </svg>

      <div className="timer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <span className="phase-text" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '4px', color: phaseColor, textTransform: 'uppercase', marginBottom: '8px' }}>
          {phase === 'DONE' ? 'FINISHED' : phase}
        </span>
        <span className="time-text" style={{ fontSize: '7rem', fontWeight: 900, lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.8)', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </span>
        <span className="round-text" style={{ fontSize: '1.5rem', marginTop: '16px', opacity: 0.8, fontWeight: 500, letterSpacing: '2px' }}>
          {phase === 'DONE' ? '-' : `ROUND ${currentRound} / ${totalRounds}`}
        </span>
      </div>
    </div>
  );
};
