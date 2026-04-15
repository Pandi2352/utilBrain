import { useState, useCallback } from 'react';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Only 'main' and 'finance' open by default — others collapsed
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(['main', 'finance']),
  );

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSidebar  = useCallback(() => setCollapsed(p => !p), []);

  const toggleSection  = useCallback((id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isSectionExpanded = useCallback((id: string) => expandedSections.has(id), [expandedSections]);
  const isItemExpanded    = useCallback((id: string) => expandedItems.has(id), [expandedItems]);

  return { collapsed, toggleSidebar, toggleSection, toggleItem, isSectionExpanded, isItemExpanded };
}
