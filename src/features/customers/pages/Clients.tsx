import { useEffect, useState, useMemo } from "react";
import { Customer } from "../types/Customer";
import { getCustomersByRestaurant } from "@/features/customers/services/customerServices";
import { useAuth } from "@/context/AuthContext";
import { Search, User, Mail, ChevronRight, AlertCircle, Loader2 } from "lucide-react";

export default function Clients() {
  const { user, restaurant } = useAuth() as any;
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadClients();
    } else {
      setLoading(false);
      setError("No se pudo identificar el restaurante del usuario.");
    }
  }, [restaurantId]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomersByRestaurant(restaurantId);
      setClients(data);
    } catch (err: any) {
      console.error("Error loading clients:", err);
      setError(err.message || "No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const search = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search)
      );
    });
  }, [clients, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm">Gestiona y visualiza los clientes de tu restaurante</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button 
            onClick={loadClients}
            className="ml-auto text-sm font-semibold underline hover:text-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No se encontraron clientes</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? "Intenta con otro término de búsqueda." : "Aún no hay clientes registrados en este restaurante."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  client.isActive 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {client.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={client.profilePictures?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=f97316&color=fff`}
                    alt={client.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  {client.isActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                    {client.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-xs truncate">{client.email}</span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[10px] text-gray-400">
                      Miembro desde {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
