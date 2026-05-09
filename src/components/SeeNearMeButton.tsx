import React from 'react';
import { MapPin } from 'lucide-react';

type Props = {
  onClick: () => void;
  title?: string;
};

export const SeeNearMeButton: React.FC<Props> = ({ onClick, title = 'See Near Me' }) => {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-28 z-40 bg-white shadow-lg rounded-full p-3 flex items-center gap-2 touch-manipulation"
      aria-label={title}
    >
      <MapPin className="w-5 h-5 text-orange-500" />
      <span className="hidden sm:inline text-sm font-medium">{title}</span>
    </button>
  );
};

export default SeeNearMeButton;

