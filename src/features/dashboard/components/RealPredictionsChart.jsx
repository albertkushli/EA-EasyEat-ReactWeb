import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

// Agrupa visitas por día y devuelve array [{ date, value }]
function aggregateByDay(visits = []) {
  const map = new Map();
  visits.forEach((v) => {
    const d = new Date(v.date || v.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  });

  // Ordenar por fecha ascendente
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value }));
}

// Simple regresión lineal (OLS) para predecir tendencia
function linearRegression(xs, ys) {
  const n = xs.length;
  if (n === 0) return { a: 0, b: 0 };
  const sumX = xs.reduce((s, v) => s + v, 0);
  const sumY = ys.reduce((s, v) => s + v, 0);
  const sumXY = xs.reduce((s, v, i) => s + v * ys[i], 0);
  const sumXX = xs.reduce((s, v) => s + v * v, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { a: 0, b: sumY / n };
  const a = (n * sumXY - sumX * sumY) / denom; // slope
  const b = (sumY - a * sumX) / n; // intercept
  return { a, b };
}

function buildDataset(visits = [], daysToPredict = 7) {
  const daily = aggregateByDay(visits);

  // Determine last available date (use today if no data)
  const lastDate = daily.length ? new Date(daily[daily.length - 1].date) : new Date();

  // Build map for quick lookup
  const map = new Map(daily.map((d) => [d.date, d.value]));

  // Get last 7 days real values (including zeros if missing)
  const recent = [];
  for (let i = daysToPredict - 1; i >= 0; i -= 1) {
    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    recent.push({ date: key, value: map.get(key) ?? 0 });
  }

  // Regression on recent values
  const xs = recent.map((_, i) => i + 1);
  const ys = recent.map((r) => r.value);
  const { a, b } = linearRegression(xs, ys);

  // Build combined dataset: last 7 real days + next N predicted days
  const data = [];
  recent.forEach((r) => data.push({ date: r.date, real: r.value }));

  for (let i = 0; i < daysToPredict; i += 1) {
    const idx = xs.length + i + 1;
    const predicted = Math.max(0, a * idx + b);
    const pd = new Date(lastDate);
    pd.setDate(lastDate.getDate() + i + 1);
    data.push({ date: pd.toISOString().slice(0, 10), predicted: Number(predicted.toFixed(2)) });
  }

  return data;
}

export default function RealPredictionsChart({ visits = [], daysToPredict = 7, mode = 'both' }) {
  const rawData = buildDataset(visits, daysToPredict);

  // merged is in chronological order: first daysToPredict entries are real, next are predicted
  const merged = rawData.map((d) => ({
    date: d.date,
    real: d.real ?? null,
    predicted: d.predicted ?? null,
  }));

  // Split
  const realSlice = merged.slice(0, daysToPredict);
  const predSlice = merged.slice(daysToPredict, daysToPredict * 2);

  // Compute +-% only for prediction mode (compare avg real vs avg predicted)
  const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
  const avgReal = avg(realSlice.map((d) => d.real ?? 0));
  const avgPred = avg(predSlice.map((d) => d.predicted ?? 0));
  const pct = avgReal === 0 ? (avgPred === 0 ? 0 : 100) : ((avgPred - avgReal) / Math.max(1, avgReal)) * 100;
  const pctPretty = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  const isAlert = Math.abs(pct) >= 10; // alerta si varianza >= 10%

  let dataToRender = merged;
  if (mode === 'real') dataToRender = realSlice;
  if (mode === 'prediction') dataToRender = predSlice;

  return (
    <div style={{ width: '100%', height: 320, position: 'relative' }}>
      {mode === 'prediction' && (
        <div style={{ position: 'absolute', right: 12, top: 8, zIndex: 2 }}>
          <div style={{ background: isAlert ? '#fee2e2' : '#ecfdf5', color: isAlert ? '#991b1b' : '#166534', padding: '6px 10px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
            {pctPretty}
          </div>
        </div>
      )}
      <ResponsiveContainer>
        <LineChart data={dataToRender} margin={{ top: 24, right: 24, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          {mode !== 'prediction' && <Line type="monotone" dataKey="real" name="Reales" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} />}
          {mode !== 'real' && <Line type="monotone" dataKey="predicted" name="Predicción" stroke="#f97316" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2 }} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
