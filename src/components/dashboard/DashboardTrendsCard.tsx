import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DEFAULT_REVENUE_THRESHOLD = 300;

function toValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDayTimestamp(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function groupVisitsByDay(visits = [], locale) {
  const groupedVisits = new Map();
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const shortDateOptions = { day: '2-digit', month: '2-digit' };

  visits.forEach((visit) => {
    const date = toValidDate(visit?.date || visit?.createdAt);
    if (!date) return;

    const timestamp = startOfDayTimestamp(date);
    const current = groupedVisits.get(timestamp) || {
      date: date.toLocaleDateString(locale, dateOptions),
      chartDate: date.toLocaleDateString(locale, shortDateOptions),
      timestamp,
      visits: 0,
      revenue: 0,
    };

    current.visits += 1;
    current.revenue += Number(visit?.billAmount || 0);
    groupedVisits.set(timestamp, current);
  });

  return Array.from(groupedVisits.values()).sort((a, b) => a.timestamp - b.timestamp);
}

function getDailyLookup(visits = [], locale) {
  return groupVisitsByDay(visits, locale).reduce((lookup, day) => {
    lookup.set(day.timestamp, day);
    return lookup;
  }, new Map());
}

function getPeriodTotals(dailyLookup, startDate, endDate) {
  let visits = 0;
  let revenue = 0;

  for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
    const dayStats = dailyLookup.get(startOfDayTimestamp(cursor));
    if (!dayStats) continue;

    visits += dayStats.visits;
    revenue += dayStats.revenue;
  }

  return { visits, revenue };
}

function calculatePercentageChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function formatChangeLabel(change, t) {
  if (change == null || Number.isNaN(change)) return t("common.noComparison");
  const sign = change >= 0 ? '+' : '';
  return `${change >= 0 ? '📈' : '📉'} ${sign}${Math.abs(change).toFixed(1)}% vs ${t("dashboard.employee.status.sevenPreviousDays")}`;
}

function getChangeTone(change) {
  if (change == null) return 'neutral';
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
}

function buildPredictedDays(dailyData, locale) {
  if (!dailyData.length) return [];

  const recentDays = dailyData.slice(-7);
  const averageVisits = recentDays.reduce((sum, day) => sum + day.visits, 0) / recentDays.length;
  const predictedVisits = Math.max(0, Math.round(averageVisits));
  const lastTimestamp = dailyData[dailyData.length - 1].timestamp;

  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const shortDateOptions = { day: '2-digit', month: '2-digit' };

  return Array.from({ length: 7 }, (_, index) => {
    const futureDate = addDays(new Date(lastTimestamp), index + 1);

    return {
      date: futureDate.toLocaleDateString(locale, dateOptions),
      chartDate: futureDate.toLocaleDateString(locale, shortDateOptions),
      timestamp: startOfDayTimestamp(futureDate),
      visits: predictedVisits,
      predicted: true,
    };
  });
}

function buildChartData(visits, locale) {
  const groupedDays = groupVisitsByDay(visits, locale);

  const realDays = groupedDays.map((day) => ({
    ...day,
    predicted: false,
    actualVisits: day.visits,
    predictedVisits: null,
  }));

  const predictedDays = buildPredictedDays(groupedDays, locale).map((day) => ({
    ...day,
    actualVisits: null,
    predictedVisits: day.visits,
  }));

  return [...realDays, ...predictedDays];
}

function splitChartData(chartData) {
  return {
    realData: chartData
      .filter((item) => item.predicted === false)
      .map((item) => ({
        chartDate: item.chartDate,
        visits: item.actualVisits ?? item.visits ?? 0,
      })),
    predictedData: chartData
      .filter((item) => item.predicted === true)
      .map((item) => ({
        chartDate: item.chartDate,
        visits: item.predictedVisits ?? item.visits ?? 0,
      })),
  };
}

function buildAlerts({ averageRating, visitsChange, currentRevenue, revenueThreshold, t }) {
  const alerts = [];

  if (averageRating != null && averageRating < 7) {
    alerts.push({ id: 'rating-low', tone: 'danger', text: t("components.trends.alerts.ratingLow") });
  }

  if (visitsChange != null && visitsChange < -10) {
    alerts.push({ id: 'visits-drop', tone: 'danger', text: t("components.trends.alerts.visitsDrop") });
  }

  if (currentRevenue < revenueThreshold) {
    alerts.push({ id: 'revenue-low', tone: 'warning', text: t("components.trends.alerts.revenueLow") });
  }

  if (!alerts.length) {
    alerts.push({ id: 'good-performance', tone: 'success', text: t("components.trends.alerts.goodPerformance") });
  }

  return alerts;
}

function TrendsTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;

  const point = payload[0];

  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '0.75rem 0.9rem',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '0.35rem' }}>
        {label}
      </div>
      <div style={{ color: 'var(--clr-text)', fontSize: '0.85rem', fontWeight: 700 }}>
        {t("components.trends.visits")}: {point?.value ?? 0}
      </div>
    </div>
  );
}

export default function DashboardTrendsCard({
  visits = [],
  averageRating = null,
  revenueThreshold = DEFAULT_REVENUE_THRESHOLD,
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const chartData = useMemo(() => buildChartData(visits, locale), [visits, locale]);
  const { realData, predictedData } = useMemo(() => splitChartData(chartData), [chartData]);

  const { currentPeriod, previousPeriod } = useMemo(() => {
    const orderedDays = groupVisitsByDay(visits, locale);

    if (!orderedDays.length) {
      return {
        currentPeriod: { visits: 0, revenue: 0 },
        previousPeriod: { visits: 0, revenue: 0 },
      };
    }

    const dailyLookup = getDailyLookup(visits, locale);
    const latestDay = orderedDays[orderedDays.length - 1].timestamp;
    const currentStart = addDays(new Date(latestDay), -6);
    const currentEnd = new Date(latestDay);
    const previousStart = addDays(currentStart, -7);
    const previousEnd = addDays(currentStart, -1);

    return {
      currentPeriod: getPeriodTotals(dailyLookup, currentStart, currentEnd),
      previousPeriod: getPeriodTotals(dailyLookup, previousStart, previousEnd),
    };
  }, [visits, locale]);

  const visitsChange = calculatePercentageChange(currentPeriod.visits, previousPeriod.visits);
  const revenueChange = calculatePercentageChange(currentPeriod.revenue, previousPeriod.revenue);

  const alerts = useMemo(
    () => buildAlerts({
      averageRating,
      visitsChange,
      currentRevenue: currentPeriod.revenue,
      revenueThreshold,
      t,
    }),
    [averageRating, visitsChange, currentPeriod.revenue, revenueThreshold, t],
  );

  const revenueFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  return (
    <section className="he-trends-card">
      <div className="he-trends-card__header">
        <div>
          <h3 className="he-trends-card__title">{t("components.trends.title")}</h3>
          <p className="he-trends-card__subtitle">
            {t("components.trends.subtitle")}
          </p>
        </div>
        <span className="he-trends-card__badge">{t("components.trends.badge")}</span>
      </div>

      <div className="he-trends-card__summary">
        <div className="he-trends-card__metric">
          <span className="he-trends-card__metric-label">{t("components.trends.visits")}</span>
          <strong className="he-trends-card__metric-value">{currentPeriod.visits}</strong>
          <span className={`he-trends-card__metric-change he-trends-card__metric-change--${getChangeTone(visitsChange)}`}>
            {formatChangeLabel(visitsChange, t)}
          </span>
        </div>

        <div className="he-trends-card__metric">
          <span className="he-trends-card__metric-label">{t("components.trends.revenue")}</span>
          <strong className="he-trends-card__metric-value">
            {revenueFormatter.format(currentPeriod.revenue)}
          </strong>
          <span className={`he-trends-card__metric-change he-trends-card__metric-change--${getChangeTone(revenueChange)}`}>
            {formatChangeLabel(revenueChange, t)}
          </span>
        </div>

        <div className="he-trends-card__metric">
          <span className="he-trends-card__metric-label">{t("components.trends.rating")}</span>
          <strong className="he-trends-card__metric-value">
            {averageRating == null ? '—' : averageRating.toFixed(1)}
          </strong>
          <span className={`he-trends-card__metric-change he-trends-card__metric-change--${averageRating != null && averageRating < 7 ? 'negative' : 'neutral'}`}>
            {averageRating == null ? t("components.trends.noData") : averageRating < 7 ? t("components.trends.lowRating") : t("components.trends.correctLevel")}
          </span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="he-trends-card__charts">
          <div className="he-trends-card__panel">
            <div className="he-trends-card__panel-title">{t("components.trends.realVisits")}</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.12} />
                  <XAxis dataKey="chartDate" tickMargin={8} />
                  <YAxis allowDecimals={false} tickMargin={8} />
                  <Tooltip content={<TrendsTooltip t={t} />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="rgba(249, 115, 22, 0.9)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'rgba(249, 115, 22, 0.95)', stroke: 'rgba(249, 115, 22, 1)', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: 'rgba(249, 115, 22, 1)', stroke: 'rgba(249, 115, 22, 1)' }}
                    connectNulls={false}
                    name={t("components.trends.realVisits")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="he-trends-card__panel">
            <div className="he-trends-card__panel-title">{t("components.trends.prediction7Days")}</div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.12} />
                  <XAxis dataKey="chartDate" tickMargin={8} />
                  <YAxis allowDecimals={false} tickMargin={8} />
                  <Tooltip content={<TrendsTooltip t={t} />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="rgba(16, 185, 129, 0.85)"
                    strokeWidth={3}
                    strokeDasharray="7 6"
                    dot={{ r: 4, fill: 'rgba(16, 185, 129, 0.9)', stroke: 'rgba(16, 185, 129, 1)', strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: 'rgba(16, 185, 129, 1)', stroke: 'rgba(16, 185, 129, 1)' }}
                    connectNulls={false}
                    name={t("components.trends.prediction")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="he-trends-card__empty">
          {t("components.trends.empty")}
        </div>
      )}

      <div className="he-trends-card__alerts">
        {alerts.map((alert) => (
          <div key={alert.id} className={`he-trends-card__alert he-trends-card__alert--${alert.tone}`}>
            {alert.text}
          </div>
        ))}
      </div>

      <div className="he-trends-card__legend">
        <span><i className="he-trends-card__dot he-trends-card__dot--real" /> {t("components.trends.realData")}</span>
        <span><i className="he-trends-card__dot he-trends-card__dot--predicted" /> {t("components.trends.prediction")}</span>
      </div>
    </section>
  );
}
