import React from 'react';

export default function MapOverlay(props: {
  restaurantCount: number;
  nearbyCount: number;
  isLoading: boolean;
}) {
  if (props.isLoading) return null;
  return (
    <div className="absolute top-20 left-4 z-10 bg-white p-4 rounded shadow">
      <p>Restaurants: {props.restaurantCount}</p>
      <p>Nearby: {props.nearbyCount}</p>
    </div>
  );
}
