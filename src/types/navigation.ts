export type BadgeVariant = 'new' | 'beta' | 'pro' | 'count';

export interface NavBadge {
  label: string;
  variant: BadgeVariant;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;           // Lucide icon name
  path: string;
  badge?: NavBadge;
  children?: NavItem[];   // Sub-items (1 level deep)
  disabled?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}
