interface BrokzLogoProps {
  size?: number;
  className?: string;
}

// Full logo — for footers, marketing pages
export function BrokzLogo({ size = 48, className = '' }: BrokzLogoProps) {
  return (
    <img
      src="/logo-nobg.png"
      alt="Brokz"
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  );
}

// Compact — for navbar
export function BrokzLogoCompact({ size = 48, className = '' }: BrokzLogoProps) {
  return (
    <img
      src="/logo-nobg.png"
      alt="Brokz"
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  );
}

// Standalone icon — favicons, avatars, app icons
export function BrokzIcon({ size = 40, className = '' }: BrokzLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Brokz"
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  );
}
