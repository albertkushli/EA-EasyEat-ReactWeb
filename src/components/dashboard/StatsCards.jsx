function formatNumber(value, { decimals = 0 } = {}) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value ?? 0);
}

export default function StatsCards({ data }) {
  const cards = [
    {
      title: 'Puntos otorgados',
      value: formatNumber(data?.totalPointsGiven),
    },
    {
      title: 'Clientes leales',
      value: formatNumber(data?.loyalCustomers),
    },
    {
      title: 'Promedio de puntos por visita',
      value: formatNumber(data?.averagePointsPerVisit, { decimals: 1 }),
    },
  ];

  return (
    <div className="stats-kpi-grid">
      {cards.map((card) => (
        <div key={card.title} className="glass-card stats-kpi-card">
          <p className="stats-kpi-label">{card.title}</p>
          <h2 className="stats-kpi-value">{card.value}</h2>
        </div>
      ))}
    </div>
  );
}