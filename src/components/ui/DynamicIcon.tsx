import { icons, type LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

/**
 * Renders any Lucide icon by name string.
 * Allows nav config to reference icons as plain strings.
 */
export function DynamicIcon({ name, size = 16, ...props }: DynamicIconProps) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon size={size} {...props} />;
}
