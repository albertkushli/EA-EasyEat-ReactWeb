import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Clock3, Mail, MapPin, Phone, Star } from 'lucide-react';
import { restaurantService, reviewService } from '@/services';
import type { IRestaurant, IRestaurantStats, IReview } from '@/types';
import type { Restaurant } from '@/types/Restaurant';

type RestaurantSource = Restaurant | IRestaurant;

type RestaurantRouteState = {
  restaurant?: RestaurantSource;
};

function getRestaurantId(restaurant?: RestaurantSource | null): string | null {
  if (!restaurant) return null;
  return restaurant._id ?? (restaurant as IRestaurant).id ?? null;
}

function getRestaurantImages(restaurant?: RestaurantSource | null): string[] {
  if (!restaurant) return [];
  const profile = restaurant.profile as any;
  return profile?.image ?? profile?.images ?? [];
}

function getRestaurantCategories(restaurant?: RestaurantSource | null): string[] {
  if (!restaurant) return [];
  const profile = restaurant.profile as any;
  return profile?.category ?? profile?.categories ?? [];
}

function getRestaurantLocation(restaurant?: RestaurantSource | null) {
  if (!restaurant) return null;
  const location = (restaurant.profile as any)?.location;
  if (!location) return null;

  return {
    city: location.city || '',
    address: location.address || '',
  };
}

function getRestaurantRating(restaurant?: RestaurantSource | null): number {
  if (!restaurant) return 0;
  return (restaurant.profile as any)?.globalRating ?? 0;
}

function getRestaurantDescription(restaurant?: RestaurantSource | null): string {
  if (!restaurant) return '';
  return (restaurant.profile as any)?.description ?? '';
}

function getRestaurantContact(restaurant?: RestaurantSource | null) {
  if (!restaurant) return null;
  return (restaurant.profile as any)?.contact ?? null;
}

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value);
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm space-y-4 ${className}`}>
      {children}
    </div>
  );
}

function formatDate(dateValue: string | Date | undefined | null): string {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function RestaurantDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as RestaurantRouteState | null) ?? null;

  const [restaurant, setRestaurant] = useState<RestaurantSource | null>(
    routeState?.restaurant ?? null,
  );
  const [stats, setStats] = useState<IRestaurantStats | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = useMemo(() => id?.trim() || null, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurantDetails() {
      if (!restaurantId) {
        setRestaurant(null);
        setStats(null);
        setReviews([]);
        setError('Restaurant identifier is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setRestaurant(routeState?.restaurant ?? null);
      setStats(null);
      setReviews([]);

      try {
        const [fullRestaurant, restaurantStats, restaurantReviews] = await Promise.all([
          restaurantService.fetchRestaurantFull(restaurantId),
          restaurantService.fetchRestaurantStats(restaurantId),
          reviewService.fetchRestaurantReviews(restaurantId),
        ]);

        if (cancelled) return;

        if (fullRestaurant) {
          setRestaurant(fullRestaurant);
        } else if (!routeState?.restaurant) {
          setError('Restaurant not found.');
        }

        setStats(restaurantStats);
        setReviews(restaurantReviews || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading restaurant details:', err);
        setError('Unable to load restaurant details.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRestaurantDetails();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, routeState?.restaurant]);

  const images = getRestaurantImages(restaurant);
  const primaryImage =
    images[0] ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=700&fit=crop&q=80';
  const rating = getRestaurantRating(restaurant);
  const description = getRestaurantDescription(restaurant);
  const categories = getRestaurantCategories(restaurant);
  const locationInfo = getRestaurantLocation(restaurant);
  const contact = getRestaurantContact(restaurant);
  const displayName = restaurant?.profile?.name || 'Restaurant details';
  const displayId = getRestaurantId(restaurant) ?? restaurantId ?? '—';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {loading && !restaurant ? (
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-72 rounded-2xl bg-gray-200" />
              <div className="h-7 w-2/3 rounded bg-gray-200" />
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 rounded-2xl bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        ) : error && !restaurant ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-700 shadow-sm">
            <h1 className="text-2xl font-semibold">Restaurant details</h1>
            <p className="mt-2 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="mt-5 rounded-full bg-[#FF5A5F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FF4A4F]"
            >
              Go back to map
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl">
            <div className="relative h-72 w-full md:h-96">
              <img src={primaryImage} alt={displayName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
                    {formatNumber(rating)}
                  </span>
                  {locationInfo?.city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationInfo.city}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{displayName}</h1>
                <p className="mt-2 max-w-3xl text-sm text-white/85 md:text-base">
                  {description || 'No description available for this restaurant yet.'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-semibold">About this restaurant</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Building2 className="h-4 w-4" />
                        Restaurant ID
                      </div>
                      <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                        {displayId}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <Clock3 className="h-4 w-4" />
                        Average rating
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {formatNumber(rating)} / 10
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-[#FFF0F0] px-3 py-1 text-sm font-medium text-[#FF5A5F]"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No categories available.</span>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold">Description</h2>
                  <p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-6 text-gray-600">
                    {description || 'No description available for this restaurant yet.'}
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  {reviews.length > 0 ? (
                    <div className="grid gap-4">
                      {reviews.map((review) => (
                        <Card key={review._id || review.id}>
                          <div className="flex justify-between">
                            <span className="font-semibold text-amber-500 flex items-center gap-1">
                              ⭐ {review.globalRating}/10
                            </span>

                            <span className="text-gray-500 text-sm">
                              {formatDate(review.date || review.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>

                          {review.images && review.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {review.images.map((img) => (
                                <img
                                  key={img}
                                  src={img}
                                  className="rounded-lg h-24 w-full object-cover"
                                />
                              ))}
                            </div>
                          )}

                          <button className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100">
                            👍 {review.likes || 0}
                          </button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No reviews available yet.</p>
                  )}
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-black/5 bg-gray-50 p-5">
                  <h2 className="text-base font-semibold">Contact & location</h2>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    {locationInfo?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A5F]" />
                        <span>{locationInfo.address}</span>
                      </div>
                    )}
                    {locationInfo?.city && (
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A5F]" />
                        <span>{locationInfo.city}</span>
                      </div>
                    )}
                    {contact?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A5F]" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact?.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A5F]" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {!locationInfo?.address &&
                      !locationInfo?.city &&
                      !contact?.phone &&
                      !contact?.email && (
                        <p className="text-sm text-gray-500">No contact information available.</p>
                      )}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50 p-5">
                  <h2 className="text-base font-semibold">Highlights</h2>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Total visits
                      </div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(stats?.totalVisits)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Average points per visit
                      </div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(stats?.averagePointsPerVisit)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Total revenue
                      </div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">
                        {formatNumber(stats?.totalRevenue)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/map', { state: { openRestaurantId: displayId } })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#FF4A4F]"
                >
                  <MapPin className="h-4 w-4" />
                  Open on map
                </button>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
