interface SectionDividerProps {
  variant?: 'gradient' | 'dots';
  className?: string;
}

export default function SectionDivider({ variant = 'gradient', className = '' }: SectionDividerProps) {
  if (variant === 'dots') {
    return (
      <div className={`flex justify-center gap-2 py-6 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-brand/30" />
        <span className="w-1.5 h-1.5 rounded-full bg-brand/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-brand/30" />
      </div>
    );
  }

  return <div className={`section-divider ${className}`} />;
}
