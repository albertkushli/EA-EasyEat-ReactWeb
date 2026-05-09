import React, { useEffect } from 'react';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useNavigate } from 'react-router-dom';
import { Map, Star, UtensilsCrossed } from 'lucide-react';
import type { Restaurant } from '@/types/Restaurant';
import { motion } from 'framer-motion';

const MAX_DISPLAYED_CATEGORIES = 2;
const CARD_STAGGER_STEP = 0.03;
const CARD_STAGGER_MAX = 0.18;
const LOYALTY_LABEL = 'Loyalty rewards available';

export default function DiscoverScreen() {
  const restaurants = useRestaurantStore((s: any) => s.restaurants);
  const load = useRestaurantStore((s: any) => s.loadRestaurants);
  const navigate = useNavigate();

  useEffect(() => { if (restaurants.length === 0) load(); }, [load, restaurants.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Discover</h2>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Explore top restaurants and collect loyalty rewards.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {restaurants.length} spots
            </span>
          </div>
        </div>
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">View mode</p>
            <p className="text-sm font-medium text-slate-700 sm:text-base">List curated for your next visit</p>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            title="View map"
          >
            <Map size={18} />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {restaurants.map((r: Restaurant, index: number) => {
            const image = r.profile.image?.[0] || '';
            const categoryCount = r.profile.category?.length || 0;
            const categories = categoryCount > 0
              ? r.profile.category.slice(0, MAX_DISPLAYED_CATEGORIES).join(' · ')
              : 'Restaurant';
            const detailLine = categoryCount > 0
              ? `${categoryCount} cuisine categories · ${LOYALTY_LABEL}`
              : LOYALTY_LABEL;
            const rating = typeof r.profile.globalRating === 'number'
              ? r.profile.globalRating.toFixed(1)
              : 'N/A';
            const animationDelay = Math.min(index * CARD_STAGGER_STEP, CARD_STAGGER_MAX);

            return (
              <motion.button
                key={r._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: animationDelay }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={() => navigate('/map', { state: { openRestaurantId: r._id } })}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={image}
                    alt={`Photo of ${r.profile.name} restaurant`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                      <UtensilsCrossed size={12} />
                      {categories}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      <Star size={12} className="fill-amber-300 text-amber-300" />
                      {rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="truncate text-base font-semibold text-slate-900">{r.profile.name}</h3>
                  <p className="line-clamp-2 text-sm text-slate-500">{detailLine}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
