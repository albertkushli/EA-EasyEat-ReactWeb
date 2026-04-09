import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function VisitsPerHourChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="glass-card chart-card">
      <h3 className="chart-title">Visitas por hora</h3>

      {chartData.length === 0 ? (
        <p style={{ color: 'var(--clr-text-muted)', marginTop: '8px' }}>
          Sin datos de visitas para el rango horario seleccionado.
        </p>
      ) : null}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickFormatter={(hour) => `${hour}:00`}
          />
          <YAxis />
          <Tooltip
            formatter={(value) => [value, 'Visitas']}
            labelFormatter={(label) => `${label}:00`}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--clr-primary)"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}