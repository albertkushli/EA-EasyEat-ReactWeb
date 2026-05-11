import type { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  variant?: 'visits' | 'customers' | 'rating' | 'default' | string;
}

export default function MetricCard({ icon, value, label, variant = '' }: MetricCardProps) {
  return (
    <div className={`he-stat ${variant ? `he-stat--${variant}` : ''}`}>
      <div className="he-stat__icon">{icon}</div>
      <div>
        <span className="he-stat__value">{value}</span>
        <span className="he-stat__label">{label}</span>
      </div>
    </div>
  );
}
