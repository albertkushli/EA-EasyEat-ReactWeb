import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
});

function toValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDayTimestamp(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatDate(date) {
  return DATE_FORMATTER.format(date);
}

function formatShortDate(date) {
  return SHORT_DATE_FORMATTER.format(date);
}

function groupVisitsByDay(visits = []) {
  const groupedVisits = new Map();

  visits.forEach((visit) => {
    const date = toValidDate(visit?.date || visit?.createdAt);
    if (!date) return;

    const timestamp = startOfDayTimestamp(date);
    const current = groupedVisits.get(timestamp) || {
      date: formatDate(date),
      chartDate: formatShortDate(date),
      timestamp,
      visits: 0,
    };

    current.visits += 1;
    groupedVisits.set(timestamp, current);
  });

  return Array.from(groupedVisits.values()).sort((a, b) => a.timestamp - b.timestamp);
}

function buildPredictedDays(dailyData) {
  if (!dailyData.length) return [];

  const recentDays = dailyData.slice(-7);
  const averageVisits = recentDays.reduce((sum, day) => sum + day.visits, 0) / recentDays.length;
  const predictedVisits = Math.max(0, Math.round(averageVisits));
  const lastTimestamp = dailyData[dailyData.length - 1].timestamp;

  return Array.from({ length: 7 }, (_, index) => {
    const futureDate = new Date(lastTimestamp);
    futureDate.setDate(futureDate.getDate() + index + 1);

    return {
      date: formatDate(futureDate),
      chartDate: formatShortDate(futureDate),
      timestamp: startOfDayTimestamp(futureDate),
      visits: predictedVisits,
      predicted: true,
    };
  });
}

function buildChartData(visits) {
  const groupedDays = groupVisitsByDay(visits);

  const realDays = groupedDays.map((day) => ({
    ...day,
    predicted: false,
    actualVisits: day.visits,
    predictedVisits: null,
  }));

  const predictedDays = buildPredictedDays(groupedDays).map((day) => ({
    ...day,
    actualVisits: null,
    predictedVisits: day.visits,
  }));

  return [...realDays, ...predictedDays];
}

function splitChartData(chartData) {
  const realData = chartData
    .filter((item) => item.predicted === false)
    .map((item) => ({
      date: item.date,
      chartDate: item.chartDate,
      visits: item.actualVisits ?? item.visits ?? 0,
    }));

  const predictedData = chartData
    .filter((item) => item.predicted === true)
    .map((item) => ({
      date: item.date,
      chartDate: item.chartDate,
      visits: item.predictedVisits ?? item.visits ?? 0,
    }));

  return { realData, predictedData };
}

function TrendsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const actualPoint = payload.find((item) => item?.dataKey === 'actualVisits' && item?.value != null);
  const predictedPoint = payload.find((item) => item?.dataKey === 'predictedVisits' && item?.value != null);

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      padding: '0.75rem 0.9rem',
      boxShadow: 'var(--shadow-md)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '0.35rem' }}>
        {label}
      </div>
      {actualPoint && (
        <div style={{ color: 'var(--clr-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
          Visitas reales: {actualPoint.value}
        </div>
      )}
      {predictedPoint && (
        <div style={{ color: 'var(--clr-accent)', fontSize: '0.85rem', fontWeight: 700 }}>
          Predicción: {predictedPoint.value}
        </div>
      )}
    </div>
  );
}

export default function DashboardTrendsCard({ visits = [] }) {
  const chartData = useMemo(() => buildChartData(visits), [visits]);
  const { realData, predictedData } = useMemo(
    () => splitChartData(chartData),
    [chartData],
  );

  return (
    <section className="he-trends-card">
      <div className="he-trends-card__header">
        <div>
          <h3 className="he-trends-card__title">Evolución temporal</h3>
        </div>
        <span className="he-trends-card__badge">+7 días</span>
      </div>

      {chartData.length > 0 ? (
        <div className="he-trends-card__charts">
          <div className="he-trends-card__panel">
            <div className="he-trends-card__panel-title">Visitas reales</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.12} />
                  <XAxis dataKey="chartDate" tickMargin={8} />
                  <YAxis allowDecimals={false} tickMargin={8} />
                  <Tooltip content={<TrendsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="rgba(249, 115, 22, 0.9)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'rgba(249, 115, 22, 0.95)', stroke: 'rgba(249, 115, 22, 1)', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: 'rgba(249, 115, 22, 1)', stroke: 'rgba(249, 115, 22, 1)' }}
                    connectNulls={false}
                    name="Visitas reales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="he-trends-card__panel">
            <div className="he-trends-card__panel-title">Predicción 7 días</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.12} />
                  <XAxis dataKey="chartDate" tickMargin={8} />
                  <YAxis allowDecimals={false} tickMargin={8} />
                  <Tooltip content={<TrendsTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="rgba(16, 185, 129, 0.85)"
                    strokeWidth={3}
                    strokeDasharray="7 6"
                    dot={{ r: 4, fill: 'rgba(16, 185, 129, 0.9)', stroke: 'rgba(16, 185, 129, 1)', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: 'rgba(16, 185, 129, 1)', stroke: 'rgba(16, 185, 129, 1)' }}
                    connectNulls={false}
                    name="Predicción"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="he-trends-card__empty">
          Todavía no hay visitas suficientes para construir la tendencia.
        </div>
      )}

      <div className="he-trends-card__legend">
        <span><i className="he-trends-card__dot he-trends-card__dot--real" /> Datos reales</span>
        <span><i className="he-trends-card__dot he-trends-card__dot--predicted" /> Predicción</span>
      </div>
    </section>
  );
}