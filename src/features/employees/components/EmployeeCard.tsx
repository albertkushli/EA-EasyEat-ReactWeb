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
    visits: safeToNumber(employee?.stats?.totalVisits ?? employee?.stats?.visits ?? employee?.visits, 0),
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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group w-full min-h-[140px]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-100 group-hover:rotate-3 transition-transform duration-300 flex-shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-800 truncate leading-tight">{profile.name}</h3>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${roleClass}`}>
                {profile.role}
              </span>
            </div>
            <div className="flex flex-col text-sm text-gray-400 gap-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>{profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50 justify-between sm:justify-end">
          <div className="flex items-center gap-6 pr-6 sm:border-r border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-800 mb-0.5">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-lg font-black">{stats.visits}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('dashboard.customer.stats.visits')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-800 mb-0.5">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-lg font-black">{CURRENCY_FORMATTER.format(stats.revenue)}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('analytics.export.rewards')}</p>
            </div>
            <div className="text-center hidden lg:block">
              <div className="flex items-center justify-center gap-1.5 text-gray-800 mb-0.5">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-lg font-black">{stats.rating.toFixed(1)}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('components.trends.rating')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(employee)}
              className="p-3 rounded-2xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
              title={t('employees.editEmployee')}
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete?.(employee?._id)}
              className="p-3 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title={t('employees.errorDelete')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}