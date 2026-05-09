import React, { useEffect } from 'react';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { useNavigate } from 'react-router-dom';
import { Map } from 'lucide-react';
import type { Restaurant } from '@/types/Restaurant';

export default function DiscoverScreen() {
  const restaurants = useRestaurantStore((s: any) => s.restaurants);
  const load = useRestaurantStore((s: any) => s.loadRestaurants);
  const navigate = useNavigate();

  useEffect(() => { if (restaurants.length === 0) load(); }, [load, restaurants.length]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Discover</h2>
        <button
          onClick={() => navigate('/map')}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title="View map"
        >
          <Map size={24} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {restaurants.map((r: Restaurant) => (
          <button
            key={r._id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm text-left"
            onClick={() => navigate('/map', { state: { openRestaurantId: r._id } })}
          >
            <img src={r.profile.image?.[0] || ''} alt="" className="w-16 h-12 rounded-md object-cover" />
            <div>
              <div className="font-medium">{r.profile.name}</div>
              <div className="text-sm text-gray-500">{r.profile.category.join(', ')} • {r.profile.globalRating} ★</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

