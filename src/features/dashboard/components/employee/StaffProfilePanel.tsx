import { Store, User, Mail, Shield, MapPin, Phone } from 'lucide-react';
import type { IRestaurant, IUser } from '@/types';

interface StaffProfilePanelProps {
  user: IUser | null;
  restaurant: IRestaurant | null;
}

export default function StaffProfilePanel({ user, restaurant }: StaffProfilePanelProps) {
  return (
    <main className="flex-1 w-full h-full bg-slate-50/30">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">MI PERFIL</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tarjeta de Información Personal */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Usuario'}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold mt-1">
                  <Shield className="w-3 h-3" />
                  {user?.role === 'owner' ? 'Propietario' : 'Staff'}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</div>
                  <div className="text-sm font-semibold text-slate-700">{user?.email || 'No proporcionado'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">ID de Empleado</div>
                  <div className="text-sm font-semibold text-slate-700">{user?.id || 'Desconocido'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tarjeta del Restaurante */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{restaurant?.profile?.name || 'Restaurante'}</h2>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold mt-1">
                  ⭐ {restaurant?.profile?.globalRating?.toFixed(1) || '0.0'}
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dirección</div>
                  <div className="text-sm font-semibold text-slate-700">{restaurant?.profile?.location?.address || 'No proporcionada'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contacto</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {restaurant?.profile?.contact?.phone || 'Sin teléfono'} / {restaurant?.profile?.contact?.email || 'Sin email'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
