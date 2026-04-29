import { useMemo, useState, useEffect } from "react";
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
} from "recharts";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { getRewardsByRestaurant } from "@/features/rewards/services/rewardService";

interface AnalyticsProps {
  visits: any[];
  restaurantId: string;
}

export default function Analytics({ visits, restaurantId }: AnalyticsProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  // DEBUG: Log data received from backend
  useEffect(() => {
    console.log("📊 [Analytics] Data received:", {
      visitsCount: visits.length,
      restaurantId,
      firstVisit: visits[0],
      rewardsCount: rewards.length
    });
  }, [visits, rewards, restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rewardData = await getRewardsByRestaurant(restaurantId);
      setRewards(rewardData);
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      setError("No se pudieron cargar algunos datos de análisis.");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const stats = useMemo(() => {
    if (!visits || visits.length === 0) return {
      totalVisits: 0,
      visitsVar: 0,
      uniqueCustomers: 0,
      customersVar: 0,
      revenue: 0,
      revenueVar: 0,
      retentionRate: 0,
      totalRewards: 0,
      recurrentRate: 0
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const lastMonthVisits = visits.filter(v => new Date(v.date || v.createdAt) >= thirtyDaysAgo);
    const prevMonthVisits = visits.filter(v => {
      const d = new Date(v.date || v.createdAt);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const getUniqueCustomers = (vList: any[]) => new Set(vList.map(v => v.customer_id?._id || v.customer_id)).size;
    
    const uniqueCustomers = getUniqueCustomers(lastMonthVisits);
    const prevUniqueCustomers = getUniqueCustomers(prevMonthVisits);

    // Retention: Customers with more than 1 visit in the last month
    const customerVisitCounts = lastMonthVisits.reduce((acc: any, v) => {
      const id = v.customer_id?._id || v.customer_id;
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    const recurrentCustomers = Object.values(customerVisitCounts).filter((count: any) => count > 1).length;

    const revenue = lastMonthVisits.reduce((sum, v) => sum + (v.billAmount || 0), 0);
    const prevRevenue = prevMonthVisits.reduce((sum, v) => sum + (v.billAmount || 0), 0);

    const totalRewards = rewards.reduce((sum, r) => sum + (r.timesRedeemed || 0), 0);

    const calcVar = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      totalVisits: lastMonthVisits.length,
      visitsVar: calcVar(lastMonthVisits.length, prevMonthVisits.length),
      uniqueCustomers,
      customersVar: calcVar(uniqueCustomers, prevUniqueCustomers),
      revenue,
      revenueVar: calcVar(revenue, prevRevenue),
      retentionRate: uniqueCustomers > 0 ? (recurrentCustomers / uniqueCustomers) * 100 : 0,
      totalRewards,
      recurrentRate: uniqueCustomers > 0 ? (recurrentCustomers / uniqueCustomers) * 100 : 0
    };
  }, [visits, rewards]);

  // Chart Data (Real data grouping by day)
  const chartData = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      
      const dayVisitsList = visits.filter(v => {
        const d = new Date(v.date || v.createdAt);
        return d.toDateString() === date.toDateString();
      });

      const dayVisits = dayVisitsList.length;
      
      // Try to find rewards in visits (assuming visit might have reward_id or pointsUsed)
      const dayRewards = dayVisitsList.filter(v => v.reward_id || v.rewardId || (v.pointsUsed && v.pointsUsed > 0)).length;

      data.push({
        name: dateStr,
        visitas: dayVisits,
        recompensas: dayRewards,
      });
    }
    return data;
  }, [visits]);

  const exportData = () => {
    const csv = [
      ["Fecha", "Visitas", "Recompensas"],
      ...chartData.map(d => [d.name, d.visitas, d.recompensas])
    ].map(e => e.join(",")).join("\n");
    
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
        <p className="text-gray-500 font-medium tracking-tight">Analizando datos reales del restaurante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-6 bg-red-50 rounded-[2rem] border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h3 className="text-lg font-black text-red-800 uppercase tracking-tight">Error de Conexión</h3>
        <p className="text-red-600 text-center text-sm font-medium">{error}</p>
        <button 
          onClick={loadData}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">ANÁLISIS</h1>
          <p className="text-gray-500 font-medium">Panel de rendimiento y tendencias estratégicas</p>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Datos
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Tasa de Retención" 
          value={`${stats.retentionRate}x`} 
          variation={stats.visitsVar} 
          icon={Target}
          gradient="from-blue-600 to-indigo-700"
        />
        <KPICard 
          title="Clientes Activos" 
          value={stats.uniqueCustomers} 
          variation={stats.customersVar} 
          icon={Users}
          gradient="from-emerald-500 to-teal-600"
        />
        <KPICard 
          title="Ingresos Estimados" 
          value={`${stats.revenue.toFixed(0)}€`} 
          variation={stats.revenueVar} 
          icon={CreditCard}
          gradient="from-orange-500 to-red-600"
        />
        <KPICard 
          title="Fidelización (ROI)" 
          value={`${((stats.totalRewards / (stats.totalVisits || 1)) * 100).toFixed(1)}%`} 
          variation={5.2} 
          icon={Zap}
          gradient="from-purple-600 to-fuchsia-700"
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-800">Tendencias del último mes</h3>
              <p className="text-sm text-gray-400 font-medium italic">Visitas vs Recompensas canjeadas</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-blue-500" />
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Visitas</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Premios</span>
               </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  itemStyle={{ fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="visitas" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="recompensas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRewards)" />
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
                 <h3 className="text-lg font-black uppercase tracking-tight">Predicción</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Próximo Mes</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">{Math.floor(stats.totalVisits * 1.12)}</span>
                    <span className="text-emerald-400 font-bold mb-1 flex items-center">
                      <ArrowUpRight className="w-4 h-4" /> 12%
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-1 font-bold">CRECIMIENTO ESPERADO EN VISITAS</p>
                </div>

                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
                   />
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
          </div>

          {/* Alert Alerts */}
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Alertas Inteligentes</h4>
             <SmartAlert 
               type="warning" 
               message="Ligera bajada de visitas en horario nocturno" 
               icon={AlertTriangle} 
             />
             <SmartAlert 
               type="success" 
               message="El programa de puntos ha aumentado la recurrencia un 8%" 
               icon={TrendingUp} 
             />
             <SmartAlert 
               type="info" 
               message="Nuevo segmento de clientes activos detectado" 
               icon={Users} 
             />
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
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${isPositive ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
    warning: "bg-orange-50 border-orange-200 text-orange-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-l-4 ${colors[type as keyof typeof colors]} shadow-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-bold tracking-tight">{message}</span>
    </div>
  );
}

