import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { updateRestaurant, softDeleteRestaurant } from '@/services/restaurant.service';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
  restaurant: any;
}

export default function Settings({ restaurant: initialRestaurant }: SettingsProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth() as any;
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  useEffect(() => {
    console.log('⚙️ Settings: initialRestaurant received', initialRestaurant);
    if (initialRestaurant) {
      setRestaurant(initialRestaurant);
    }
  }, [initialRestaurant]);

  console.log('⚙️ Settings: rendering with restaurant data', {
    name: restaurant?.profile?.name,
    contact: restaurant?.profile?.contact,
    location: restaurant?.profile?.location?.address,
  });

  const timetable = restaurant?.profile?.timetable || {};
  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const restaurantId = user?.restaurant_id || restaurant?._id;
      const updated = await updateRestaurant(restaurantId, restaurant);
      setRestaurant(updated);
      setIsEditingSchedule(false);
      alert(t('settings.successSave') || 'Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('settings.errorSave') || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTimetableChange = (
    day: string,
    index: number,
    field: 'open' | 'close',
    value: string,
  ) => {
    const newTimetable = { ...timetable };
    if (!newTimetable[day]) newTimetable[day] = [{ open: '09:00', close: '22:00' }];
    newTimetable[day][index][field] = value;
    setRestaurant({
      ...restaurant,
      profile: {
        ...restaurant.profile,
        timetable: newTimetable,
      },
    });
  };

  const addTimeSlot = (day: string) => {
    const newTimetable = { ...timetable };
    if (!newTimetable[day]) newTimetable[day] = [];
    newTimetable[day].push({ open: '09:00', close: '22:00' });
    setRestaurant({
      ...restaurant,
      profile: {
        ...restaurant.profile,
        timetable: newTimetable,
      },
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newTimetable = { ...timetable };
    if (newTimetable[day]) {
      newTimetable[day].splice(index, 1);
      setRestaurant({
        ...restaurant,
        profile: {
          ...restaurant.profile,
          timetable: newTimetable,
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          {t('settings.title').toUpperCase()}
        </h1>
        <p className="text-sm text-gray-500 font-medium">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <NavButton
            id="general"
            label={t('settings.tabs.general')}
            icon={Store}
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          />
          <NavButton
            id="schedule"
            label={t('settings.tabs.schedule')}
            icon={Clock}
            active={activeTab === 'schedule'}
            onClick={() => setActiveTab('schedule')}
          />
          <NavButton
            id="notifications"
            label={t('settings.tabs.notifications')}
            icon={Bell}
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          />
          <NavButton
            id="points"
            label={t('settings.tabs.points')}
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
                <h3 className="text-xl font-black text-gray-800">{t('settings.general.title')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label={t('settings.general.name')}
                  value={restaurant?.profile?.name}
                  onChange={(val: string) =>
                    setRestaurant({ ...restaurant, profile: { ...restaurant.profile, name: val } })
                  }
                />
                <InputGroup
                  label={t('settings.general.category')}
                  value={restaurant?.profile?.category}
                  onChange={(val: string) =>
                    setRestaurant({
                      ...restaurant,
                      profile: { ...restaurant.profile, category: val },
                    })
                  }
                />
                <InputGroup
                  label={t('employees.form.email')}
                  icon={Mail}
                  value={restaurant?.profile?.contact?.email}
                  onChange={(val: string) =>
                    setRestaurant({
                      ...restaurant,
                      profile: {
                        ...restaurant.profile,
                        contact: { ...restaurant.profile?.contact, email: val },
                      },
                    })
                  }
                />
                <InputGroup
                  label={t('employees.form.phone')}
                  icon={Phone}
                  value={restaurant?.profile?.contact?.phone}
                  onChange={(val: string) =>
                    setRestaurant({
                      ...restaurant,
                      profile: {
                        ...restaurant.profile,
                        contact: { ...restaurant.profile?.contact, phone: val },
                      },
                    })
                  }
                />
                <div className="md:col-span-2">
                  <InputGroup
                    label={t('settings.general.address')}
                    icon={MapPin}
                    value={restaurant?.profile?.location?.address}
                    onChange={(val: string) =>
                      setRestaurant({
                        ...restaurant,
                        profile: {
                          ...restaurant.profile,
                          location: { ...restaurant.profile.location, address: val },
                        },
                      })
                    }
                  />
                </div>
                <InputGroup
                  label={t('settings.general.website')}
                  icon={Globe}
                  value={restaurant?.profile?.contact?.website}
                  onChange={(val: string) =>
                    setRestaurant({
                      ...restaurant,
                      profile: {
                        ...restaurant.profile,
                        contact: { ...restaurant.profile?.contact, website: val },
                      },
                    })
                  }
                />
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setRestaurant(initialRestaurant)}
                  className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
                >
                  {t('navbar.back')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('settings.general.submit').toUpperCase()}
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
                  <h3 className="text-xl font-black text-gray-800">
                    {t('settings.schedule.title')}
                  </h3>
                </div>
                {!isEditingSchedule ? (
                  <button
                    onClick={() => setIsEditingSchedule(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
                  >
                    {t('settings.schedule.edit').toUpperCase()}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingSchedule(false);
                        setRestaurant(initialRestaurant);
                      }}
                      className="px-4 py-2 text-gray-500 bg-gray-100 rounded-xl text-xs font-black hover:bg-gray-200 transition-all"
                    >
                      {t('navbar.back').toUpperCase()}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-black hover:bg-green-600 transition-all shadow-md shadow-green-100 flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                      {t('settings.general.submit').toUpperCase()}
                    </button>
                  </div>
                )}
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
                      <span
                        className={`font-bold capitalize ${isToday ? 'text-orange-700' : 'text-gray-700'}`}
                      >
                        {t(`settings.schedule.days.${day}`)}
                      </span>

                      <div className="flex items-center gap-4">
                        {isEditingSchedule ? (
                          <div className="flex flex-col gap-2">
                            {slots?.map((s: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={s.open || ''}
                                  onChange={(e) =>
                                    handleTimetableChange(day, i, 'open', e.target.value)
                                  }
                                  className="p-1 border rounded text-xs"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={s.close || ''}
                                  onChange={(e) =>
                                    handleTimetableChange(day, i, 'close', e.target.value)
                                  }
                                  className="p-1 border rounded text-xs"
                                />
                                <button
                                  onClick={() => removeTimeSlot(day, i)}
                                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addTimeSlot(day)}
                              className="text-xs font-bold text-orange-500 hover:text-orange-600 text-left mt-1"
                            >
                              + {t('settings.schedule.addSlot')}
                            </button>
                          </div>
                        ) : isClosed ? (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {t('settings.schedule.closed')}
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            {slots.map((s: any, i: number) => (
                              <span
                                key={i}
                                className={`text-sm font-bold ${isToday ? 'text-orange-600' : 'text-gray-500'}`}
                              >
                                {s.open} — {s.close}
                                {i < slots.length - 1 && (
                                  <span className="mx-2 text-gray-300">·</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        {!isEditingSchedule && (
                          <ChevronRight
                            className={`w-4 h-4 ${isToday ? 'text-orange-400' : 'text-gray-300'}`}
                          />
                        )}
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
                <h3 className="text-xl font-black text-gray-800">
                  {t('settings.notifications.title')}
                </h3>
              </div>

              <div className="space-y-4">
                <ToggleItem
                  icon={Smartphone}
                  title={t('settings.notifications.realTime.title')}
                  description={t('settings.notifications.realTime.description')}
                  defaultEnabled={true}
                  color="bg-blue-100 text-blue-600"
                />
                <ToggleItem
                  icon={MailIcon}
                  title={t('settings.notifications.weeklyReport.title')}
                  description={t('settings.notifications.weeklyReport.description')}
                  defaultEnabled={true}
                  color="bg-purple-100 text-purple-600"
                />
                <ToggleItem
                  icon={MessageSquare}
                  title={t('settings.notifications.feedback.title')}
                  description={t('settings.notifications.feedback.description')}
                  defaultEnabled={false}
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>
            </section>
          )}

          {/* Section: Points */}
          {activeTab === 'points' && (
            <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-800">{t('settings.points.title')}</h3>
                </div>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-md shadow-orange-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  {t('settings.general.submit').toUpperCase()}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {t('settings.points.method')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setRestaurant({
                        ...restaurant,
                        profile: {
                          ...restaurant.profile,
                          pointsSystem: {
                            ...(restaurant.profile.pointsSystem || {}),
                            method: 'simple',
                          },
                        },
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all text-left space-y-2 ${
                      restaurant.profile.pointsSystem?.method === 'simple'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-gray-800">
                        {t('settings.points.simple.title')}
                      </h4>
                      {restaurant.profile.pointsSystem?.method === 'simple' && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-sm" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {t('settings.points.simple.description')}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRestaurant({
                        ...restaurant,
                        profile: {
                          ...restaurant.profile,
                          pointsSystem: {
                            ...(restaurant.profile.pointsSystem || {}),
                            method: 'exponential',
                          },
                        },
                      })
                    }
                    className={`p-6 rounded-3xl border-2 transition-all text-left space-y-2 ${
                      restaurant.profile.pointsSystem?.method === 'exponential'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-gray-800">
                        {t('settings.points.exponential.title')}
                      </h4>
                      {restaurant.profile.pointsSystem?.method === 'exponential' && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-sm" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {t('settings.points.exponential.description')}
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 animate-in fade-in duration-500">
                {restaurant.profile.pointsSystem?.method === 'simple' ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-orange-600 mb-2">
                      <Coins className="w-6 h-6" />
                      <h4 className="font-black text-lg">Configuración Método Simple</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                      <InputGroup
                        label={t('settings.points.simple.pointsPerEuro')}
                        type="number"
                        value={restaurant.profile.pointsSystem?.pointsPerEuro}
                        onChange={(val: string) =>
                          setRestaurant({
                            ...restaurant,
                            profile: {
                              ...restaurant.profile,
                              pointsSystem: {
                                ...(restaurant.profile.pointsSystem || {}),
                                pointsPerEuro: Number(val),
                              },
                            },
                          })
                        }
                      />
                      <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-center gap-3">
                        <span className="text-2xl font-black text-gray-400">1€</span>
                        <span className="text-gray-300 font-black">=</span>
                        <span className="text-2xl font-black text-orange-500">
                          {restaurant.profile.pointsSystem?.pointsPerEuro || 10} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-orange-600 mb-2">
                      <Zap className="w-6 h-6" />
                      <h4 className="font-black text-lg">Configuración Método Inteligente</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <InputGroup
                        label={t('settings.points.exponential.maxPoints')}
                        type="number"
                        value={
                          restaurant.profile.pointsSystem?.maxPointsVisit ??
                          restaurant.profile.maxPointsVisit
                        }
                        onChange={(val: string) =>
                          setRestaurant({
                            ...restaurant,
                            profile: {
                              ...restaurant.profile,
                              pointsSystem: {
                                ...(restaurant.profile.pointsSystem || {}),
                                maxPointsVisit: Number(val),
                              },
                            },
                          })
                        }
                      />
                      <div className="text-xs text-gray-500 bg-white p-5 rounded-2xl border border-gray-100 leading-relaxed italic">
                        "Este método ajusta los puntos según el gasto del cliente, su frecuencia de
                        visita y el ticket medio de tu local. Es ideal para fomentar la recurrencia
                        real."
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800">
                      {t('settings.points.fraudProtection.title')}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {t('settings.points.fraudProtection.description')}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
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

function InputGroup({ label, value, onChange, icon: Icon, type = 'text' }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        )}
        <input
          type={type}
          value={value === undefined || value === null ? '' : value}
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
        <div
          className={`p-3 ${color} rounded-2xl shadow-sm transition-transform group-hover:scale-110`}
        >
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
        <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-md" />
      </button>
    </div>
  );
}
