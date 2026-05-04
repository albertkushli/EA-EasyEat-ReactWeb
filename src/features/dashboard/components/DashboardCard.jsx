export default function DashboardCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}