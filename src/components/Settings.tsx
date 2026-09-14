import { useState, useEffect as import_react_useEffect } from 'react';
import type { TimerConfig } from '../hooks/useTimer';
import { X, Save, ArrowUp, ArrowDown, Copy } from 'lucide-react';

const getContrastYIQ = (hexcolor: string) => {
  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  const r = parseInt(hex.substr(0,2), 16) || 0;
  const g = parseInt(hex.substr(2,2), 16) || 0;
  const b = parseInt(hex.substr(4,2), 16) || 0;
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: TimerConfig;
  onSelectConfig: (config: TimerConfig) => void;
  savedConfigs: TimerConfig[];
  onSaveConfig: (config: TimerConfig) => void;
  onDeleteConfig: (id: string) => void;
  onMoveConfigUp: (index: number) => void;
  onMoveConfigDown: (index: number) => void;
  presetColors: string[];
  accentColor: string;
  onChangeAccentColor: (color: string) => void;
  textColor: string;
  onChangeTextColor: (color: string) => void;
  bgColor: string;
  onChangeBgColor: (color: string) => void;
  orientation: number;
  onChangeOrientation: (val: number) => void;
  bgImageEnabled: boolean;
  onChangeBgImageEnabled: (enabled: boolean) => void;
  bgImageUrl: string | null;
  onChangeBgImageUrl: (url: string | null) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSelectConfig,
  savedConfigs,
  onSaveConfig,
  onDeleteConfig,
  onMoveConfigUp,
  onMoveConfigDown,
  presetColors,
  accentColor,
  onChangeAccentColor,
  textColor,
  onChangeTextColor,
  bgColor,
  onChangeBgColor,
  orientation,
  onChangeOrientation,
  bgImageEnabled,
  onChangeBgImageEnabled,
  bgImageUrl,
  onChangeBgImageUrl
}) => {
  const [customRoundMin, setCustomRoundMin] = useState(Math.floor(currentConfig.roundLength / 60));
  const [customRoundSec, setCustomRoundSec] = useState(currentConfig.roundLength % 60);
  const [customRestMin, setCustomRestMin] = useState(Math.floor(currentConfig.restLength / 60));
  const [customRestSec, setCustomRestSec] = useState(currentConfig.restLength % 60);
  const [customRounds, setCustomRounds] = useState(currentConfig.totalRounds);
  const [customName, setCustomName] = useState('My Preset');
  const [tempAccentColor, setTempAccentColor] = useState(accentColor);
  const [activeTab, setActiveTab] = useState<'presets' | 'appearance'>('presets');

  // keep temp in sync if accent changes externally or from preset click
  import_react_useEffect(() => {
    setTempAccentColor(accentColor);
  }, [accentColor]);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    onSelectConfig({
      id: currentConfig.id,
      name: customName,
      roundLength: customRoundMin * 60 + customRoundSec,
      restLength: customRestMin * 60 + customRestSec,
      totalRounds: customRounds
    });
    onClose();
  };

  const handleSaveCustom = () => {
    onSaveConfig({
      id: currentConfig.id,
      name: customName,
      roundLength: customRoundMin * 60 + customRoundSec,
      restLength: customRestMin * 60 + customRestSec,
      totalRounds: customRounds
    });
  };

  const handleSaveAsNew = () => {
    onSaveConfig({
      id: 'custom-' + Date.now(),
      name: customName + ' (Copy)',
      roundLength: customRoundMin * 60 + customRoundSec,
      restLength: customRestMin * 60 + customRestSec,
      totalRounds: customRounds
    });
  };


  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        height: '100%',
        borderRadius: '24px 0 0 24px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Settings</h2>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', color: 'white' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs Header */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('presets')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: activeTab === 'presets' ? 'var(--panel-bg)' : 'transparent',
              color: activeTab === 'presets' ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              border: activeTab === 'presets' ? '1px solid var(--panel-border)' : '1px solid transparent',
            }}
          >
            Presets
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: activeTab === 'appearance' ? 'var(--panel-bg)' : 'transparent',
              color: activeTab === 'appearance' ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              border: activeTab === 'appearance' ? '1px solid var(--panel-border)' : '1px solid transparent',
            }}
          >
            Appearance
          </button>
        </div>

        {activeTab === 'presets' && (
          <>
            {/* Presets */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', opacity: 0.8, textTransform: 'uppercase' }}>Saved Presets</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedConfigs.map((c, index) => (
                  <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        onSelectConfig(c);
                        setCustomRoundMin(Math.floor(c.roundLength / 60));
                        setCustomRoundSec(c.roundLength % 60);
                        setCustomRestMin(Math.floor(c.restLength / 60));
                        setCustomRestSec(c.restLength % 60);
                        setCustomRounds(c.totalRounds);
                        setCustomName(c.name);
                      }}
                      style={{
                        flex: 1,
                        background: currentConfig.id === c.id ? 'var(--accent-color)' : 'var(--panel-bg)',
                        border: `1px solid ${currentConfig.id === c.id ? 'transparent' : 'var(--panel-border)'}`,
                        color: currentConfig.id === c.id ? getContrastYIQ(accentColor) : 'var(--text-color)',
                        padding: '12px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      {c.name}
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button onClick={() => onMoveConfigUp(index)} disabled={index === 0} style={{ padding: '2px 4px', background: 'var(--panel-bg)', borderRadius: '4px', border: 'none', color: 'white', opacity: index === 0 ? 0.3 : 1 }}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => onMoveConfigDown(index)} disabled={index === savedConfigs.length - 1} style={{ padding: '2px 4px', background: 'var(--panel-bg)', borderRadius: '4px', border: 'none', color: 'white', opacity: index === savedConfigs.length - 1 ? 0.3 : 1 }}>
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => onDeleteConfig(c.id)}
                      disabled={savedConfigs.length <= 1}
                      style={{ padding: '8px', background: 'var(--panel-bg)', borderRadius: '8px', border: 'none', color: '#ff4444', opacity: savedConfigs.length <= 1 ? 0.3 : 1 }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Timer */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', opacity: 0.8, textTransform: 'uppercase' }}>Custom Timer</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Name</span>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    style={{ width: '130px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Round Length</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      value={customRoundMin}
                      onChange={e => setCustomRoundMin(Number(e.target.value))}
                      style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                    /> m
                    <input 
                      type="number" 
                      value={customRoundSec}
                      onChange={e => setCustomRoundSec(Number(e.target.value))}
                      style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                    /> s
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Rest Length</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      value={customRestMin}
                      onChange={e => setCustomRestMin(Number(e.target.value))}
                      style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                    /> m
                    <input 
                      type="number" 
                      value={customRestSec}
                      onChange={e => setCustomRestSec(Number(e.target.value))}
                      style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                    /> s
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Total Rounds</span>
                  <input 
                    type="number" 
                    value={customRounds}
                    onChange={e => setCustomRounds(Number(e.target.value))}
                    style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'var(--bg-color)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    onClick={handleApplyCustom}
                    style={{
                      flex: 1,
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--panel-border)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 600
                    }}
                  >
                    Use
                  </button>
                  <button 
                    onClick={handleSaveCustom}
                    style={{
                      flex: 1,
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--panel-border)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600
                    }}
                  >
                    <Save size={18} /> Update
                  </button>
                  <button 
                    onClick={handleSaveAsNew}
                    style={{
                      flex: 1,
                      background: 'var(--accent-color)',
                      border: 'none',
                      color: getContrastYIQ(accentColor),
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <Copy size={18} /> Save As New
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', opacity: 0.8, textTransform: 'uppercase' }}>Theme Colors</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <span style={{ display: 'block', marginBottom: '8px' }}>Accent Color</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {presetColors.map(color => (
                  <button
                    key={color}
                    onClick={() => onChangeAccentColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: accentColor.toLowerCase() === color.toLowerCase() ? '2px solid white' : 'none',
                      boxShadow: accentColor.toLowerCase() === color.toLowerCase() ? `0 0 12px ${color}` : 'none'
                    }}
                  />
                ))}
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                  <input 
                    type="color" 
                    value={tempAccentColor}
                    onChange={e => setTempAccentColor(e.target.value)}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <button 
                    onClick={() => onChangeAccentColor(tempAccentColor)}
                    style={{ padding: '6px 12px', background: 'var(--panel-bg)', borderRadius: '8px', color: 'white', border: '1px solid var(--panel-border)' }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <span style={{ display: 'block', marginBottom: '8px' }}>Text Color</span>
              <input 
                type="color" 
                value={textColor}
                onChange={e => onChangeTextColor(e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'var(--panel-bg)' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ display: 'block', marginBottom: '8px' }}>Background Color</span>
              <input 
                type="color" 
                value={bgColor}
                onChange={e => onChangeBgColor(e.target.value)}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'var(--panel-bg)' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ display: 'block', marginBottom: '8px' }}>Orientation</span>
              <button 
                onClick={() => onChangeOrientation((orientation + 90) % 360)}
                style={{ width: '100%', padding: '12px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'white', fontWeight: 600 }}
              >
                Rotate 90° (Current: {orientation}°)
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '24px 0' }} />

            <h3 style={{ fontSize: '1rem', marginBottom: '16px', opacity: 0.8, textTransform: 'uppercase' }}>Background Image</h3>
            
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Enable Background</span>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={bgImageEnabled}
                  onChange={(e) => onChangeBgImageEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                />
              </label>
            </div>

            {bgImageEnabled && (
              <div>
                <span style={{ display: 'block', marginBottom: '8px' }}>Custom Image</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: 'var(--panel-bg)', 
                      border: '1px dashed var(--panel-border)', 
                      borderRadius: '8px', 
                      color: 'white', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      fontWeight: 600 
                    }}
                  >
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              onChangeBgImageUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {(bgImageUrl !== null && bgImageUrl !== '/default_bg.jpg') && (
                    <button 
                      onClick={() => onChangeBgImageUrl(null)}
                      style={{ padding: '12px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: '#ff4444' }}
                      title="Reset to default"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
