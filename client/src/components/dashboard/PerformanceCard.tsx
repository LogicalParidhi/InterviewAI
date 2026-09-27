import React, { useEffect, useState } from 'react';

interface PerformanceCardProps {
  label: string;
  score: number | null;  // 0-100
  color: string;         // hex color for the bar
  index?: number;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  label,
  score,
  color,
  index = 0,
}) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setAnimatedWidth(score ?? 0),
      200 + index * 150
    );
    return () => clearTimeout(timer);
  }, [score, index]);

  if (score === null) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}40`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};

export default PerformanceCard;
