import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { IVisit } from '@/types';

type StatisticsPeriod = '7d' | '30d' | '12m';

interface CustomerDonutChartProps {
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

export default function CustomerDonutChart({
  visits,
  restaurantId,
  period,
}: CustomerDonutChartProps) {
  const COLORS = ['#22c55e', '#f97316'];

  const data = useMemo(() => {
    const currentRestaurantId = normalizeRestaurantId(restaurantId);
    const periodStart = getPeriodStart(period);

    const customerCounts = visits.reduce(
      (acc, visit) => {
        const visitDateValue = visit.date || visit.createdAt;

        if (
          currentRestaurantId &&
          normalizeRestaurantId(visit.restaurant_id) !== currentRestaurantId
        ) {
          return acc;
        }

        if (periodStart && visitDateValue) {
          const visitDate = new Date(visitDateValue);

          if (Number.isNaN(visitDate.getTime()) || visitDate < periodStart) {
            return acc;
          }
        }

        const cid = normalizeRestaurantId(visit.customer_id);

        if (cid && cid !== 'undefined') acc[cid] = (acc[cid] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>,
    );

    let nuevos = 0,
      recurrentes = 0;
    Object.values(customerCounts).forEach((count) => (count === 1 ? nuevos++ : recurrentes++));

    return [
      { name: 'Nuevos', value: nuevos },
      { name: 'Recurrentes', value: recurrentes },
    ];
  }, [visits, restaurantId, period]);

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 18, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="48%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
