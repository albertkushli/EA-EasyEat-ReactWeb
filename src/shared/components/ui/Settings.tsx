import { useState, useEffect } from "react";
import {
  Store,
  Clock,
  Bell,
  Coins,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  X,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Mail as MailIcon,
  MessageSquare,
  Zap,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { updateRestaurant } from "@/features/restaurants/services/restaurantService";
import { useAuth } from "@/context/AuthContext";

interface SettingsProps {
  restaurant: any;
}

export default function Settings({ restaurant: initialRestaurant }: SettingsProps) {
  const { user } = useAuth() as any;
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  
  const timetable = restaurant?.profile?.timetable || {};
  const daysOrder = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  const today = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const restaurantId = user?.restaurant_id || restaurant?._id;
      const updated = await updateRestaurant(restaurantId, restaurant);
      setRestaurant(updated);
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">CONFIGURACIÓN</h1>
        <p className="text-sm text-gray-500 font-medium">Gestiona los detalles y preferencias de tu establecimiento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
           <NavButton 
             id="general" 
             label="Información" 
             icon={Store} 
             active={activeTab === 'general'} 
             onClick={() => setActiveTab('general')} 
           />
           <NavButton 
             id="schedule" 
             label="Horario Comercial" 
             icon={Clock} 
             active={activeTab === 'schedule'} 
             onClick={() => setActiveTab('schedule')} 
           />
           <NavButton 
             id="notifications" 
             label="Notificaciones" 
             icon={Bell} 
             active={activeTab === 'notifications'} 
             onClick={() => setActiveTab('notifications')} 
           />
           <NavButton 
             id="points" 
             label="Sistema de Puntos" 
             icon={Coins} 
             active={activeTab === 'points'} 
             onClick={() => setActiveTab('points')} 
           />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section: Restaurant Info */}
          {activeTab === 'general' && (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-800">Perfil del Restaurante</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Nombre del Establecimiento" 
                  value={restaurant?.profile?.name} 
                  onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, name: val } })}
                />
                <InputGroup 
                  label="Categoría / Tipo de Cocina" 
                  value={restaurant?.profile?.category || "Mediterránea Moderna"} 
                  onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, category: val } })}
                />
                <InputGroup 
                  label="Correo Electrónico" 
                  icon={Mail} 
                  value={restaurant?.profile?.email || "contacto@bodega.com"} 
                  onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, email: val } })}
                />
                <InputGroup 
                  label="Teléfono de Contacto" 
                  icon={Phone} 
                  value={restaurant?.profile?.phone || "+34 932 112 443"} 
                  onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, phone: val } })}
                />
                <div className="md:col-span-2">
                  <InputGroup 
                    label="Dirección Completa" 
                    icon={MapPin} 
                    value={restaurant?.profile?.location?.address} 
                    onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, location: { ...restaurant.profile.location, address: val } } })}
                  />
                </div>
                <InputGroup 
                  label="Sitio Web" 
                  icon={Globe} 
                  value={restaurant?.profile?.website || "www.labodegadelmar.es"} 
                  onChange={(val: string) => setRestaurant({ ...restaurant, profile: { ...restaurant.profile, website: val } })}
                />
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                <button 
                  onClick={() => setRestaurant(initialRestaurant)}
                  className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all">Cancelar</button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  GUARDAR CAMBIOS
                </button>
              </div>
            </section>
          )}

          {/* Section: Schedule */}
          {activeTab === 'schedule' && (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">Horario Semanal</h3>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
                  EDITAR HORARIO
                </button>
              </div>

              <div className="space-y-3">
                {daysOrder.map((day) => {
                  const isToday = today === day;
                  const slots = timetable[day];
                  const isClosed = !slots || slots.length === 0;

                  return (
                    <div 
                      key={day}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                        isToday 
                          ? 'bg-orange-50 border-orange-100 shadow-sm scale-[1.02]' 
                          : 'bg-gray-50 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className={`font-bold capitalize ${isToday ? 'text-orange-700' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      
                      <div className="flex items-center gap-4">
                        {isClosed ? (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Cerrado
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {slots.map((s: any, i: number) => (
                              <span key={i} className={`text-sm font-bold ${isToday ? 'text-orange-600' : 'text-gray-500'}`}>
                                {s.open} — {s.close}
                                {i < slots.length - 1 && <span className="mx-2 text-gray-300">·</span>}
                              </span>
                            ))}
                          </div>
                        )}
                        <ChevronRight className={`w-4 h-4 ${isToday ? 'text-orange-400' : 'text-gray-300'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section: Notifications */}
          {activeTab === 'notifications' && (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-800">Centro de Notificaciones</h3>
              </div>

              <div className="space-y-4">
                <ToggleItem 
                  icon={Smartphone} 
                  title="Alertas en Tiempo Real" 
                  description="Recibir notificaciones cuando un cliente canjea un premio"
                  defaultEnabled={true}
                  color="bg-blue-100 text-blue-600"
                />
                <ToggleItem 
                  icon={MailIcon} 
                  title="Resumen Semanal" 
                  description="Informe de rendimiento enviado a tu correo cada lunes"
                  defaultEnabled={true}
                  color="bg-purple-100 text-purple-600"
                />
                <ToggleItem 
                  icon={MessageSquare} 
                  title="Feedback de Clientes" 
                  description="Avisar cuando un cliente deja una valoración nueva"
                  defaultEnabled={false}
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>
            </section>
          )}

          {/* Section: Points */}
          {activeTab === 'points' && (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-800">Sistema de Puntos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ratio de Acumulación</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-gray-800">1€</span>
                      <span className="text-gray-400 font-bold mb-1">=</span>
                      <span className="text-4xl font-black text-orange-500">10 pts</span>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Configurar multiplicadores</button>
                 </div>

                 <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Bonus por Bienvenida</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-emerald-500">50 pts</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">PUNTOS OTORGADOS EN LA PRIMERA VISITA</p>
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-black text-gray-800">Protección contra Fraude</h4>
                       <p className="text-xs text-gray-500 font-medium">Validación automática de tickets mediante QR</p>
                    </div>
                 </div>
                 <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full" />
                 </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

function NavButton({ label, icon: Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 translate-x-2' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, icon: Icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />}
        <input 
          type="text" 
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${Icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}

function ToggleItem({ icon: Icon, title, description, defaultEnabled, color }: any) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] group hover:border-gray-200 transition-all">
       <div className="flex items-center gap-4">
          <div className={`p-3 ${color} rounded-2xl shadow-sm transition-transform group-hover:scale-110`}>
             <Icon className="w-5 h-5" />
          </div>
          <div>
             <h4 className="font-bold text-gray-800 leading-tight">{title}</h4>
             <p className="text-xs text-gray-400 font-medium">{description}</p>
          </div>
       </div>
       <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-14 h-7 rounded-full p-1 transition-all duration-300 flex ${enabled ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
       >
          <motion.div 
            layout 
            className="w-5 h-5 bg-white rounded-full shadow-md" 
          />
       </button>
    </div>
  );
}

