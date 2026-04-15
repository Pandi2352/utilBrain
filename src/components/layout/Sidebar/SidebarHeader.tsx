import { PanelLeftClose, PanelLeftOpen, Brain } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 56,
        padding: '0 12px',
        flexShrink: 0,
        borderBottom: '1px solid var(--sb-border)',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
      }}
    >
      {/* Logo mark — always visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--brand)',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <Brain size={15} />
      </div>

      {/* Brand wordmark — hidden when collapsed */}
      {!collapsed && (
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '-0.3px',
            color: 'var(--sb-text)',
            whiteSpace: 'nowrap',
          }}
        >
          util<span style={{ color: 'var(--brand)' }}>Brain</span>
        </span>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          color: 'var(--sb-muted)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--sb-hover)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--sb-muted)';
        }}
      >
        {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
      </button>
    </div>
  );
}
