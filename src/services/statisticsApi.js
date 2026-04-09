const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

function buildApiUrl(endpoint, query) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const dedupedEndpoint = API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')
    ? cleanEndpoint.slice(4)
    : cleanEndpoint;
  const url = new URL(`${API_BASE_URL}${dedupedEndpoint}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, { token, query } = {}) {
  const response = await fetch(buildApiUrl(endpoint, query), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeKpis(data) {
  return {
    totalPointsGiven: asNumber(data?.totalPointsGiven ?? data?.totalPoints),
    loyalCustomers: asNumber(data?.loyalCustomers ?? data?.customersCount),
    averagePointsPerVisit: asNumber(data?.averagePointsPerVisit ?? data?.avgPointsPerVisit),
  };
}

function normalizeVisits(data, startHour = 10, endHour = 23) {
  const source = Array.isArray(data) ? data : data?.data ?? [];

  const totalsByHour = source.reduce((acc, item) => {
    const hour = asNumber(item?.hour ?? item?._id ?? item?.h);
    const total = asNumber(item?.total ?? item?.count ?? item?.visits);
    if (hour >= 0 && hour <= 23) {
      acc[hour] = total;
    }
    return acc;
  }, {});

  const normalized = [];
  for (let hour = startHour; hour <= endHour; hour += 1) {
    normalized.push({ hour, total: totalsByHour[hour] ?? 0 });
  }

  return normalized;
}

function normalizeRatings(data) {
  const source = data?.data ?? data;

  if (Array.isArray(source)) {
    return source.map((item) => ({
      name: item?.name ?? item?.category ?? 'Categoría',
      value: Number(asNumber(item?.value ?? item?.avg).toFixed(1)),
    }));
  }

  const categories = [
    { key: 'foodQuality', name: 'Comida' },
    { key: 'staffService', name: 'Atención' },
    { key: 'cleanliness', name: 'Limpieza' },
    { key: 'environment', name: 'Ambiente' },
  ];

  return categories.map(({ key, name }) => ({
    name,
    value: Number(asNumber(source?.[key]).toFixed(1)),
  }));
}

export const getRestaurantById = async (restaurantId, token) => (
  apiFetch(`/restaurants/${restaurantId}`, { token })
);

export const getRecentVisits = async (restaurantId, token, limit = 5) => {
  const visits = await apiFetch('/visits', { token, query: { restaurant_id: restaurantId } });
  return (Array.isArray(visits) ? visits : [])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getRestaurantKpis = async (restaurantId, token) => {
  const data = await apiFetch(`/statistics/kpis/${restaurantId}`, { token });
  return normalizeKpis(data);
};

export const getVisitsPerHour = async (token, { restaurantId, startHour = 10, endHour = 23 } = {}) => {
  const data = await apiFetch('/statistics/visits-per-hour', {
    token,
    query: { restaurant_id: restaurantId },
  });
  return normalizeVisits(data, startHour, endHour);
};

export const getAverageRatingsByRestaurant = async (restaurantId, token) => {
  const data = await apiFetch(`/statistics/ratings/${restaurantId}`, { token });
  return normalizeRatings(data);
};