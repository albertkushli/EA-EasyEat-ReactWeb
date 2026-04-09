import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function RatingsBarChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="glass-card chart-card">
      <h3 className="chart-title">Valoraciones por categoría</h3>

      {chartData.length === 0 ? (
        <p style={{ color: 'var(--clr-text-muted)', marginTop: '8px' }}>
          Sin reseñas suficientes para calcular promedios.
        </p>
      ) : null}

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Bar dataKey="value" fill="var(--clr-accent)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}