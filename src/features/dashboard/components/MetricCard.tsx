// Para las cards de arriba del dashboard, con el número grande y el texto debajo
 
export default function MetricCard({ icon, value, label, variant = '' }) {
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
