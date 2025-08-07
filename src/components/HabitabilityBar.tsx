import React from 'react';
import { Target } from 'lucide-react';

interface HabitabilityBarProps {
  score: number; // 0-100 scale
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const HabitabilityBar: React.FC<HabitabilityBarProps> = ({ 
  score, 
  size = 'medium', 
  showLabel = true 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-400';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-red-400';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { bar: 'h-1.5', text: 'text-xs' };
      case 'large':
        return { bar: 'h-4', text: 'text-lg' };
      default:
        return { bar: 'h-2', text: 'text-sm' };
    }
  };

  const sizeClasses = getSizeClasses();
  const safeScore = Math.max(0, Math.min(100, score || 0));

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`text-gray-400 ${sizeClasses.text} flex items-center gap-1`}>
            <Target className="w-3 h-3" />
            Habitability Score
          </span>
          <span className={`font-bold ${getScoreColor(safeScore)} ${sizeClasses.text}`}>
            {safeScore.toFixed(1)}/100
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`${sizeClasses.bar} rounded-full transition-all duration-1000 ${getBarColor(safeScore)}`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
      
      {size === 'large' && (
        <div className="text-center">
          <span className={`${sizeClasses.text} text-gray-400`}>
            {safeScore >= 80 ? 'Excellent' :
             safeScore >= 60 ? 'Good' :
             safeScore >= 40 ? 'Moderate' : 'Poor'} habitability potential
          </span>
        </div>
      )}
    </div>
  );
};