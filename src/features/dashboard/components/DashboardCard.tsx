import type { ReactNode } from 'react';

interface DashboardCardProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <section className={`dashboard-card ${className}`}>
      {title && <h3 className="dashboard-card-title">{title}</h3>}
      <div className="dashboard-card-body">{children}</div>
    </section>
  );
}
