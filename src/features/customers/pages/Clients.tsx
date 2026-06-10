import { useEffect, useState, useMemo } from "react";
import { Customer } from "@/types/Customer";
import { getAllCustomers } from "@/services/customer.service";
import { getVisitsByRestaurant } from "@/services/visit.service";
import { useAuth } from "@/context/AuthContext";
import { Search, User, Mail, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomerDetailModal from "../components/CustomerDetailModal";

export default function Clients() {
  const { user, restaurant } = useAuth() as any;
  const { t } = useTranslation();
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantVisits, setRestaurantVisits] = useState<any[]>([]);

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadClients();
    } else {
      setLoading(false);
      setError(t('clients.errorNoRestaurant'));
    }
  }, [restaurantId, t]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Obtener restaurante actual (restaurantId ya lo tenemos)
      
      // 2. Cargar todas las visitas del restaurante
      const visits = await getVisitsByRestaurant(restaurantId);
      setRestaurantVisits(visits);
      
      // 3. Filtrar por restaurante actual
      const filteredVisits = visits.filter(
        (visit: any) => String(visit.restaurant_id?._id || visit.restaurant_id) === String(restaurantId)
      );

      // 4. Sacar los customer_id únicos
      const uniqueCustomerIds = [
        ...new Set(filteredVisits.map((visit: any) => String(visit.customer_id?._id || visit.customer_id)))
      ];

      // 5. Cargar todos los clientes
      const allCustomers = await getAllCustomers();

      // 6. Mostrar solo los que tengan visitas
      const restaurantCustomers = allCustomers.filter((customer: Customer) =>
        uniqueCustomerIds.includes(String(customer._id))
      );

      setClients(restaurantCustomers);
    } catch (err: any) {
      console.error("Error loading clients:", err);
      setError(err.message || t('clients.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (client: Customer) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  return (
    <div className="he-clients-page p-6 min-h-screen">
      {/* Header section... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('clients.title').toUpperCase()}
          </h1>
          <p className="text-gray-500 dark:text-slate-300 font-medium mt-1">
            {t('clients.subtitle')}
          </p>
        </div>
      </div>

      {/* Search bar... */}
      <div className="mb-8 relative max-w-2xl">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t('clients.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-card border-2 border-gray-100 dark:border-card rounded-2xl shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none text-gray-700 dark:text-white font-medium"
        />
      </div>

      {/* Grid of clients... */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-500 font-bold">{t('clients.loading')}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-red-500 font-bold">{error}</p>
          <button 
            onClick={loadClients}
            className="mt-4 px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            {t('clients.retry')}
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <User className="w-10 h-10 text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold">{t('clients.noResults')}</p>
          <p className="text-gray-400 text-sm">{searchTerm ? t('clients.noResultsSearch') : t('clients.noResultsEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              onClick={() => handleClientClick(client)}
              className="group bg-white dark:bg-card rounded-3xl border-2 border-gray-50 dark:border-card p-6 shadow-sm hover:shadow-xl hover:border-orange-100 dark:hover:border-orange-500/40 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 dark:bg-orange-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="flex items-start gap-4 relative z-10">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={client.profilePictures?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || 'U')}&background=f97316&color=fff`}
                    alt={client.name || 'Customer'}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  {client.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                    {client.name || t('components.employeeCard.noName')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs truncate">{client.email || t('components.employeeCard.noEmail')}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${client.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                      }`}>
                      {client.isActive ? t('clients.active') : t('clients.inactive')}
                    </span>
                    <div className="flex items-center text-orange-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                      <span className="text-xs font-bold mr-1">DETALLES</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedClient && (
        <CustomerDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={selectedClient}
          restaurantId={restaurantId}
          restaurantVisits={restaurantVisits}
        />
      )}
    </div>
  );
}
