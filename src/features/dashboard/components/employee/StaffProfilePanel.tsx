import { Store, User, Mail, Shield, MapPin, Phone, Loader2, X } from 'lucide-react';
import type { IRestaurant, IUser } from '@/types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { softDeleteRestaurant } from '@/services/restaurant.service';

interface StaffProfilePanelProps {
  user: IUser | null;
  restaurant: IRestaurant | null;
}

export default function StaffProfilePanel({ user, restaurant }: StaffProfilePanelProps) {
  const { t } = useTranslation();
  const { logout } = useAuth() as any;
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex-1 w-full h-full bg-slate-50/30">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight uppercase">{t('dashboard.customer.staff.title', 'MI PERFIL')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tarjeta de Información Personal */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{user?.name || t('auth.login.tabs.customer', 'Usuario')}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold mt-1">
                  <Shield className="w-3 h-3" />
                  {user?.role === 'owner' ? t('auth.roles.owner') : t('auth.roles.staff')}
                </span>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('dashboard.customer.staff.email', 'Email')}</div>
                  <div className="text-sm font-semibold text-slate-700">{user?.email || t('dashboard.customer.staff.noProvide', 'No proporcionado')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('dashboard.customer.staff.employeeId', 'ID de Empleado')}</div>
                  <div className="text-sm font-semibold text-slate-700">{user?._id || user?.id || t('dashboard.customer.staff.unknown', 'Desconocido')}</div>
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
                <h2 className="text-xl font-bold text-slate-800">{restaurant?.profile?.name || t('dashboard.customer.staff.restaurant', 'Restaurante')}</h2>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold mt-1">
                  ⭐ {Number(restaurant?.profile?.globalRating ?? 0).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('dashboard.customer.staff.address', 'Dirección')}</div>
                  <div className="text-sm font-semibold text-slate-700">{restaurant?.profile?.location?.address || t('dashboard.customer.staff.noProvide', 'No proporcionada')}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t('dashboard.customer.staff.contact', 'Contacto')}</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {restaurant?.profile?.contact?.phone || t('dashboard.customer.staff.noPhone', 'Sin teléfono')} / {restaurant?.profile?.contact?.email || t('dashboard.customer.staff.noEmail', 'Sin email')}
                  </div>
                </div>
              </div>
            </div>

            {user?.role === 'owner' && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={async () => {
                    const message = t(
                      'settings.dangerZone.confirm',
                      'Estás a punto de eliminar tu restaurante.\n\nEsta acción es IRREVERSIBLE. Tu perfil ya no será visible y perderás acceso a todos los datos asociados de forma permanente.\n\n¿Estás completamente seguro de que quieres proceder?'
                    );
                    if (window.confirm(message)) {
                      setLoading(true);
                      const restaurantId = user?.restaurant_id || restaurant?._id || (restaurant as any)?.id;
                      if (restaurantId) {
                        try {
                          await softDeleteRestaurant(restaurantId);
                          if (logout) await logout();
                          else window.location.href = '/';
                        } catch (error) {
                          console.error('Error soft deleting restaurant', error);
                        }
                      }
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  <span>{t('settings.dangerZone.delete', 'Eliminar restaurante')}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
