import { useEffect, useState } from "react";
import { getDishesByRestaurant, createDish, updateDish, deleteDish } from "@/features/dishes/services/dishService";
import { Dish } from "@/types/Dish";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronDown,
  Info,
  Euro,
  Clock,
  AlertCircle,
  Loader2,
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Flame,
  Leaf
} from "lucide-react";
import DishModal from "@/features/dishes/components/DishModal";

export default function Dishes() {
  const { user, restaurant } = useAuth() as any;
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadDishes();
    } else {
      setLoading(false);
      setError("No se pudo identificar el restaurante del usuario.");
    }
  }, [restaurantId]);

  const loadDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDishesByRestaurant(restaurantId);
      setDishes(data);
    } catch (err: any) {
      console.error("Error loading dishes:", err);
      setError(err.message || "No se pudieron cargar los platos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedDish(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, dish: Dish) => {
    e.stopPropagation();
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, dishId: string) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que quieres eliminar este plato?")) {
      try {
        await deleteDish(dishId, restaurantId);
        setDishes(dishes.filter(d => d._id !== dishId));
      } catch (err) {
        alert("Error al eliminar el plato");
      }
    }
  };

  const handleSaveDish = async (dishData: Partial<Dish>) => {
    try {
      if (selectedDish) {
        const updated = await updateDish(selectedDish._id, { ...dishData, restaurant_id: restaurantId });
        setDishes(dishes.map(d => d._id === selectedDish._id ? updated : d));
      } else {
        const created = await createDish({ ...dishData, restaurant_id: restaurantId });
        setDishes([...dishes, created]);
      }
    } catch (err) {
      console.error("Error saving dish:", err);
      throw err;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedDishId(expandedDishId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium tracking-tight">Cargando la carta...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-0">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Carta de Platos</h1>
          <p className="text-sm text-gray-500 font-medium">Gestiona el menú de tu restaurante</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>AÑADIR PLATO</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={loadDishes}
            className="ml-auto text-xs font-black uppercase tracking-widest hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && dishes.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800">No hay platos registrados</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">Empieza añadiendo platos a tu menú desde el panel de gestión.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dishes.map((dish) => {
            const isExpanded = expandedDishId === dish._id;

            return (
              <div
                key={dish._id}
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden hover:scale-[1.01] hover:shadow-md ${isExpanded ? "border-orange-200 ring-4 ring-orange-50" : "border-gray-100"
                  }`}
              >
                {/* Basic Info (Header) */}
                <div className="p-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0 cursor-pointer" onClick={() => toggleExpand(dish._id)}>
                    <img
                      src={dish.images?.[0] || "https://via.placeholder.com/150?text=No+Image"}
                      alt={dish.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-sm border border-gray-100"
                    />
                    <div className="absolute top-1 right-1">
                      <span className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg text-[9px] font-black text-gray-700 shadow-sm border border-gray-100 uppercase tracking-tighter">
                        {dish.section}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-gray-800 text-lg truncate leading-tight group-hover:text-orange-600 transition-colors" onClick={() => toggleExpand(dish._id)}>
                        {dish.name}
                      </h3>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-orange-600 font-black">
                          <span className="text-sm">€</span>
                          <span className="text-xl">{dish.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-4 ml-2">
                           <button 
                             onClick={(e) => handleEditClick(e, dish)}
                             className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200" title="Editar">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={(e) => handleDeleteClick(e, dish._id)}
                             className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200" title="Eliminar">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {dish.portionSize && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <Utensils className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{dish.portionSize}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => toggleExpand(dish._id)}
                        className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg group transition-all"
                      >
                        <Info className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-500 font-black text-[9px] tracking-widest group-hover:underline">VER DETALLES</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleExpand(dish._id)}
                    className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? "bg-orange-500 text-white rotate-180 shadow-md shadow-orange-200" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Expanded Info (Accordion Body) */}
                <div
                  className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="p-8 bg-gray-50/50 border-t border-gray-50 space-y-8">
                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                         Descripción
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed font-medium">
                        {dish.description || "Este plato no tiene una descripción detallada todavía."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingredientes</h4>
                          <div className="flex flex-wrap gap-2">
                            {dish.ingredients?.length ? dish.ingredients.map((ing, i) => (
                              <span key={i} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600">
                                {ing}
                              </span>
                            )) : <span className="text-xs italic text-gray-300">No especificados</span>}
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
                          <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> Alérgenos
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {dish.allergens?.length ? dish.allergens.map((alg, i) => (
                              <span key={i} className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                {alg}
                              </span>
                            )) : <span className="text-xs italic text-gray-300">Sin alérgenos críticos</span>}
                          </div>
                       </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-gray-800 font-black text-[10px] uppercase tracking-widest">
                          <Leaf className="w-3.5 h-3.5 text-green-500" />
                          <span>Dietético</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.dietaryFlags?.length ? dish.dietaryFlags.map((flag, i) => (
                            <span key={i} className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                              {flag}
                            </span>
                          )) : <span className="text-[10px] text-gray-400 italic">No especificado</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-gray-800 font-black text-[10px] uppercase tracking-widest">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>Sabor</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.flavorProfile?.length ? dish.flavorProfile.map((flavor, i) => (
                            <span key={i} className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                              {flavor}
                            </span>
                          )) : <span className="text-[10px] text-gray-400 italic">No especificado</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-gray-800 font-black text-[10px] uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Disponibilidad</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dish.availableAt?.length ? dish.availableAt.map((time, i) => (
                            <span key={i} className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                              {time}
                            </span>
                          )) : <span className="text-[10px] text-gray-400 italic">Todo el día</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dish Modal */}
      <DishModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDish}
        dish={selectedDish}
      />
    </div>
  );
}

