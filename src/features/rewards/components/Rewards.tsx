import { useEffect, useState } from "react";
import { Reward } from "../types/Reward";
import { getRewardsByRestaurant, createReward, updateReward, deleteReward } from "@/features/rewards/services/rewardService";
import { useAuth } from "@/context/AuthContext";
import {
  Gift,
  Star,
  Clock,
  AlertCircle,
  Loader2,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  BarChart3
} from "lucide-react";
import RewardModal from "@/features/rewards/components/RewardModal";

export default function Rewards() {
  const { user, restaurant } = useAuth() as any;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadRewards();
    } else {
      setLoading(false);
      setError("No se pudo identificar el restaurante del usuario.");
    }
  }, [restaurantId]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRewardsByRestaurant(restaurantId);
      setRewards(data);
    } catch (err: any) {
      console.error("Error loading rewards:", err);
      setError(err.message || "No se pudieron cargar las recompensas.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (rewardId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta recompensa?")) {
      try {
        await deleteReward(rewardId);
        setRewards(rewards.filter(r => r._id !== rewardId));
      } catch (err) {
        alert("Error al eliminar la recompensa");
      }
    }
  };

  const handleSaveReward = async (rewardData: Partial<Reward>) => {
    try {
      if (selectedReward) {
        const updated = await updateReward(selectedReward._id, { ...rewardData, restaurant_id: restaurantId });
        setRewards(rewards.map(r => r._id === selectedReward._id ? updated : r));
      } else {
        const created = await createReward({ ...rewardData, restaurant_id: restaurantId });
        setRewards([...rewards, created]);
      }
    } catch (err) {
      console.error("Error saving reward:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium tracking-tight">Cargando recompensas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-0">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Programa de Recompensas</h1>
          <p className="text-sm text-gray-500 font-medium">Gestiona los premios para tus clientes fieles</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>AÑADIR RECOMPENSA</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={loadRewards}
            className="ml-auto text-xs font-black uppercase tracking-widest hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && rewards.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800">No hay recompensas activas</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">Empieza creando recompensas para incentivar las visitas de tus clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward?._id}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Top Section: Icon & Actions */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-inner">
                  <Trophy className="w-6 h-6" />
                </div>
                
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                   <button 
                     onClick={() => handleEditClick(reward)}
                     className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-white transition-all" title="Editar">
                     <Edit2 className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => handleDeleteClick(reward._id)}
                     className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white transition-all" title="Eliminar">
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-gray-800 text-lg leading-tight group-hover:text-orange-600 transition-colors">
                    {reward?.name}
                  </h3>
                  <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${reward?.active
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                    }`}>
                    {reward?.active ? "Activo" : "Inactivo"}
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-snug">
                  {reward?.description || "Sin descripción disponible."}
                </p>
              </div>

              {/* Stats & Footer */}
              <div className="pt-4 border-t border-gray-50 mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Coste en puntos</p>
                    <div className="flex items-center gap-1.5 text-orange-500 font-black">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xl">{reward?.pointsRequired}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Canjeadas</p>
                    <div className="flex items-center justify-end gap-1.5 text-green-500 font-black">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xl">{reward?.timesRedeemed || 0}</span>
                    </div>
                  </div>
              </div>

              {reward?.expiry && (
                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Expira: {new Date(reward.expiry).toLocaleDateString()}</span>
                </div>
              )}

              {/* Decorative background element */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-50/50 rounded-full -z-0 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      )}

      {/* Reward Modal */}
      <RewardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReward}
        reward={selectedReward}
      />
    </div>
  );
}

