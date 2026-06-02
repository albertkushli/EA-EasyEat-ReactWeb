import { IVisit } from '@/types';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function normalizeRestaurantId(value: any) {
  return String(value?._id ?? value ?? '');
}

function buildPeakVisitStats(visits: any, restaurantId: any) {
  const currentRestaurantId = normalizeRestaurantId(restaurantId);
  const filteredVisits = Array.isArray(visits)
    ? visits.filter(visit => normalizeRestaurantId(visit?.restaurant_id) === currentRestaurantId)
    : [];

  const hourMap: Record<string, number> = {};
  filteredVisits.forEach((visit) => {
    const date = new Date(visit?.date || visit?.createdAt);
    const hour = String(date.getHours()).padStart(2, '0');
    hourMap[`${hour}:00`] = (hourMap[`${hour}:00`] || 0) + 1;
  });

  return [
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ].map(hour => ({ hour, visits: hourMap[hour] || 0 }));
}

export default function PeakVisitHoursChart({ visits, restaurantId }: { visits: IVisit[], restaurantId: string }) {
  const { t } = useTranslation();
  const data = buildPeakVisitStats(visits, restaurantId);

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Area type="monotone" dataKey="visits" name="Visitas" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}