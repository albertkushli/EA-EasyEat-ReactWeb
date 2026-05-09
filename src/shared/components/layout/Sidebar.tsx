import { LayoutDashboard, Users, Gift, BarChart3, Settings, LogOut, Store, UtensilsCrossed, Users2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  restaurantName: string;
  restaurantAddress?: string;
}

export function Sidebar({ activeView, onViewChange, restaurantName, restaurantAddress }: SidebarProps) {
  const { user, logout, role } = useAuth();
  const { t } = useTranslation();
  const isOwner = role === 'owner';

  const baseMenuItems = [
    { id: 'profile', icon: Users, label: t('sidebar.profile') === 'sidebar.profile' ? 'Mi Perfil' : t('sidebar.profile') },
  ];

  const ownerMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { id: 'clients', icon: Users, label: t('sidebar.clients') },
    { id: 'dishes', icon: UtensilsCrossed, label: t('sidebar.dishes') },
    { id: 'employees', icon: Users2, label: t('sidebar.employees') },
    { id: 'rewards', icon: Gift, label: t('sidebar.rewards') },
    { id: 'analytics', icon: BarChart3, label: t('sidebar.analytics') },
    { id: 'settings', icon: Settings, label: t('sidebar.settings') }
  ];

  // Si es owner, ve su perfil más todo lo demás. Si es staff, solo su perfil.
  const menuItems = isOwner ? [...baseMenuItems, ...ownerMenuItems] : baseMenuItems;

  // We should also check if the active view is accessible, but for now we just render the menu.

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-slate-700/70 bg-gradient-to-b from-[#0e1a36] to-[#0a1329] text-white shadow-2xl">
      <div className="border-b border-white/10 p-6 shrink-0">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25 shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black leading-tight text-white truncate">{restaurantName}</div>
            {restaurantAddress && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400 opacity-80">
                <span>📍</span>
                <span className="truncate max-w-[150px]">{restaurantAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto min-h-0 custom-scrollbar">
        <ul className="list-none space-y-1.5 p-0 m-0">
          {menuItems.map((item) => (
            <motion.li key={item.id}>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onViewChange(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${activeView === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-200/85 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon className={`h-5 w-5 ${activeView === item.id ? 'text-white' : 'text-slate-300/90'}`} />
                <span className="text-base font-semibold">{item.label}</span>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 space-y-3 p-4">
        {/* Perfil del usuario */}
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold shadow-lg shadow-orange-500/20">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name || t('auth.login.tabs.customer')}</p>
            <p className="text-xs text-slate-300/70 truncate">{user?.role || 'Owner'}</p>
          </div>
        </div>

        {/* Botón de logout */}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-slate-200/85 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          title={t('navbar.links.logout')}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-semibold">{t('sidebar.logout')}</span>
        </motion.button>

        {/* Enlace Legal */}
        <Link 
          to="/aviso-legal" 
          className="block text-center text-[10px] text-slate-500 hover:text-orange-400 transition-colors pt-2 uppercase tracking-widest font-bold"
        >
          {t('footer.links.legalNotice')}
        </Link>
      </div>
    </aside>
  );
}
