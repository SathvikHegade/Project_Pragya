import React from 'react';

export const PhysicsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" transform="rotate(120 12 12)"/>
  </svg>
);

export const LightningIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/>
  </svg>
);

export const BeakerIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 3v6L4 18a2 2 0 002 2h12a2 2 0 002-2L15 9V3H9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 14c2-1 4-1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="11" cy="17" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="14" cy="15" r="1" fill="currentColor" opacity="0.6"/>
  </svg>
);

export const LeafIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3c-1.5 2-4 6-4 11a6 6 0 0012 0c0-5-2.5-9-4-11-2 2-5 4-4 0z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 3v9c3 2 5 4 5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const MicroscopeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 11v5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 20v-4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 18h4" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const PendulumIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="4" r="2" fill="currentColor"/>
    <line x1="12" y1="4" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="18" r="3" fill="currentColor"/>
    <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const AtomIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" transform="rotate(-60 12 12)"/>
  </svg>
);

export const DropIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3c-4 5-6 8-6 11a6 6 0 0012 0c0-3-2-6-6-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 15a2 2 0 104 0" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

export const RainbowIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 18a9 9 0 0118 0" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
    <path d="M5 18a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
    <path d="M7 18a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <path d="M9 18a3 3 0 016 0" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
  </svg>
);

export const TargetIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

export const FlaskIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 2h8v6l4 10a2 2 0 01-1.8 2.9H5.8A2 2 0 014 18L8 8V2z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const MagnetIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 8v8a8 8 0 0016 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="2" y="4" width="5" height="5" rx="1" fill="currentColor"/>
    <rect x="17" y="4" width="5" height="5" rx="1" fill="currentColor"/>
  </svg>
);

export const TrophyIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 7H4a1 1 0 00-1 1v1a3 3 0 003 3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M17 7h3a1 1 0 011 1v1a3 3 0 01-3 3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const StarIcon = ({ size = 24, className = '', filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export const FireIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2c-1.5 3-3 5-3 8a3 3 0 006 0c0-1.5-.5-3-1-4s-1-2-1-3c0 2 0 4 2 5s2 3 2 5a4 4 0 01-8 0c0-3 1-6 3-9 0-1 1-2 2-2z" fill="currentColor"/>
  </svg>
);

export const RobotIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
    <path d="M12 16v2M10 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 3h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const GlobeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const CheckIcon = ({ size = 24, className = '', success = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={success ? 'success-animation' : className}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CrossIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SearchIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="11" cy="11" r="7"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

export const ChevronDownIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

export const ChevronRightIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export const MenuIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

export const GridIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

export const ListIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
  </svg>
);

export const PlayIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z"/>
  </svg>
);

export const ClockIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

export const BookIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

export const UserIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1"/>
  </svg>
);

export const LogoutIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

// Subject-specific icons
export const getSubjectIcon = (subject, size = 24) => {
  switch (subject) {
    case 'Physics':
      return <AtomIcon size={size} />;
    case 'Chemistry':
      return <BeakerIcon size={size} />;
    case 'Biology':
      return <LeafIcon size={size} />;
    default:
      return <FlaskIcon size={size} />;
  }
};

// Experiment-specific icons
export const getExperimentIcon = (experimentId, size = 24) => {
  const icons = {
    'pendulum': <PendulumIcon size={size} />,
    'ohms-law': <LightningIcon size={size} />,
    'acid-base': <BeakerIcon size={size} />,
    'photosynthesis': <LeafIcon size={size} />,
    'projectile': <TargetIcon size={size} />,
    'mitosis': <MicroscopeIcon size={size} />,
    'electrolysis': <DropIcon size={size} />,
    'refraction': <RainbowIcon size={size} />,
    'osmosis': <DropIcon size={size} />,
    'calorimetry': <FlaskIcon size={size} />,
  };
  return icons[experimentId] || <FlaskIcon size={size} />;
};

// Stat icons
export const getStatIcon = (type, size = 24) => {
  const icons = {
    experiments: <FlaskIcon size={size} />,
    star: <StarIcon size={size} />,
    fire: <FireIcon size={size} />,
    trophy: <TrophyIcon size={size} />,
    robot: <RobotIcon size={size} />,
  };
  return icons[type] || <StarIcon size={size} />;
};