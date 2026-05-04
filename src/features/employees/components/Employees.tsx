import { useEffect, useState } from "react";
import { getEmployeesByRestaurant, createEmployee, updateEmployee, deleteEmployee } from "@/features/employees/services/employeeService";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Plus,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import EmployeeCard from "@/features/employees/components/EmployeeCard";
import EmployeeModal from "@/features/employees/components/EmployeeModal";

export default function Employees() {
  const { user, restaurant } = useAuth() as any;
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadEmployees();
    } else {
      setLoading(false);
      setError("No se pudo identificar el restaurante del usuario.");
    }
  }, [restaurantId]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeesByRestaurant(restaurantId);
      console.log("Employees data received:", data);
      setEmployees(data);
    } catch (err: any) {
      console.error("Error loading employees:", err);
      setError(err.message || "No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (employeeId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await deleteEmployee(employeeId);
        setEmployees(employees.filter(e => e._id !== employeeId));
      } catch (err) {
        alert("Error al eliminar el empleado");
      }
    }
  };

  const handleSaveEmployee = async (employeeData: any) => {
    try {
      if (selectedEmployee) {
        const updated = await updateEmployee(selectedEmployee._id, { ...employeeData, restaurant_id: restaurantId });
        setEmployees(employees.map(e => e._id === selectedEmployee._id ? updated : e));
      } else {
        const created = await createEmployee({ ...employeeData, restaurant_id: restaurantId });
        setEmployees([...employees, created]);
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-gray-500 font-medium tracking-tight">Cargando equipo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Gestión de Empleados</h1>
          <p className="text-sm text-gray-500 font-medium">Administra los accesos y roles de tu personal</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>AÑADIR EMPLEADO</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-orange-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex-1 md:flex-none justify-center">
              <Filter className="w-4 h-4" />
              Filtrar
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={loadEmployees}
            className="ml-auto text-xs font-black uppercase tracking-widest hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && employees.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800">No hay empleados registrados</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">Tu equipo aparecerá aquí cuando empieces a añadir miembros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {employees.map((employee) => (
            <EmployeeCard 
              key={employee._id} 
              employee={employee} 
              onEdit={() => handleEditClick(employee)}
              onDelete={() => handleDeleteClick(employee._id)}
            />
          ))}
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />
    </div>
  );
}

