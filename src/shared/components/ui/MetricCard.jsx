import React from 'react';

export default function MetricCard({ icon, value, label, variant = 'default' }) {
  const variants = {
    visits: 'from-orange-50 to-orange-100/50 text-orange-600 border-orange-100',
    customers: 'from-blue-50 to-blue-100/50 text-blue-600 border-blue-100',
    rating: 'from-yellow-50 to-yellow-100/50 text-yellow-600 border-yellow-100',
    default: 'from-gray-50 to-gray-100/50 text-gray-600 border-gray-100'
  };

  const bgClass = variants[variant] || variants.default;

  return (
    <div className={`bg-gradient-to-br ${bgClass} border rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}>
      <div className="p-4 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
        {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
      </div>
      <div>
        <span className="block text-3xl font-black tracking-tight text-gray-800">
          {value}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1 block">
          {label}
        </span>
      </div>
    </div>
  );
}
