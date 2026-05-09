import type { Restaurant } from '@/types/Restaurant';

// Example mock data around a sample location (Barcelona)
const BASE_LAT = 41.3851;
const BASE_LNG = 2.1734;

export async function fetchRestaurantsMock(): Promise<Restaurant[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500));

  const make = (i: number, offsetLat = 0, offsetLng = 0, nearby = false): Restaurant => ({
    id: `r_${i}`,
    name: [`La Taperia`, `Pasta Fresca`, `Sushi Zen`, `Burger Loft`, `Green Bowl`][i % 5] + ` ${i}`,
    lat: BASE_LAT + (Math.random() - 0.5) * 0.03 + offsetLat,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.03 + offsetLng,
    image: `https://picsum.photos/seed/restaurant_${i}/400/300`,
    cuisine: [`Spanish`, `Italian`, `Japanese`, `American`, `Vegan`][i % 5],
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    distanceKm: nearby ? Math.round(Math.random() * 2 * 10) / 10 : undefined,
    isNearby: nearby,
  });

  const items: Restaurant[] = [];
  for (let i = 0; i < 25; i++) {
    items.push(make(i));
  }

  // Add a few nearby ones clustered around a point
  for (let i = 25; i < 30; i++) {
    items.push(make(i, 0.001 * (i - 25), -0.001 * (i - 25), true));
  }

  return items;
}

