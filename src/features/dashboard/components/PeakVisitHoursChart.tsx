import { IVisit } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type StatisticsPeriod = '7d' | '30d' | '12m';

interface PeakVisitHoursChartProps {
  visits: IVisit[];
  restaurantId?: string;
  period?: StatisticsPeriod;
}

function normalizeRestaurantId(value: unknown) {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id?: string })._id ?? '');
  }

  return String(value ?? '');
}

function getPeriodStart(period?: StatisticsPeriod) {
  if (!period) return null;

  const now = new Date();
  const start = new Date(now);

  if (period === '7d') {
    start.setDate(now.getDate() - 6);
  } else if (period === '30d') {
    start.setDate(now.getDate() - 29);
  } else {
    start.setMonth(now.getMonth() - 11);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function buildPeakVisitStats(visits: IVisit[], restaurantId?: string, period?: StatisticsPeriod) {
  const currentRestaurantId = normalizeRestaurantId(restaurantId);
  const periodStart = getPeriodStart(period);

  const filteredVisits = Array.isArray(visits)
    ? visits.filter((visit) => {
        if (
          currentRestaurantId &&
          normalizeRestaurantId(visit?.restaurant_id) !== currentRestaurantId
        ) {
          return false;
        }

        if (periodStart) {
          const visitDate = new Date(visit?.date || visit?.createdAt || '');

          if (Number.isNaN(visitDate.getTime()) || visitDate < periodStart) {
            return false;
          }
        }

        return true;
      })
    : [];

  const hourMap: Record<string, number> = {};

  filteredVisits.forEach((visit) => {
    const date = new Date(visit?.date || visit?.createdAt || '');

    if (Number.isNaN(date.getTime())) return;

    const hour = String(date.getHours()).padStart(2, '0');
    hourMap[`${hour}:00`] = (hourMap[`${hour}:00`] || 0) + 1;
  });

  return [
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ].map((hour) => ({ hour, visits: hourMap[hour] || 0 }));
}

export default function PeakVisitHoursChart({
  visits,
  restaurantId,
  period,
}: PeakVisitHoursChartProps) {
  const data = buildPeakVisitStats(visits, restaurantId, period);

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 35 }}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Area
            type="monotone"
            dataKey="visits"
            name="Visitas"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVisits)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
