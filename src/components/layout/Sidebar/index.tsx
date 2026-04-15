import { useState, useMemo } from 'react';
import { useSidebar } from '../../../hooks/useSidebar';
import { NAV_SECTIONS, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../../constants/navigation';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import SidebarSection from './SidebarSection';
import { SidebarFooter } from './SidebarFooter';

export function Sidebar() {
  const {
    collapsed,
    toggleSidebar,
    toggleSection,
    toggleItem,
    isSectionExpanded,
    isItemExpanded,
  } = useSidebar();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SECTIONS;

    const query = searchQuery.toLowerCase();
    return NAV_SECTIONS.map(section => {
      const filteredItems = section.items.filter(item => 
        item.label.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query)
      );

      if (filteredItems.length > 0) {
        return { ...section, items: filteredItems };
      }
      return null;
    }).filter(Boolean) as typeof NAV_SECTIONS;
  }, [searchQuery]);

  return (
    <aside
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        background: 'var(--sb-bg)',
        borderRight: '1px solid var(--sb-border)',
        transition: 'width 250ms ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* Header */}
      <SidebarHeader collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Search */}
      <SidebarSearch collapsed={collapsed} value={searchQuery} onChange={setSearchQuery} />

      {/* Scrollable nav */}
      <nav
        className="sidebar-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '4px 8px',
        }}
        aria-label="Main navigation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredSections.length > 0 ? (
            filteredSections.map(section => (
              <SidebarSection
                key={section.id}
                section={section}
                collapsed={collapsed}
                isExpanded={searchQuery ? true : isSectionExpanded(section.id)}
                expandedItems={isItemExpanded}
                onToggleSection={toggleSection}
                onToggleItem={toggleItem}
              />
            ))
          ) : (
            <div style={{ padding: '20px 10px', textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: 11, color: 'var(--sb-muted)', fontWeight: 600 }}>No tools found...</p>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}

export default Sidebar;
