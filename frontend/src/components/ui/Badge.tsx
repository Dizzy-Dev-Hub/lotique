import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = 'default', size = 'md', className, pulse }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    gold: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-gold',
        className
      )}
    >
      {children}
    </span>
  );
}
