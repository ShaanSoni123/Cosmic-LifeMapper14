import React from 'react';

interface HabitabilityBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const HabitabilityBar: React.FC<HabitabilityBarProps> = ({ 
  score, 
  showLabel = true, 
  size = 'medium' 
}) => {
  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-gradient-to-r from-green-500 to-emerald-400';
    if (score >= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-400';
    if (score >= 25) return 'bg-gradient-to-r from-orange-500 to-red-400';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getTextColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const sizeClasses = {
    small: 'h-1.5',
    medium: 'h-2',
    large: 'h-3'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className={`text-gray-400 ${textSizeClasses[size]}`}>Habitability</span>
          <span className={`font-bold ${getTextColor(score)} ${textSizeClasses[size]}`}>
            {score}/100
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-700 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-1000 ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {size === 'large' && (
        <div className="mt-2">
          <div className={`text-xs ${getTextColor(score)}`}>
            {score >= 70 && "Excellent conditions for life"}
            {score >= 50 && score < 70 && "Good potential for habitability"}
            {score >= 25 && score < 50 && "Marginal habitability conditions"}
            {score < 25 && "Poor conditions for life"}
          </div>
        </div>
      )}
    </div>
  );
};