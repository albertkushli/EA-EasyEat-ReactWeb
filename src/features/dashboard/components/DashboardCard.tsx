export default function DashboardCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card ${className}`}>
      {title && <h3 className="dashboard-card-title">{title}</h3>}
      <div className="dashboard-card-body">{children}</div>
    </section>
  );
}