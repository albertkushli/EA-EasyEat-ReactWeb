import React from 'react';

export default function SeeNearMeButton(props: { onClick: any; title: string; loading: boolean }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg"
    >
      {props.loading ? 'Loading...' : props.title}
    </button>
  );
}
