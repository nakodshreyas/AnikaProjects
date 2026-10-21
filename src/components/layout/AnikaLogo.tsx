import React from 'react';

interface AnikaLogoProps {
  className?: string;
  variant?: 'color' | 'inverted' | 'monochrome';
}

export const AnikaLogo: React.FC<AnikaLogoProps> = ({
  className = 'h-14 w-auto',
  variant = 'color',
}) => {
  const goldColor = variant === 'monochrome' ? 'currentColor' : '#C5935A';
  const navyColor = variant === 'inverted' ? '#FFFFFF' : variant === 'monochrome' ? 'currentColor' : '#2D3F50';
  const projectsColor = variant === 'inverted' ? '#E2E8F0' : variant === 'monochrome' ? 'currentColor' : '#374151';
  const windowBg = variant === 'inverted' ? '#14202b' : '#FFFFFF';
  const windowDivider = variant === 'inverted' ? '#FFFFFF' : '#2D3F50';

  return (
    <svg
      viewBox="0 0 800 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Anika Projects Logo"
    >
      {/* TOP PAGODA / ARCHITECTURAL GABLE SPIRES (GOLD) */}
      {/* Top Center Vertical Finial Spire */}
      <rect x="393" y="0" width="14" height="85" fill={goldColor} rx="2" />

      {/* Tier 1 (Top Gable Roof) */}
      <polygon
        points="400,75 462,128 462,160 442,160 400,122 358,160 338,160 338,128"
        fill={goldColor}
      />

      {/* Tier 2 (Middle Gable Roof) */}
      <polygon
        points="400,165 504,242 504,282 482,282 400,214 318,282 296,282 296,242"
        fill={goldColor}
      />

      {/* Tier 3 (Bottom Gable Roof with flared eave wings) */}
      <polygon
        points="400,270 550,380 580,412 580,432 556,416 524,392 400,300 276,392 244,416 220,432 220,412 250,380"
        fill={goldColor}
      />

      {/* ARCHITECTURAL HIGH-RISE SILHOUETTE & ANIKA LETTERS (SLATE NAVY / WHITE) */}
      <g fill={navyColor}>
        {/* Left 'A' */}
        <path
          d="M0,600 L95,472 L120,472 L215,600 L174,600 L152,568 L63,568 L41,600 Z M76,540 L139,540 L107.5,494 Z"
        />

        {/* 'N' + Left Skyscraper Tower */}
        {/* Tower roof & upper silhouette */}
        <polygon points="330,305 362,270 362,472 330,472" />
        {/* 'N' letter body connecting with tower */}
        <path
          d="M236,472 L274,472 L328,552 L328,472 L362,472 L362,600 L324,600 L270,520 L270,600 L236,600 Z"
        />

        {/* 'I' Tower with Peaked Roof & Gable */}
        <polygon points="400,342 416,356 384,356" />
        <rect x="384" y="356" width="32" height="244" />

        {/* 'K' Left Column Building (Flat Top) */}
        <rect x="438" y="398" width="30" height="202" />
        {/* 'K' Diagonal Arms */}
        <path
          d="M468,520 L536,472 L580,472 L505,532 L582,600 L536,600 L468,545 Z"
        />

        {/* Right 'A' */}
        <path
          d="M585,600 L680,472 L705,472 L800,600 L759,600 L737,568 L648,568 L626,600 Z M661,540 L724,540 L692.5,494 Z"
        />
      </g>

      {/* 4-Pane Arched Window on 'I' Tower */}
      <g>
        <rect x="392" y="380" width="16" height="20" rx="3" fill={windowBg} />
        <line x1="400" y1="380" x2="400" y2="400" stroke={windowDivider} strokeWidth="2.5" />
        <line x1="392" y1="390" x2="408" y2="390" stroke={windowDivider} strokeWidth="2.5" />
      </g>

      {/* BOTTOM DIVIDER LINES AND 'PROJECTS' WORDMARK */}
      <g stroke={projectsColor}>
        {/* Left horizontal bar */}
        <line x1="0" y1="682" x2="88" y2="682" strokeWidth="4.5" strokeLinecap="round" />
        {/* Right horizontal bar */}
        <line x1="712" y1="682" x2="800" y2="682" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* PROJECTS Text */}
      <text
        x="400"
        y="696"
        textAnchor="middle"
        fill={projectsColor}
        fontSize="50"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="0.42em"
      >
        PROJECTS
      </text>
    </svg>
  );
};
