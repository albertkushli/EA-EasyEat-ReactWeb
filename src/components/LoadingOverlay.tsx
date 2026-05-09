import React from 'react';

export const LoadingOverlay: React.FC<{ show?: boolean }> = ({ show = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin" />
    </div>
  );
};

export default LoadingOverlay;

