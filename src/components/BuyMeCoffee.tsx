import { useState } from 'react';

export function BuyMeCoffee() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-color)',
          opacity: 0.3,
          fontSize: '0.8rem',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'opacity 0.2s',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
      >
        Buy Me A Coffee
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'var(--panel-bg, #1a1a1a)',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid var(--panel-border, #333)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            minWidth: '300px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.2rem' }}>Buy Me A Coffee</h2>
            
            <p style={{ margin: 0, color: 'var(--text-color)', opacity: 0.9, fontSize: '1.1rem' }}>
              Suggested Donation: $5
            </p>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'transparent' }}>
              <img src="./cashapp-qr.png" alt="Cash App QR Code" style={{ width: '200px', height: 'auto', borderRadius: '12px' }} />
            </div>
            
            <p style={{ margin: 0, color: 'var(--text-color)', opacity: 0.7, fontSize: '0.9rem' }}>
              Scan with your phone's camera
            </p>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginTop: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'var(--text-color)',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
