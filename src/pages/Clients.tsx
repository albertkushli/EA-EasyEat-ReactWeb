import { useEffect, useState } from "react";
import { Customer } from "../types/Customer";
import { getCustomers } from "../services/customerServices";

export default function Clients() {
  const [clients, setClients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setError(null);
      const data = await getCustomers();
      console.log("CLIENTS (from service):", data);
      setClients(data);
    } catch (err) {
      console.error("Error loading clients:", err);
      setError((err as Error)?.message || "Error loading clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Clientes</h2>

      <div className="grid gap-4">
        {clients?.map((client) => (
          <div
            key={client._id}
            className="p-4 bg-white rounded-lg shadow flex items-center gap-4"
          >
            {/* FOTO */}
            <img
              src={client.profilePictures?.[0] || "https://via.placeholder.com/50"}
              alt={client.name || "Cliente"}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* INFO */}
            <div>
              <p className="font-semibold">{client.name}</p>
              <p className="text-sm text-gray-500">{client.email}</p>
              <p className="text-xs text-gray-400">
                {client.isActive ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}