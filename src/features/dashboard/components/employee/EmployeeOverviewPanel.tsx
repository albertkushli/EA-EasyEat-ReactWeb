import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { IReview, IVisit } from '@/types';
import RestaurantReviewsBarChart from '../RestaurantReviewsBarChart';
import PeakVisitHoursChart from '../PeakVisitHoursChart';
import type { Dish } from '@/types/Dish';

interface EmployeeOverviewPanelProps {
  visits: IVisit[];
  reviews: IReview[];
  dishes: Dish[];
  restaurantId: string;
  averagePointsPerVisit: number;
  loyalCustomers: number;
  restRating?: number | string;
}

function buildRatingRanking(dishes: Dish[]) {
  const ranking = dishes
    .filter((dish) => dish.avgRating !== undefined && dish.avgRating > 0)
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .slice(0, 10)
    .map((dish) => ({
      name: dish.name,
      score: dish.avgRating || 0,
    }));

  return ranking;
}

export default function EmployeeOverviewPanel({
  visits,
  reviews,
  dishes,
  restaurantId,
  averagePointsPerVisit,
  loyalCustomers,
  restRating,
}: EmployeeOverviewPanelProps) {
  const { t } = useTranslation();
  const ranking = useMemo(() => buildRatingRanking(dishes), [dishes]);

  return (
    <main className="flex-1 w-full h-full bg-slate-50/30">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight uppercase">
          {t('dashboard.employee.statsTitle', 'VISTA GENERAL')}
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-50/60 rounded-2xl p-6 flex items-center gap-5 border border-orange-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-orange-500">
              🏆
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(averagePointsPerVisit || 0)}
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
                {t('components.metrics.avgPointsVisit')}
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-6 flex items-center gap-5 border border-blue-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-blue-500">
              👥
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(loyalCustomers || 0)}
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
                {t('components.metrics.loyalCustomers')}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-6 flex items-center gap-5 border border-amber-100/50">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl shadow-sm text-amber-500">
              ⭐
            </div>
            <div className="flex flex-col">
              <div className="text-[32px] leading-tight font-bold text-slate-800">
                {Number(restRating ?? 0).toFixed(1)}
              </div>
              <div className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase">
                {t('components.metrics.avgRating')}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              {t('components.reviewScores.title')}
            </h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <RestaurantReviewsBarChart reviews={reviews} restaurantId={restaurantId} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col min-h-[380px]">
            <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wide">
              {t('components.peakHours.title')}
            </h3>
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full h-full min-h-[260px]">
                <PeakVisitHoursChart visits={visits} restaurantId={restaurantId} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
            {t('components.topDishes.title')}
          </h3>
          <div className="flex flex-col">
            {ranking.length > 0 ? (
              ranking.map((dish, index) => (
                <div
                  key={`${dish.name}-${index}`}
                  className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 text-lg">★</span>
                    <span className="text-[15px] font-medium text-slate-700">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-800">
                      {dish.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-400 text-sm italic">
                  {t(
                    'components.topDishes.none',
                    'No hay datos suficientes para generar el ranking de platos.',
                  )}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
