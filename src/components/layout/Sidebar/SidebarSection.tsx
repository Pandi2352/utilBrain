import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavSection as NavSectionType } from '../../../types/navigation';
import SidebarItem from './SidebarItem';

interface SidebarSectionProps {
  section: NavSectionType;
  collapsed: boolean;
  isExpanded: boolean;
  expandedItems: (id: string) => boolean;
  onToggleSection: (id: string) => void;
  onToggleItem: (id: string) => void;
}

const SidebarSection = memo(function SidebarSection({
  section,
  collapsed,
  isExpanded,
  expandedItems,
  onToggleSection,
  onToggleItem,
}: SidebarSectionProps) {
  /* The 'main' section (Home) has no title — render items directly, always visible */
  const isMainSection = section.id === 'main' || !section.title;

  if (isMainSection) {
    return (
      <div style={{ marginBottom: 4 }}>
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              isExpanded={expandedItems(item.id)}
              onToggle={onToggleItem}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Section label — clickable to expand/collapse, hidden when sidebar collapsed */}
      {!collapsed ? (
        <button
          onClick={() => onToggleSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '6px 10px',
            marginBottom: 1,
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            color: 'var(--sb-section-label)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'color 150ms',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--sb-section-label)')}
        >
          <span>{section.title}</span>
          <ChevronDown
            size={11}
            style={{
              flexShrink: 0,
              color: 'var(--sb-section-label)',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 200ms',
            }}
          />
        </button>
      ) : (
        /* Collapsed: show a small divider between sections */
        <div style={{ height: 1, background: 'var(--sb-border)', margin: '4px 8px' }} />
      )}

      {/* Items list */}
      {(isExpanded || collapsed) && (
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {section.items.map(item => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              isExpanded={expandedItems(item.id)}
              onToggle={onToggleItem}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

export default SidebarSection;
