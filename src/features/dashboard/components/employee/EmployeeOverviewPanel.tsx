import { useMemo } from 'react';
import type { IReview, IVisit } from '@/types';
import RestaurantReviewsBarChart from '../RestaurantReviewsBarChart';
import PeakVisitHoursChart from '../PeakVisitHoursChart';

interface EmployeeOverviewPanelProps {
  visits: IVisit[];
  reviews: IReview[];
  restaurantId: string;
  averagePointsPerVisit: number;
  loyalCustomers: number;
  restRating?: number | string;
}

function buildRatingRanking(reviews: IReview[]) {
  const map: Record<string, { total: number; count: number }> = {};

  reviews.forEach((review) => {
    const dish = (review as IReview & { dish?: { name?: string }; dishName?: string; itemName?: string; name?: string }).dish;
    const name = dish?.name || (review as IReview & { dishName?: string; itemName?: string; name?: string }).dishName || (review as IReview & { itemName?: string; name?: string }).itemName || (review as IReview & { name?: string }).name;
    const score = Number((review as IReview & { rating?: number; score?: number }).rating ?? (review as IReview & { score?: number }).score ?? 0);
    if (!name) return;
    if (!map[name]) map[name] = { total: 0, count: 0 };
    map[name].total += score;
    if (score > 0) map[name].count += 1;
  });

  let ranking = Object.keys(map).map((name) => ({
    name,
    score: map[name].count ? +(map[name].total / map[name].count).toFixed(1) : 0,
  }));

  if (ranking.length === 0) {
    ranking = [
      { name: 'Pan con Tomate', score: 8.0 },
      { name: 'Pulpo a la Gallega', score: 7.0 },
    ];
  }

  return ranking.sort((a, b) => b.score - a.score).slice(0, 10);
}

export default function EmployeeOverviewPanel({
  visits,
  reviews,
  restaurantId,
  averagePointsPerVisit,
  loyalCustomers,
  restRating,
}: EmployeeOverviewPanelProps) {
  const ranking = useMemo(() => buildRatingRanking(reviews), [reviews]);

  return (
    <main className="flex-1 w-full h-full bg-slate-50/30">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">VISTA GENERAL</h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-50/60 rounded-2xl p-6 flex items-center gap-5 border border-orange-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-orange-500">🏆</div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">{Number(averagePointsPerVisit || 0)}</div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">Average Points / Visit</div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-6 flex items-center gap-5 border border-blue-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-blue-500">👥</div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">{Number(loyalCustomers || 0)}</div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">Loyal Customers</div>
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-6 flex items-center gap-5 border border-amber-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-amber-500">⭐</div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">{Number(restRating ?? 0).toFixed(1)}</div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">Avg Rating</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">Rendimiento de Reseñas</h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <RestaurantReviewsBarChart
                  reviews={reviews}
                  restaurantId={restaurantId}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">Horas Punta de Visitas</h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <PeakVisitHoursChart
                  visits={visits}
                  restaurantId={restaurantId}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Ranking de Platos Estrellas</h3>
          <div className="flex flex-col">
            {ranking.map((dish, index) => (
              <div key={`${dish.name}-${index}`} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-lg">★</span>
                  <span className="text-[15px] font-medium text-slate-700">{dish.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-slate-800">{dish.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}