import { Play, Pause, Square, Settings2 } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  onOpenSettings: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  toggleTimer,
  resetTimer,
  onOpenSettings
}) => {
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '40px' }}>
      <button 
        onClick={resetTimer}
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-color)',
        }}
      >
        <Square size={24} />
      </button>

      <button 
        onClick={toggleTimer}
        style={{
          background: 'var(--accent-color)',
          border: 'none',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(255, 42, 42, 0.3)', // Default red glow, could be dynamic
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        {isRunning ? <Pause size={36} /> : <Play size={36} style={{ marginLeft: '4px' }} />}
      </button>

      <button 
        onClick={onOpenSettings}
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-color)',
        }}
      >
        <Settings2 size={24} />
      </button>
    </div>
  );
};
