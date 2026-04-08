export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-[1.5px]',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-[rgba(255,255,255,0.1)] border-t-[var(--color-text-primary)] rounded-full animate-spin`}
      />
    </div>
  );
}
