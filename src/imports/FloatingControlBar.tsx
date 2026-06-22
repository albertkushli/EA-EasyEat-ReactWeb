import React from 'react';

export default function FloatingControlBar(props: {
  controls: any[];
  position: string;
  compact: boolean;
}) {
  return (
    <div
      className={`absolute z-10 bg-white p-2 rounded shadow ${props.position === 'bottom-right' ? 'bottom-4 right-4' : ''}`}
    >
      {props.controls.map((ctrl, i) => (
        <button key={i} onClick={ctrl.onClick} title={ctrl.tooltip} className="p-2">
          {ctrl.icon}
        </button>
      ))}
    </div>
  );
}
