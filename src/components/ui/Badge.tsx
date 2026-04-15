import type { BadgeVariant } from '../../types/navigation';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; color: string }> = {
  new:   { bg: '#dcfce7', color: '#15803d' },
  beta:  { bg: '#ede9fe', color: '#6d28d9' },
  pro:   { bg: '#fef3c7', color: '#b45309' },
  count: { bg: '#fee2e2', color: '#b91c1c' },
};

export function Badge({ label, variant }: BadgeProps) {
  const { bg, color } = variantColors[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 1,
        borderRadius: 4,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
