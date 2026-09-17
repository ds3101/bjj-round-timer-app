import { useState, useEffect } from 'react';
import { defaultConfigs, type TimerConfig } from './hooks/useTimer';
import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { Settings } from './components/Settings';

function App() {
  const [savedConfigs, setSavedConfigs] = useState<TimerConfig[]>(() => {
    const saved = localStorage.getItem('timer-saved-configs');
    return saved ? JSON.parse(saved) : defaultConfigs;
  });

  const [config, setConfig] = useState<TimerConfig>(() => {
    const saved = localStorage.getItem('timer-config');
    return saved ? JSON.parse(saved) : defaultConfigs[0];
  });
  
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('timer-accent-color') || '#ff2a2a';
  });

  const [textColor, setTextColor] = useState(() => {
    return localStorage.getItem('timer-text-color') || '#ffffff';
  });

  const [presetColors, setPresetColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('timer-preset-colors-v2');
    return saved ? JSON.parse(saved) : [
      '#ff2a2a', // red
      '#ffffff', // white
      '#2a84ff', // blue
      '#a855f7', // purple
      '#8b4513', // brown
    ];
  });
  
  const [bgColor, setBgColor] = useState(() => {
    return localStorage.getItem('timer-bg-color') || '#0f0f11';
  });

  const [timerScale, setTimerScale] = useState(() => {
    return Number(localStorage.getItem('timer-scale')) || 1;
  });

  const [orientation, setOrientation] = useState(() => {
    return Number(localStorage.getItem('timer-orientation')) || 0;
  });

  const [bgImageEnabled, setBgImageEnabled] = useState(() => {
    return localStorage.getItem('timer-bg-image-enabled') === 'true' || false;
  });

  const [bgImageUrl, setBgImageUrl] = useState<string | null>(() => {
    return localStorage.getItem('timer-bg-image-url') || null;
  });

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    phase,
    currentRound,
    timeLeft,
    isRunning,
    toggleTimer,
    resetTimer,
  } = useTimer({ config });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('timer-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('timer-saved-configs', JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  useEffect(() => {
    localStorage.setItem('timer-preset-colors-v2', JSON.stringify(presetColors));
  }, [presetColors]);

  useEffect(() => {
    localStorage.setItem('timer-accent-color', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('timer-text-color', textColor);
    document.documentElement.style.setProperty('--text-color', textColor);
  }, [textColor]);

  useEffect(() => {
    localStorage.setItem('timer-bg-color', bgColor);
    document.documentElement.style.setProperty('--bg-color', bgColor);
  }, [bgColor]);

  useEffect(() => {
    localStorage.setItem('timer-scale', timerScale.toString());
  }, [timerScale]);

  useEffect(() => {
    localStorage.setItem('timer-orientation', orientation.toString());
  }, [orientation]);

  useEffect(() => {
    localStorage.setItem('timer-bg-image-enabled', bgImageEnabled.toString());
  }, [bgImageEnabled]);

  useEffect(() => {
    if (bgImageUrl) {
      try {
        localStorage.setItem('timer-bg-image-url', bgImageUrl);
      } catch (e) {
        console.warn('Image too large for localStorage, not saving.');
      }
    } else {
      localStorage.removeItem('timer-bg-image-url');
    }
  }, [bgImageUrl]);

  const handleSaveConfig = (newConfig: TimerConfig) => {
    const index = savedConfigs.findIndex(c => c.id === newConfig.id);
    if (index >= 0) {
      const updated = [...savedConfigs];
      updated[index] = newConfig;
      setSavedConfigs(updated);
    } else {
      setSavedConfigs([...savedConfigs, newConfig]);
    }
    setConfig(newConfig);
  };

  const handleColorChange = (newColor: string) => {
    setAccentColor(newColor);
    const lowerNew = newColor.toLowerCase();
    const lowerPresets = presetColors.map(c => c.toLowerCase());
    if (!lowerPresets.includes(lowerNew)) {
      setPresetColors([lowerNew, ...presetColors.slice(0, 4)]);
    }
  };

  // Calculate total time for the current phase to pass to TimerDisplay
  let totalPhaseTime = 0;
  if (phase === 'WORK') totalPhaseTime = config.roundLength;
  if (phase === 'REST') totalPhaseTime = config.restLength;
  if (phase === 'PREPARATION') totalPhaseTime = 10;
  if (phase === 'DONE') totalPhaseTime = 1; // avoid divide by zero

  const solidWidthPercent = Math.min(50, 15 * timerScale);
  const stop1 = Math.max(0, 50 - solidWidthPercent);
  const stop2 = Math.min(100, 50 + solidWidthPercent);
  
  const fadeGradient = `linear-gradient(to bottom, transparent 0%, var(--bg-color) ${stop1}%, var(--bg-color) ${stop2}%, transparent 100%)`;

  const isLogicalVertical = orientation % 180 === 0 ? !isLandscape : isLandscape;
  const defaultBg = isLogicalVertical ? '/bg_vertical.jpg' : '/bg_horizontal.jpg';

  return (
    <div className="app-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      <div 
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: orientation % 180 === 0 ? '100vh' : '100vw',
          width: orientation % 180 === 0 ? '100vw' : '100vh',
          transform: `rotate(${orientation}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '40px 0',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {bgImageEnabled && (
          <>
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${bgImageUrl || defaultBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -2,
                transition: 'background-image 0.5s ease'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: fadeGradient,
                zIndex: -1
              }}
            />
          </>
        )}
        {/* Top: Preset Name */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10 }}>
          <span style={{ color: 'var(--text-color)', opacity: 0.5, letterSpacing: '4px', fontSize: '1rem', fontWeight: 600 }}>
            {config.name.toUpperCase()}
          </span>
        </div>

        {/* Center: Scaled Timer */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${timerScale})`, transition: 'transform 0.1s' }}>
            <TimerDisplay 
              timeLeft={timeLeft}
              totalTime={totalPhaseTime}
              phase={phase}
              currentRound={currentRound}
              totalRounds={config.totalRounds}
            />
          </div>
        </div>
        
        {/* Bottom: Controls */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 10 }}>
          <Controls 
            isRunning={isRunning}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Top Right Slider for Scale */}
      <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--panel-bg)', padding: '12px 24px', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid var(--panel-border)', zIndex: 10 }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 700 }}>SIZE</span>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.05" 
          value={timerScale}
          onChange={(e) => setTimerScale(Number(e.target.value))}
          style={{ width: '120px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
        />
      </div>

      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={config}
        onSelectConfig={setConfig}
        savedConfigs={savedConfigs}
        onSaveConfig={handleSaveConfig}
        onDeleteConfig={(id) => {
          if (savedConfigs.length <= 1) return; // Prevent deleting last config
          const newConfigs = savedConfigs.filter(c => c.id !== id);
          setSavedConfigs(newConfigs);
          if (config.id === id) setConfig(newConfigs[0]);
        }}
        onMoveConfigUp={(index) => {
          if (index === 0) return;
          const newConfigs = [...savedConfigs];
          [newConfigs[index - 1], newConfigs[index]] = [newConfigs[index], newConfigs[index - 1]];
          setSavedConfigs(newConfigs);
        }}
        onMoveConfigDown={(index) => {
          if (index === savedConfigs.length - 1) return;
          const newConfigs = [...savedConfigs];
          [newConfigs[index + 1], newConfigs[index]] = [newConfigs[index], newConfigs[index + 1]];
          setSavedConfigs(newConfigs);
        }}
        presetColors={presetColors}
        accentColor={accentColor}
        onChangeAccentColor={handleColorChange}
        textColor={textColor}
        onChangeTextColor={setTextColor}
        bgColor={bgColor}
        onChangeBgColor={setBgColor}
        orientation={orientation}
        onChangeOrientation={setOrientation}
        bgImageEnabled={bgImageEnabled}
        onChangeBgImageEnabled={setBgImageEnabled}
        bgImageUrl={bgImageUrl}
        onChangeBgImageUrl={setBgImageUrl}
      />
    </div>
  );
}

export default App;
