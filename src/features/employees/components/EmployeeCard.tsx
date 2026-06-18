import { Mail, Phone, Edit2, Trash2, Star, TrendingUp, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type EmployeeProfile = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type EmployeeStats = {
  totalVisits?: number;
  visits?: number;
  revenue?: number;
  averageRating?: number;
};

type EmployeeCardEmployee = {
  _id?: string;
  profile?: EmployeeProfile;
  stats?: EmployeeStats;
  visits?: number;
  rating?: number;
};

interface EmployeeCardProps {
  employee?: EmployeeCardEmployee;
  onEdit?: (employee?: EmployeeCardEmployee) => void;
  onDelete?: (employeeId?: string) => void;
}

function safeToNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const { t } = useTranslation();

  const profile = {
    name: employee?.profile?.name || t('components.employeeCard.noName'),
    email: employee?.profile?.email || t('components.employeeCard.noEmail'),
    phone: employee?.profile?.phone || t('components.employeeCard.noPhone'),
    role: employee?.profile?.role || 'staff',
  };

  const stats = {
    visits: safeToNumber(
      employee?.stats?.totalVisits ?? employee?.stats?.visits ?? employee?.visits,
      0,
    ),
    revenue: safeToNumber(employee?.stats?.revenue ?? 0, 0),
    rating: safeToNumber(employee?.stats?.averageRating ?? employee?.rating, 0),
  };

  const avatarLetter = profile.name?.[0]?.toUpperCase() || '?';

  const roleColors: Record<string, string> = {
    owner: 'bg-purple-50 text-purple-600 border-purple-100',
    admin: 'bg-blue-50 text-blue-600 border-blue-100',
    staff: 'bg-green-50 text-green-600 border-green-100',
  };

  const roleClass = roleColors[profile.role || 'staff'] || roleColors.staff;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 w-full relative overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-100 shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-800 truncate m-0 p-0 leading-tight">
                {profile.name}
              </h3>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap shrink-0 ${roleClass}`}
              >
                {profile.role}
              </span>
            </div>
            <div className="flex flex-col text-sm text-gray-400 gap-0.5">
              <div className="flex items-center gap-1.5 w-full">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-1.5 w-full">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit?.(employee)}
            className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title={t('employees.editEmployee')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(employee?._id)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title={t('employees.errorDelete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-800 mb-0.5">
            <TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-base font-black truncate">{stats.visits}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
            {t('dashboard.customer.stats.visits')}
          </p>
        </div>
        <div className="text-center border-l border-r border-gray-100">
          <div className="flex items-center justify-center gap-1 text-gray-800 mb-0.5">
            <DollarSign className="w-4 h-4 text-green-500 shrink-0" />
            <span className="text-base font-black truncate">
              {CURRENCY_FORMATTER.format(stats.revenue)}
            </span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
            {t('analytics.export.rewards')}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-800 mb-0.5">
            <Star className="w-4 h-4 text-yellow-400 fill-current shrink-0" />
            <span className="text-base font-black truncate">{stats.rating.toFixed(1)}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
            {t('components.trends.rating')}
          </p>
        </div>
      </div>
    </div>
  );
}
