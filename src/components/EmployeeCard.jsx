import { User, Mail, Phone, Shield, Edit2, Trash2, Star, TrendingUp, DollarSign } from 'lucide-react';

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function safeToNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractEmployeeProfile(employee) {
  const profile = employee?.profile || {};
  return {
    name: profile?.name || 'Sin nombre',
    email: profile?.email || 'Sin email',
    phone: profile?.phone || 'Sin teléfono',
    role: profile?.role || 'staff',
  };
}

function extractEmployeeStats(employee, visits = []) {
  const stats = employee?.stats || {};
  let visits_count = safeToNumber(stats?.visits || stats?.totalVisits || stats?.visit_count || employee?.visits, 0);
  let revenue = safeToNumber(stats?.revenue || stats?.totalRevenue || stats?.bill_amount || employee?.revenue, 0);

  if (revenue === 0 && visits?.length > 0) {
    const employeeVisits = visits.filter(v => String(v.employee_id) === String(employee?._id) && !v.deletedAt);
    revenue = employeeVisits.reduce((sum, v) => sum + (v.billAmount || 0), 0);
    visits_count = employeeVisits.length;
  }

  let rating = safeToNumber(stats?.averageRating || stats?.average_rating || stats?.rating || employee?.rating, 0);

  return { visits: visits_count, revenue, rating };
}

export default function EmployeeCard({ employee, visits = [], onEdit, onDelete }) {
  const profile = extractEmployeeProfile(employee);
  const stats = extractEmployeeStats(employee, visits);
  const avatarLetter = profile.name?.[0]?.toUpperCase() || '?';

  const roleColors = {
    owner: 'bg-purple-50 text-purple-600 border-purple-100',
    admin: 'bg-blue-50 text-blue-600 border-blue-100',
    staff: 'bg-green-50 text-green-600 border-green-100',
  };

  const roleClass = roleColors[profile.role] || roleColors.staff;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform duration-300">
            {avatarLetter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{profile.name}</h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleClass}`}>
                {profile.role}
              </span>
            </div>
            <div className="flex flex-col text-xs text-gray-500 mt-0.5 gap-0.5">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-6 px-4 md:border-x border-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-800">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-bold">{stats.visits}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Visitas</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-800">
              <DollarSign className="w-3.5 h-3.5 text-green-500" />
              <span className="font-bold">{CURRENCY_FORMATTER.format(stats.revenue)}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ventas</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-800">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span className="font-bold">{stats.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Rating</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(employee)}
            className="p-2.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => onDelete?.(employee?._id)}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
