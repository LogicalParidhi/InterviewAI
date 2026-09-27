import React, { useEffect, useState } from 'react';

interface ScoreChartProps {
  score: number;          // 0-100
  size?: number;          // px
  strokeWidth?: number;   // px
  label: string;
  color?: string;         // tailwind color class for the value text
  trackColor?: string;    // hex for the track
  progressColor?: string; // hex for the progress arc
}

const ScoreChart: React.FC<ScoreChartProps> = ({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'text-white',
  trackColor = '#1e293b',
  progressColor = '#6366f1',
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: `drop-shadow(0 0 6px ${progressColor}40)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{animatedScore}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 text-center">{label}</p>
    </div>
  );
};

export default ScoreChart;
