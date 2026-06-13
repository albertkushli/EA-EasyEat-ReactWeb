import { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Target,
  Zap,
  Download,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getRewardsByRestaurant, fetchRedemptionsByRestaurant } from '@/services/reward.service';
import { useTranslation } from 'react-i18next';

interface AnalyticsProps {
  visits: any[];
  restaurantId: string;
}

export default function Analytics({ visits, restaurantId }: AnalyticsProps) {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  // DEBUG: Log data received from backend
  useEffect(() => {
    console.log('📊 [Analytics] Data received:', {
      visitsCount: visits.length,
      restaurantId,
      firstVisit: visits[0],
      rewardsCount: rewards.length,
      redemptionsCount: redemptions.length,
    });
  }, [visits, rewards, redemptions, restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rewardData, redemptionData] = await Promise.all([
        getRewardsByRestaurant(restaurantId),
        fetchRedemptionsByRestaurant(restaurantId),
      ]);
      setRewards(rewardData);
      setRedemptions(redemptionData);
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(t('analytics.errorLoading') || 'No se pudieron cargar algunos datos de análisis.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const stats = useMemo(() => {
    if (!visits || visits.length === 0)
      return {
        totalVisits: 0,
        visitsVar: 0,
        uniqueCustomers: 0,
        customersVar: 0,
        revenue: 0,
        revenueVar: 0,
        retentionRate: 0,
        totalRewards: 0,
        totalPointsEarned: 0,
        loyaltyRoi: 'Sin datos',
        prediction: 0,
      };

    const restaurantVisits = visits.filter((visit) => {
      const vRestId = String(visit.restaurant_id?._id || visit.restaurant_id || '').toLowerCase();
      const rId = String(restaurantId || '').toLowerCase();
      return vRestId === rId && visit.deletedAt === null;
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const lastMonthVisits = restaurantVisits.filter(
      (v) => new Date(v.date || v.createdAt) >= thirtyDaysAgo,
    );
    const prevMonthVisits = restaurantVisits.filter((v) => {
      const d = new Date(v.date || v.createdAt);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const getUniqueCustomers = (vList: any[]) =>
      new Set(vList.map((v) => String(v.customer_id?._id || v.customer_id))).size;

    const uniqueCustomers = getUniqueCustomers(restaurantVisits);
    const lastMonthUniqueCustomers = getUniqueCustomers(lastMonthVisits);
    const prevUniqueCustomers = getUniqueCustomers(prevMonthVisits);

    // Retention: Customers with more than 1 visit ever
    const customerVisitCounts = restaurantVisits.reduce((acc: any, v) => {
      const id = String(v.customer_id?._id || v.customer_id);
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    const recurrentCustomers = Object.values(customerVisitCounts).filter(
      (count: any) => count > 1,
    ).length;

    const revenue = restaurantVisits.reduce((sum, v) => sum + Number(v.billAmount || 0), 0);
    const lastMonthRevenue = lastMonthVisits.reduce((sum, v) => sum + Number(v.billAmount || 0), 0);
    const prevRevenue = prevMonthVisits.reduce((sum, v) => sum + Number(v.billAmount || 0), 0);

    const totalPointsEarned = restaurantVisits.reduce(
      (sum, v) => sum + Number(v.pointsEarned || 0),
      0,
    );

    const totalRedemptions = redemptions.filter(
      (r) => r.status === 'redeemed' || r.status === 'approved',
    ).length;

    const calcVar = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // Simple ROI: Revenue / (Redemptions * estimated cost 5€)
    const estimatedCostPerRedemption = 5;
    const roi =
      totalRedemptions > 0
        ? (revenue / (totalRedemptions * estimatedCostPerRedemption)).toFixed(1) + 'x'
        : 'Sin datos';

    // Simple Prediction: (Last Month Visits + Total Visits / 2) * 1.1 (growth)
    const prediction = Math.round((lastMonthVisits.length || restaurantVisits.length) * 1.1);

    return {
      totalVisits: restaurantVisits.length,
      visitsVar: calcVar(lastMonthVisits.length, prevMonthVisits.length),
      uniqueCustomers,
      customersVar: calcVar(lastMonthUniqueCustomers, prevUniqueCustomers),
      revenue,
      revenueVar: calcVar(lastMonthRevenue, prevRevenue),
      retentionRate: uniqueCustomers > 0 ? (recurrentCustomers / uniqueCustomers) * 100 : 0,
      totalRewards: totalRedemptions,
      totalPointsEarned,
      loyaltyRoi: roi,
      prediction,
    };
  }, [visits, rewards, redemptions, restaurantId]);

  // Chart Data (Real data grouping by day)
  const chartData = useMemo(() => {
    const data: any[] = [];

    // 1. Filtrar visitas válidas para este restaurante
    const restaurantVisits = visits.filter((v) => {
      const vRestId = String(v.restaurant_id?._id || v.restaurant_id || '').toLowerCase();
      const rId = String(restaurantId || '').toLowerCase();
      return vRestId === rId && v.deletedAt === null;
    });

    // 2. Filtrar canjes válidos
    const restaurantRedemptions = redemptions.filter((r) => {
      const rRestId = String(r.restaurant_id?._id || r.restaurant_id || '').toLowerCase();
      const rId = String(restaurantId || '').toLowerCase();
      return rRestId === rId;
    });

    if (restaurantVisits.length === 0) return [];

    // 3. Función segura para obtener la clave del día (YYYY-MM-DD)
    const getDayKey = (dateStr: string) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };

    // 4. Mapear datos por día
    const statsByDay = new Map<string, { visitas: number; recompensas: number }>();

    restaurantVisits.forEach((v) => {
      const key = getDayKey(v.date || v.createdAt);
      if (!key) return;
      const current = statsByDay.get(key) || { visitas: 0, recompensas: 0 };
      statsByDay.set(key, { ...current, visitas: current.visitas + 1 });
    });

    restaurantRedemptions.forEach((r) => {
      const key = getDayKey(r.redeemedAt || r.createdAt);
      if (!key) return;
      const current = statsByDay.get(key) || { visitas: 0, recompensas: 0 };
      statsByDay.set(key, { ...current, recompensas: current.recompensas + 1 });
    });

    // 5. Calcular el rango: 30 días desde la última visita
    const visitDates = restaurantVisits.map((v) => new Date(v.date || v.createdAt).getTime());
    const maxVisitTime = Math.max(...visitDates);
    const endDate = new Date(maxVisitTime);

    // 6. Generar los 30 días exactos
    for (let i = 29; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      const dayStats = statsByDay.get(key) || { visitas: 0, recompensas: 0 };

      const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      data.push({
        name: dateStr,
        visitas: dayStats.visitas,
        recompensas: dayStats.recompensas,
      });
    }

    return data;
  }, [visits, redemptions, restaurantId]);

  const exportData = () => {
    const csv = [
      [t('analytics.export.date'), t('analytics.export.visits'), t('analytics.export.rewards')],
      ...chartData.map((d) => [d.name, d.visitas, d.recompensas]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'analytics_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium tracking-tight">{t('analytics.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-6 bg-red-50 rounded-[2rem] border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h3 className="text-lg font-black text-red-800 uppercase tracking-tight">
          {t('analytics.errorTitle')}
        </h3>
        <p className="text-red-600 text-center text-sm font-medium">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
        >
          {t('analytics.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-500 font-medium">{t('analytics.subtitle')}</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          {t('analytics.exportData')}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={t('analytics.kpi.retention')}
          value={`${stats.retentionRate.toFixed(1)}%`}
          variation={stats.visitsVar}
          icon={Target}
          gradient="from-blue-600 to-indigo-700"
        />
        <KPICard
          title={t('analytics.kpi.activeCustomers')}
          value={stats.uniqueCustomers}
          variation={stats.customersVar}
          icon={Users}
          gradient="from-emerald-500 to-teal-600"
        />
        <KPICard
          title={t('analytics.kpi.revenue')}
          value={`${stats.revenue.toFixed(0)}€`}
          variation={stats.revenueVar}
          icon={CreditCard}
          gradient="from-orange-500 to-red-600"
        />
        <KPICard
          title={t('analytics.kpi.loyaltyRoi')}
          value={stats.loyaltyRoi}
          variation={stats.totalRewards > 0 ? 12.5 : 0}
          icon={Zap}
          gradient="from-purple-600 to-fuchsia-700"
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-800">{t('analytics.chart.title')}</h3>
              <p className="text-sm text-gray-400 font-medium italic">
                {t('analytics.chart.subtitle')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  {t('analytics.chart.visits')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  {t('analytics.chart.rewards')}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 800,
                  }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area
                  type="monotone"
                  dataKey="visitas"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
                <Area
                  type="monotone"
                  dataKey="recompensas"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRewards)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Predicciones */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {t('analytics.prediction.title')}
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                    {t('analytics.prediction.nextMonth')}
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">{stats.prediction}</span>
                    <span className="text-emerald-400 font-bold mb-1 flex items-center">
                      <ArrowUpRight className="w-4 h-4" /> 10%
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-1 font-bold">
                    {t('analytics.prediction.growthTagline')}
                  </p>
                </div>

                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
          </div>

          {/* Alert Alerts */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">
              {t('analytics.alerts.title')}
            </h4>
            {stats.visitsVar < 0 ? (
              <SmartAlert
                type="warning"
                message={t('analytics.alerts.visitsDrop')}
                icon={AlertTriangle}
              />
            ) : (
              <SmartAlert
                type="success"
                message={t('analytics.alerts.recurrenceIncrease')}
                icon={TrendingUp}
              />
            )}
            {stats.totalRewards > 0 && (
              <SmartAlert type="info" message={t('analytics.alerts.newSegment')} icon={Users} />
            )}
            {stats.totalVisits === 0 && (
              <SmartAlert type="info" message="Sin alertas por ahora" icon={AlertTriangle} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, variation, icon: Icon, gradient }: any) {
  const isPositive = variation >= 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative p-6 rounded-[2rem] bg-gradient-to-br ${gradient} text-white shadow-lg overflow-hidden group`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
            <Icon className="w-5 h-5" />
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${isPositive ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(variation).toFixed(1)}%
          </div>
        </div>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
    </motion.div>
  );
}

function SmartAlert({ type, message, icon: Icon }: any) {
  const colors = {
    warning: 'bg-orange-50 border-orange-200 text-orange-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border-l-4 ${colors[type as keyof typeof colors]} shadow-sm`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-bold tracking-tight">{message}</span>
    </div>
  );
}
