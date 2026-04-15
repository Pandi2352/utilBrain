import { useLocation } from 'react-router-dom';
import { Shield, Cpu, Zap } from 'lucide-react';
import { useMemo } from 'react';

export function SecurityIndicator() {
  const { pathname } = useLocation();

  const status = useMemo(() => {
    if (pathname === '/' || pathname === '/home') {
      return { 
        id: 'STANDBY',
        color: 'var(--border)', 
        label: 'SYSTEM STANDBY', 
        icon: Zap,
        pulse: false 
      };
    }
    
    const isAI = pathname.includes('/caption') || pathname.includes('/summarizer');
    
    if (isAI) {
      return { 
        id: 'AI',
        color: '#4f6bed', 
        label: 'NEURAL TUNNEL OPEN (GEMINI)', 
        icon: Cpu,
        pulse: true 
      };
    }

    return { 
      id: 'LOCAL',
      color: '#10b981', 
      label: 'SECURE: LOCAL EXECUTION ONLY', 
      icon: Shield,
      pulse: '0 0 10px rgba(16, 185, 129, 0.2)' 
    };
  }, [pathname]);

  return (
    <>
      {/* Global Pulsing Border */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        border: `1.5px solid ${status.color}`,
        transition: 'all 500ms ease',
        opacity: status.id === 'STANDBY' ? 0.2 : 0.6,
        animation: status.pulse ? 'security-pulse 2s infinite ease-in-out' : 'none'
      }} />

      {/* Security Status Label (Bottom Right) */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        background: 'var(--bg-surface)',
        border: `1.5px solid ${status.color}`,
        borderRadius: 8,
        pointerEvents: 'none',
        transition: 'all 300ms ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          color: status.color, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          animation: status.pulse ? 'security-glow 2s infinite ease-in-out' : 'none'
        }}>
          <status.icon size={14} />
        </div>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 900, 
          color: 'var(--text-primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em' 
        }}>
          {status.label}
        </span>
      </div>

      <style>{`
        @keyframes security-pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes security-glow {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
