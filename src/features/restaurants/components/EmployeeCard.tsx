import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { IEmployeeStats, IVisit } from '../types';

// ════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════

interface EmployeeProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface EmployeeStatsData {
  visits: number;
  revenue: number;
  rating: number;
}

interface EmployeeStatus {
  isActive: boolean;
  label: string;
  className: string;
}

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════

function safeToNumber(value: any, fallback: number = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractEmployeeProfile(employee: IEmployeeStats, t: any): EmployeeProfile {
  const profile = employee?.profile as any || {};
  return {
    name: profile?.name || employee?.name || t('components.employeeCard.noName'),
    email: profile?.email || employee?.email || t('components.employeeCard.noEmail'),
    phone: profile?.phone || t('components.employeeCard.noPhone'),
    role: profile?.role || employee?.role || 'staff',
  };
}

function extractEmployeeStats(employee: IEmployeeStats, visits: IVisit[] = []): EmployeeStatsData {
  const stats = (employee as any)?.stats || {};

  let visits_count = safeToNumber(stats?.visits, 0);
  if (visits_count === 0) visits_count = safeToNumber(stats?.totalVisits, 0);
  if (visits_count === 0) visits_count = safeToNumber(stats?.visit_count, 0);
  if (visits_count === 0) visits_count = safeToNumber((employee as any)?.visits, 0);

  let revenue = safeToNumber(stats?.revenue, 0);
  if (revenue === 0) revenue = safeToNumber(stats?.totalRevenue, 0);
  if (revenue === 0) revenue = safeToNumber(stats?.bill_amount, 0);
  if (revenue === 0) revenue = safeToNumber((employee as any)?.revenue, 0);

  if (revenue === 0 && visits && visits.length > 0) {
    const employeeVisits = visits.filter(
      (v) =>
        String((v as any).employee_id) === String(employee?._id) &&
        !(v as any).deletedAt
    );
    revenue = employeeVisits.reduce((sum, v) => sum + ((v as any).billAmount || 0), 0);
    visits_count = employeeVisits.length;
  }

  let rating = safeToNumber(stats?.averageRating, 0);
  if (rating === 0) rating = safeToNumber(stats?.average_rating, 0);
  if (rating === 0) rating = safeToNumber(stats?.rating, 0);
  if (rating === 0) rating = safeToNumber((employee as any)?.rating, 0);

  return {
    visits: visits_count,
    revenue,
    rating,
  };
}

function extractEmployeeStatus(employee: IEmployeeStats, t: any): EmployeeStatus {
  const isActive = Boolean((employee as any)?.active);
  return {
    isActive,
    label: isActive ? t('components.employeeCard.active') : t('components.employeeCard.inactive'),
    className: isActive ? 'he-active' : 'he-inactive',
  };
}

// ════════════════════════════════════════════════
// SUBCOMPONENTS
// ════════════════════════════════════════════════

const EmployeeInfo: FC<{ profile: EmployeeProfile }> = ({ profile }) => (
  <div className="he-employee-left">
    <span className="he-employee-name">{profile.name}</span>
    <span className={`he-role-pill he-role-${profile.role}`}>
      {profile.role.toUpperCase()}
    </span>
    <span className="he-employee-sub">{profile.email}</span>
    <span className="he-employee-sub">{profile.phone}</span>
  </div>
);

const EmployeeStats: FC<{ stats: EmployeeStatsData; locale: string; t: any }> = ({
  stats,
  locale,
  t,
}) => {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="he-employee-center">
      <span className="he-employee-metric he-employee-visits">
        📊 {stats.visits} {t('components.employeeCard.visits')}
      </span>
      <span className="he-employee-metric he-employee-revenue">
        💰 {currencyFormatter.format(stats.revenue)}
      </span>
      <span className="he-employee-metric he-employee-rating">
        ⭐ {stats.rating.toFixed(1)} / 10
      </span>
    </div>
  );
};

const EmployeeStatusBadge: FC<{ status: EmployeeStatus }> = ({ status }) => (
  <div className="he-employee-right">
    <span className={status.className}>{status.label}</span>
  </div>
);

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════

interface EmployeeCardProps {
  employee: IEmployeeStats;
  visits?: IVisit[];
}

const EmployeeCard: FC<EmployeeCardProps> = ({ employee, visits = [] }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const profile = extractEmployeeProfile(employee, t);
  const stats = extractEmployeeStats(employee, visits);
  const status = extractEmployeeStatus(employee, t);

  const avatarLetter = profile.name?.[0]?.toUpperCase() || '?';

  return (
    <article className="he-employee-card">
      <div className="he-employee-avatar">{avatarLetter}</div>

      <div className="he-employee-content">
        <EmployeeInfo profile={profile} />
        <EmployeeStats stats={stats} locale={locale} t={t} />
        <EmployeeStatusBadge status={status} />
      </div>
    </article>
  );
};

export default EmployeeCard;