import React from 'react';
import { Heart, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { RelationshipTier, TIER_CONFIG } from '../../types/relationship';

interface RelationshipBadgeProps {
  affinity: number;
  tier: RelationshipTier;
  size?: 'xs' | 'sm' | 'md';
  showScore?: boolean;
  className?: string;
}

export const RelationshipBadge: React.FC<RelationshipBadgeProps> = ({
  affinity,
  tier,
  size = 'sm',
  showScore = true,
  className = '',
}) => {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.neutral;

  const sizeStyles = {
    xs: 'text-[9px] px-1.5 py-0.5 space-x-1',
    sm: 'text-[10px] px-2 py-0.5 space-x-1.5',
    md: 'text-xs px-2.5 py-1 space-x-2',
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
  };

  const renderIcon = () => {
    const iconSize = iconSizes[size];
    if (tier === 'nemesis' || tier === 'hostile') {
      return <ShieldAlert size={iconSize} className={config.heartColor} />;
    }
    if (tier === 'soulmate' || tier === 'admirer') {
      return <Sparkles size={iconSize} className={config.heartColor} />;
    }
    if (tier === 'friendly' || tier === 'close_friend') {
      return <Heart size={iconSize} className={`${config.heartColor} fill-current`} />;
    }
    return <UserCheck size={iconSize} className={config.heartColor} />;
  };

  const formattedScore = affinity > 0 ? `+${affinity}` : `${affinity}`;

  return (
    <div
      className={`inline-flex items-center rounded-full border font-mono font-medium transition-all select-none shrink-0 whitespace-nowrap ${
        config.badgeColor
      } ${config.borderColor} ${config.textColor} ${sizeStyles[size]} ${className}`}
      title={`${config.label}: ${config.description} (Affinity: ${formattedScore})`}
    >
      {renderIcon()}
      <span className="font-semibold">{config.label}</span>
      {showScore && (
        <span className="opacity-75 font-normal tracking-tight text-[0.85em]">
          {formattedScore}
        </span>
      )}
    </div>
  );
};
