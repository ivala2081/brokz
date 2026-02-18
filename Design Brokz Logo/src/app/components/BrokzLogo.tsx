interface BrokzLogoProps {
  size?: number;
  className?: string;
}

export function BrokzLogo({ size = 200, className = '' }: BrokzLogoProps) {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`} style={{ height: size }}>
      {/* Modern minimal icon */}
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: size * 0.4,
          height: size * 0.4,
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Modern abstract chart/growth symbol */}
          <path
            d="M15 85 L15 35 C15 30 18 27 23 27 L35 27 C40 27 43 24 43 19 L43 15"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M43 85 L43 45 C43 40 46 37 51 37 L63 37 C68 37 71 34 71 29 L71 25"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M71 85 L71 55 C71 50 74 47 79 47 L85 47"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Accent dots */}
          <circle cx="43" cy="15" r="5" fill="#087331" />
          <circle cx="71" cy="25" r="5" fill="#087331" />
          <circle cx="85" cy="47" r="5" fill="#087331" />
        </svg>
      </div>
      
      {/* Wordmark with Z in green */}
      <div className="flex flex-col justify-center gap-1">
        <div 
          className="font-bold tracking-tight flex"
          style={{ 
            fontSize: size * 0.32,
            lineHeight: 1,
            letterSpacing: '-0.03em'
          }}
        >
          <span style={{ color: '#000000' }}>BROK</span>
          <span style={{ color: '#087331' }}>Z</span>
        </div>
        <div 
          className="font-normal tracking-wider uppercase"
          style={{ 
            fontSize: size * 0.075,
            color: '#666666',
            letterSpacing: '0.15em',
          }}
        >
          Trading Solutions
        </div>
      </div>
    </div>
  );
}

// Compact version without tagline
export function BrokzLogoCompact({ size = 150, className = '' }: BrokzLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height: size }}>
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: size * 0.4,
          height: size * 0.4,
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M15 85 L15 35 C15 30 18 27 23 27 L35 27 C40 27 43 24 43 19 L43 15"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M43 85 L43 45 C43 40 46 37 51 37 L63 37 C68 37 71 34 71 29 L71 25"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M71 85 L71 55 C71 50 74 47 79 47 L85 47"
            stroke="#087331"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="15" r="5" fill="#087331" />
          <circle cx="71" cy="25" r="5" fill="#087331" />
          <circle cx="85" cy="47" r="5" fill="#087331" />
        </svg>
      </div>
      
      <div 
        className="font-bold tracking-tight flex"
        style={{ 
          fontSize: size * 0.36,
          lineHeight: 1,
          letterSpacing: '-0.03em'
        }}
      >
        <span style={{ color: '#000000' }}>BROK</span>
        <span style={{ color: '#087331' }}>Z</span>
      </div>
    </div>
  );
}

// Icon only version
export function BrokzIcon({ size = 80, className = '' }: BrokzLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: size,
        height: size,
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M15 85 L15 35 C15 30 18 27 23 27 L35 27 C40 27 43 24 43 19 L43 15"
          stroke="#087331"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43 85 L43 45 C43 40 46 37 51 37 L63 37 C68 37 71 34 71 29 L71 25"
          stroke="#087331"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M71 85 L71 55 C71 50 74 47 79 47 L85 47"
          stroke="#087331"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="43" cy="15" r="5" fill="#087331" />
        <circle cx="71" cy="25" r="5" fill="#087331" />
        <circle cx="85" cy="47" r="5" fill="#087331" />
      </svg>
    </div>
  );
}