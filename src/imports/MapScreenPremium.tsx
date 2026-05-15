import { useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Clock,
  Flame,
  Layers,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import GoogleMapComponent from './GoogleMapComponent';
import { MODERN_MAP_STYLE } from '@/utils/mapStyles';
import RestaurantPreviewCard from '@/components/RestaurantPreviewCard';
import type { Restaurant } from '@/types/Restaurant';

type Filter = 'all' | 'nearby' | 'rating' | 'fast' | 'cheap';

interface Props {
  restaurants: Restaurant[];
  userLocation?: { lat: number; lng: number } | null;
  isLoading?: boolean;
  defaultCenter?: { lat: number; lng: number };
  initialSelectedRestaurantId?: string | null;
  onRequestNearby?: () => Promise<void> | void;
}

const PRIMARY = '#FF5A5F';
const ACCENT = '#FF8C42';
const DEFAULT_CENTER = { lat: 41.3851, lng: 2.1734 };

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&q=60',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop&q=60',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&q=60',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop&q=60',
];

function getRating(r: Restaurant): number {
  return r.profile?.globalRating ?? 0;
}

function getDistance(r: Restaurant): number | null {
  return (r as any).distanceKm ?? null;
}

function isNearby(r: Restaurant): boolean {
  return Boolean((r as any).isNearby);
}

function getCuisine(r: Restaurant): string {
  return r.profile?.category?.slice(0, 2).join(' · ') || 'Restaurant';
}

function getImage(r: Restaurant): string {
  return (
    r.profile?.image?.[0] ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop&q=70'
  );
}

function getPrice(r: Restaurant): string {
  const len = r.profile?.description?.length ?? 0;
  return len > 100 ? 'EUREUREUR' : len > 40 ? 'EUREUR' : 'EUR';
}

function estimatedTime(restaurantId?: string): string {
  const times = ['12-18', '15-25', '20-30', '25-35'];
  if (!restaurantId) return times[0];

  // Keep value deterministic per restaurant to avoid visual jitter on rerenders.
  const idx = restaurantId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % times.length;

  return times[idx];
}

const RestaurantListCard: FC<{
  restaurant: Restaurant;
  isSelected: boolean;
  onClick: () => void;
  imgUrl: string;
}> = ({ restaurant, isSelected, onClick, imgUrl }) => {
  const rating = getRating(restaurant);
  const distance = getDistance(restaurant);
  const nearby = isNearby(restaurant);
  const name = restaurant.profile?.name || 'Restaurant';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={[
        'flex gap-0 rounded-2xl border overflow-hidden cursor-pointer transition-all bg-white',
        isSelected
          ? 'border-[#FF5A5F] shadow-[0_0_0_3px_rgba(255,90,95,0.12)]'
          : 'border-black/[0.07] hover:border-[rgba(255,90,95,0.25)] hover:shadow-lg',
      ].join(' ')}
    >
      <div className="relative w-[88px] flex-shrink-0 overflow-hidden">
        <img src={imgUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        {nearby && (
          <div
            className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold text-white"
            style={{ background: ACCENT }}
          >
            Nearby
          </div>
        )}
      </div>

      <div className="flex-1 p-3 min-w-0">
        <p className="font-semibold text-[13px] text-gray-900 truncate leading-tight mb-0.5">{name}</p>
        <p className="text-[11px] text-gray-500 mb-2">{getCuisine(restaurant)}</p>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="flex items-center gap-1 text-[11px] font-medium text-gray-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>

          {distance !== null && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
              <MapPin className="w-2.5 h-2.5" />
              {distance} km
            </span>
          )}

          <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
            <Clock className="w-2.5 h-2.5" />
            {estimatedTime(restaurant._id)} min
          </span>

          <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{getPrice(restaurant)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const FilterChip: FC<{
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}> = ({ label, icon, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={[
      'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap',
      active
        ? 'text-white border-transparent'
        : 'bg-white text-gray-500 border-black/[0.08] hover:border-[#FF5A5F] hover:text-[#FF5A5F]',
    ].join(' ')}
    style={active ? { background: PRIMARY, borderColor: PRIMARY } : undefined}
  >
    {icon}
    {label}
  </motion.button>
);

const MapStatsOverlay: FC<{ total: number; nearby: number }> = ({ total, nearby }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-xl rounded-2xl p-3.5 border border-white/60 shadow-lg"
  >
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
        <Building2 className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-gray-900 leading-none">{total}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">restaurants</p>
      </div>
    </div>

    {nearby > 0 && (
      <>
        <div className="h-px bg-black/[0.06] mb-2.5" />
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900 leading-none">{nearby}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">nearby</p>
          </div>
        </div>
      </>
    )}
  </motion.div>
);

const NearMeButton: FC<{ onClick: () => void; loading: boolean }> = ({ onClick, loading }) => (
  <motion.button
    whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(255,90,95,0.35)' }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    disabled={loading}
    className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-3
               bg-white rounded-full text-[13px] font-semibold text-gray-800
               border border-black/[0.08] shadow-xl transition-colors
               hover:bg-[#FF5A5F] hover:text-white hover:border-[#FF5A5F]"
  >
    {loading ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      />
    ) : (
      <LocateFixed className="w-4 h-4" />
    )}
    {loading ? 'Loading...' : 'Show Near Me'}
  </motion.button>
);

export const MapScreenPremium: FC<Props> = ({
  restaurants,
  userLocation,
  isLoading = false,
  defaultCenter = DEFAULT_CENTER,
  initialSelectedRestaurantId,
  onRequestNearby,
}) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [showClusters, setShowClusters] = useState(true);

  const filtered = useMemo(() => {
    let list = restaurants;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.profile?.name || '').toLowerCase().includes(q) ||
          (r.profile?.category || []).some((c) => c.toLowerCase().includes(q))
      );
    }

    switch (activeFilter) {
      case 'nearby':
        list = list.filter(isNearby);
        break;
      case 'rating':
        list = [...list].sort((a, b) => getRating(b) - getRating(a));
        break;
      case 'fast':
        list = [...list].sort((a, b) => (getDistance(a) ?? 99) - (getDistance(b) ?? 99));
        break;
      case 'cheap':
        list = list.filter((r) => getPrice(r) === 'EUR');
        break;
      default:
        break;
    }

    return list;
  }, [restaurants, searchQuery, activeFilter]);

  const nearbyCount = useMemo(() => restaurants.filter(isNearby).length, [restaurants]);

  const selectedRestaurant = useMemo(() => {
    return restaurants.find((r) => r._id === selectedId) || null;
  }, [restaurants, selectedId]);

  useEffect(() => {
    if (initialSelectedRestaurantId !== undefined) {
      setSelectedId(initialSelectedRestaurantId);
    }
  }, [initialSelectedRestaurantId]);

  const handleSelectRestaurant = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleViewDetails = useCallback(
    (restaurantId: string) => {
      navigate(`/dashboard?tab=discover&restaurantId=${restaurantId}`);
    },
    [navigate]
  );

  const handleNearMe = useCallback(async () => {
    setNearMeLoading(true);
    try {
      await onRequestNearby?.();
      setActiveFilter('nearby');
    } finally {
      setNearMeLoading(false);
    }
  }, [onRequestNearby]);

  return (
    <div
      className="flex w-full h-screen"
      style={{ background: '#F6F7FB', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="flex-shrink-0 flex flex-col bg-white border-r border-black/[0.06] z-10" style={{ width: 400 }}>
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` }}
              >
                T
              </div>
              <span className="font-bold text-[17px] text-gray-900">Tastemap</span>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#FFF0F0', color: PRIMARY }}>
              {filtered.length} places
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or cuisine"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-black/[0.08] bg-gray-50
                         text-sm text-gray-900 placeholder-gray-400 outline-none
                         focus:border-[#FF5A5F] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center
                           rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {(
              [
                { id: 'all', label: 'All', icon: <Layers className="w-3 h-3" /> },
                { id: 'nearby', label: 'Nearby', icon: <MapPin className="w-3 h-3" /> },
                { id: 'rating', label: 'Top rated', icon: <Star className="w-3 h-3" /> },
                { id: 'fast', label: 'Fast', icon: <Clock className="w-3 h-3" /> },
                { id: 'cheap', label: 'Cheap', icon: <span className="text-[11px]">EUR</span> },
              ] as const
            ).map(({ id, label, icon }) => (
              <FilterChip
                key={id}
                label={label}
                icon={icon}
                active={activeFilter === id}
                onClick={() => setActiveFilter(id)}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-black/[0.05] mx-5 mt-3" />

        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="text-[12px] text-gray-400">{isLoading ? 'Loading...' : `${filtered.length} restaurants`}</span>
          <button className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: PRIMARY }}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[88px] rounded-2xl bg-gray-100 animate-pulse"
                />
              ))
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="text-4xl mb-3">No results</div>
                <p className="font-medium text-gray-700 text-sm">No matching restaurants</p>
                <p className="text-xs text-gray-400 mt-1">Try another filter or search</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="mt-4 text-xs font-semibold px-4 py-2 rounded-full border transition-all"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                >
                  Reset
                </button>
              </motion.div>
            ) : (
              filtered.map((r, i) => {
                const restaurantId = r._id;
                return (
                  <RestaurantListCard
                    key={restaurantId || i}
                    restaurant={r}
                    isSelected={selectedId === restaurantId}
                    imgUrl={getImage(r) || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length]}
                    onClick={() => {
                      if (!restaurantId) return;
                      handleSelectRestaurant(restaurantId);
                    }}
                  />
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
            Barcelona
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClusters((v) => !v)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                showClusters ? 'text-white border-transparent' : 'bg-white text-gray-600 border-black/[0.08]',
              ].join(' ')}
              style={showClusters ? { background: PRIMARY } : undefined}
            >
              <Layers className="w-3.5 h-3.5" />
              Clusters
            </motion.button>
          </div>
        </div>

        <div
          className="flex-1 relative overflow-hidden"
          style={{
            borderRadius: 24,
            boxShadow: '0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            border: '1.5px solid rgba(255,255,255,0.8)',
          }}
        >
          <GoogleMapComponent
            restaurants={filtered}
            selectedRestaurantId={selectedId}
            onRestaurantSelect={handleSelectRestaurant}
            center={userLocation || defaultCenter}
            zoom={14}
            showClusters={showClusters}
            userLocation={userLocation}
            mapStyle={MODERN_MAP_STYLE}
          />

          <MapStatsOverlay total={restaurants.length} nearby={nearbyCount} />

          <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-2">
            {[
              { icon: <Plus className="w-4 h-4" />, label: 'Zoom in' },
              { icon: <Minus className="w-4 h-4" />, label: 'Zoom out' },
            ].map(({ icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                title={label}
                className="w-9 h-9 bg-white rounded-xl border border-black/[0.08] flex items-center justify-center
                           text-gray-700 shadow-md hover:shadow-lg transition-all"
              >
                {icon}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title="My location"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: PRIMARY }}
            >
              <LocateFixed className="w-4 h-4" />
            </motion.button>
          </div>

           <NearMeButton onClick={handleNearMe} loading={nearMeLoading} />

          {/* Restaurant Preview Card */}
          <RestaurantPreviewCard
            restaurant={selectedRestaurant}
            onClose={() => setSelectedId(null)}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default MapScreenPremium;

