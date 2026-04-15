import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavItem } from '../../../types/navigation';
import { Badge } from '../../ui/Badge';
import { DynamicIcon } from '../../ui/DynamicIcon';

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
}

/* ── Shared base item style ── */
const baseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  width: '100%',
  padding: '6px 10px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 450,
  textDecoration: 'none',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: 'var(--sb-text)',
  transition: 'background 150ms, color 150ms',
  whiteSpace: 'nowrap',
  textAlign: 'left' as const,
};

const SidebarItem = memo(function SidebarItem({
  item,
  collapsed,
  depth = 0,
  isExpanded = false,
  onToggle,
}: SidebarItemProps) {
  const hasChildren = !!item.children?.length;
  const paddingLeft = depth === 1 ? 28 : 10;

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    color: 'var(--sb-muted)',
    transition: 'color 150ms',
  };

  function handleHover(el: HTMLElement, enter: boolean) {
    el.style.background = enter ? 'var(--sb-hover)' : 'transparent';
  }

  /* ── Parent accordion button ── */
  if (hasChildren) {
    return (
      <li style={{ listStyle: 'none' }}>
        <button
          onClick={() => onToggle?.(item.id)}
          disabled={item.disabled}
          aria-expanded={isExpanded}
          title={collapsed ? item.label : undefined}
          style={{
            ...baseStyle,
            paddingLeft,
            background: isExpanded ? 'var(--sb-hover)' : 'transparent',
            color: isExpanded ? 'var(--sb-active-text)' : 'var(--sb-text)',
            opacity: item.disabled ? 0.4 : 1,
          }}
          onMouseEnter={e => handleHover(e.currentTarget, true)}
          onMouseLeave={e => handleHover(e.currentTarget, !isExpanded)}
        >
          <span style={iconStyle}>
            <DynamicIcon name={item.icon} size={16} />
          </span>

          {!collapsed && (
            <>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
              {item.badge && (
                <Badge label={item.badge.label} variant={item.badge.variant} />
              )}
              <ChevronDown
                size={13}
                style={{
                  marginLeft: 'auto',
                  flexShrink: 0,
                  color: 'var(--sb-muted)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms',
                }}
              />
            </>
          )}
        </button>

        {/* Sub-items */}
        {isExpanded && !collapsed && (
          <ul style={{ margin: '2px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {item.children!.map(child => (
              <SidebarItem
                key={child.id}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /* ── Leaf NavLink ── */
  return (
    <li style={{ listStyle: 'none' }}>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        title={collapsed ? item.label : undefined}
        style={({ isActive }) => ({
          ...baseStyle,
          paddingLeft,
          background: isActive ? 'var(--sb-active-bg)' : 'transparent',
          color: isActive ? 'var(--sb-active-text)' : 'var(--sb-text)',
          fontWeight: isActive ? 600 : 450,
          pointerEvents: item.disabled ? 'none' : 'auto',
          opacity: item.disabled ? 0.4 : 1,
        })}
        onMouseEnter={e => {
          if (!(e.currentTarget as HTMLAnchorElement).classList.contains('active'))
            handleHover(e.currentTarget as HTMLElement, true);
        }}
        onMouseLeave={e => {
          if (!(e.currentTarget as HTMLAnchorElement).classList.contains('active'))
            handleHover(e.currentTarget as HTMLElement, false);
        }}
      >
        {({ isActive }) => (
          <>
            <span style={{ ...iconStyle, color: isActive ? 'var(--sb-active-text)' : 'var(--sb-muted)' }}>
              <DynamicIcon name={item.icon} size={16} />
            </span>
            {!collapsed && (
              <>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge label={item.badge.label} variant={item.badge.variant} />
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
});

export default SidebarItem;
