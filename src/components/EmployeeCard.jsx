// ════════════════════════════════════════════════
// FORMATTERS (Funciones de formato centralizadas)
// ════════════════════════════════════════════════

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════

/**
 * Convierte un valor a número con fallback seguro
 * @param {any} value - Valor a convertir
 * @param {number} fallback - Valor por defecto si no es número
 * @returns {number}
 */
function safeToNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Extrae datos del perfil de un empleado con valores por defecto
 * @param {Object} employee - Objeto empleado
 * @returns {Object} Datos del perfil normalizados
 */
function extractEmployeeProfile(employee) {
  const profile = employee?.profile || {};
  return {
    name: profile?.name || 'Sin nombre',
    email: profile?.email || 'Sin email',
    phone: profile?.phone || 'Sin teléfono',
    role: profile?.role || 'staff',
  };
}

/**
 * Extrae estadísticas de un empleado con valores por defecto
 * Soporta múltiples estructuras de datos desde el backend
 * Si no hay stats.revenue, calcula desde las visitas del empleado
 * @param {Object} employee - Objeto empleado
 * @param {Array} visits - Array de visitas (para fallback de cálculo)
 * @returns {Object} Estadísticas normalizadas
 */
function extractEmployeeStats(employee, visits = []) {
  const stats = employee?.stats || {};
  
  // Busca visitas en diferentes propiedades posibles
  let visits_count = safeToNumber(stats?.visits, 0);
  if (visits_count === 0) visits_count = safeToNumber(stats?.totalVisits, 0);
  if (visits_count === 0) visits_count = safeToNumber(stats?.visit_count, 0);
  if (visits_count === 0) visits_count = safeToNumber(employee?.visits, 0);

  // Busca revenue/ingresos en diferentes propiedades
  let revenue = safeToNumber(stats?.revenue, 0);
  if (revenue === 0) revenue = safeToNumber(stats?.totalRevenue, 0);
  if (revenue === 0) revenue = safeToNumber(stats?.bill_amount, 0);
  if (revenue === 0) revenue = safeToNumber(employee?.revenue, 0);

  // FALLBACK: Si no hay revenue en stats, calcula desde visitas del empleado
  if (revenue === 0 && visits && visits.length > 0) {
    const employeeVisits = visits.filter(
      (v) =>
        String(v.employee_id) === String(employee?._id) &&
        !v.deletedAt
    );
    revenue = employeeVisits.reduce((sum, v) => sum + (v.billAmount || 0), 0);
    visits_count = employeeVisits.length;
  }

  // Rating promedio
  let rating = safeToNumber(stats?.averageRating, 0);
  if (rating === 0) rating = safeToNumber(stats?.average_rating, 0);
  if (rating === 0) rating = safeToNumber(stats?.rating, 0);
  if (rating === 0) rating = safeToNumber(employee?.rating, 0);

  return {
    visits: visits_count,
    revenue,
    rating,
  };
}

/**
 * Determina el estado del empleado (Activo/Inactivo)
 * @param {Object} employee - Objeto empleado
 * @returns {Object} Estado y clase CSS
 */
function extractEmployeeStatus(employee) {
  const isActive = Boolean(employee?.active);
  return {
    isActive,
    label: isActive ? 'Activo' : 'Inactivo',
    className: isActive ? 'he-active' : 'he-inactive',
  };
}

// ════════════════════════════════════════════════
// COMPONENTES
// ════════════════════════════════════════════════

/**
 * Sección de información personal del empleado
 */
function EmployeeInfo({ profile }) {
  return (
    <div className="he-employee-left">
      <span className="he-employee-name">{profile.name}</span>
      <span className={`he-role-pill he-role-${profile.role}`}>
        {profile.role.toUpperCase()}
      </span>
      <span className="he-employee-sub">{profile.email}</span>
      <span className="he-employee-sub">{profile.phone}</span>
    </div>
  );
}

/**
 * Sección de estadísticas del empleado
 */
function EmployeeStats({ stats }) {
  return (
    <div className="he-employee-center">
      <span className="he-employee-metric he-employee-visits">
        📊 {stats.visits} visitas
      </span>
      <span className="he-employee-metric he-employee-revenue">
        💰 {CURRENCY_FORMATTER.format(stats.revenue)}
      </span>
      <span className="he-employee-metric he-employee-rating">
        ⭐ {stats.rating.toFixed(1)} / 10
      </span>
    </div>
  );
}

/**
 * Sección de estado del empleado
 */
function EmployeeStatusBadge({ status }) {
  return (
    <div className="he-employee-right">
      <span className={status.className}>
        {status.label}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════

/**
 * Tarjeta de empleado con información, stats y estado
 * @param {Object} props
 * @param {Object} props.employee - Datos del empleado (profile, stats, active)
 * @param {Array} props.visits - Array de visitas (opcional, para fallback de cálculo)
 */
export default function EmployeeCard({ employee, visits = [] }) {
  // Extrae datos de forma segura
  const profile = extractEmployeeProfile(employee);
  const stats = extractEmployeeStats(employee, visits);
  const status = extractEmployeeStatus(employee);

  // Genera key única para el avatar
  const avatarLetter = profile.name?.[0]?.toUpperCase() || '?';

  return (
    <article className="he-employee-card">
      {/* Avatar */}
      <div className="he-employee-avatar">
        {avatarLetter}
      </div>

      {/* Contenido */}
      <div className="he-employee-content">
        <EmployeeInfo profile={profile} />
        <EmployeeStats stats={stats} />
        <EmployeeStatusBadge status={status} />
      </div>
    </article>
  );
}