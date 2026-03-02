import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-24 h-auto", color = "#1a237e", showText = true }) => {
  const ornaments = [-275, -220, -165, -110, -55, 0, 55, 110, 165, 220, 275];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 800 520" className="w-full h-auto drop-shadow-sm">
        <g fill={color}>
          {/* Icon */}
          <g transform="translate(400, 160)">
            <circle cx="0" cy="0" r="16"/>
            {/* 8 Petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <path 
                key={`petal-${angle}`}
                d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" 
                transform={`rotate(${angle})`} 
              />
            ))}
            {/* 8 Dots */}
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(angle => (
              <circle 
                key={`dot-${angle}`}
                cx="0" 
                cy="-115" 
                r="11" 
                transform={`rotate(${angle})`} 
              />
            ))}
          </g>

          {showText && (
            <g transform="translate(400, 340)">
              {/* HOTEL Text */}
              <text 
                x="0" 
                y="0" 
                textAnchor="middle" 
                className="font-serif font-bold" 
                style={{ fontSize: '22px', letterSpacing: '0.8em' }}
              >
                HOTEL
              </text>
              
              {/* TALAVERA Text */}
              <text 
                x="0" 
                y="75" 
                textAnchor="middle" 
                className="font-serif font-bold" 
                style={{ fontSize: '84px', letterSpacing: '0.25em' }}
              >
                TALAVERA
              </text>

              {/* Decorative Line & Ornaments */}
              <g transform="translate(0, 115)">
                {/* Main Line */}
                <rect x="-320" y="-2" width="640" height="4" />
                
                {/* End Dots */}
                <circle cx="-320" cy="0" r="6" />
                <circle cx="320" cy="0" r="6" />
                
                {/* Hanging Ornaments */}
                {ornaments.map((x, i) => (
                  <g key={`ornament-${i}`} transform={`translate(${x}, 12)`}>
                    <path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" />
                    <circle cx="0" cy="9" r="3.5" />
                  </g>
                ))}
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default Logo;
