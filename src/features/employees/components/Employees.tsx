import { useEffect, useState, useMemo, useRef } from "react";
import { getEmployeesByRestaurant, createEmployee, updateEmployee, deleteEmployee } from "@/services/employee.service";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Plus,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  RotateCcw,
  Star,
  TrendingUp,
  DollarSign,
  ChevronDown
} from "lucide-react";
import EmployeeCard from "@/features/employees/components/EmployeeCard";
import EmployeeModal from "@/features/employees/components/EmployeeModal";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export default function Employees() {
  const { user, restaurant } = useAuth() as any;
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    minRating: 0,
    minVisits: 0,
    minRewards: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const restaurantId = user?.restaurant_id || restaurant?._id || restaurant?.id || "";

  useEffect(() => {
    if (restaurantId) {
      loadEmployees();
    } else {
      setLoading(false);
      setError(t('employees.errorNoRestaurant') || "No se pudo identificar el restaurante del usuario.");
    }
  }, [restaurantId, t]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeesByRestaurant(restaurantId);
      setEmployees(data);
    } catch (err: any) {
      console.error("Error loading employees:", err);
      setError(err.message || t('employees.errorLoading') || "No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const profile = employee.profile || {};
      const stats = employee.stats || {};
      
      // Search logic
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        profile.name?.toLowerCase().includes(searchStr) ||
        profile.email?.toLowerCase().includes(searchStr) ||
        profile.phone?.toLowerCase().includes(searchStr) ||
        profile.role?.toLowerCase().includes(searchStr);

      // Filter logic
      const matchesRole = filters.role === "all" || profile.role === filters.role;
      
      // Numeric stats
      const empVisits = Number(stats.totalVisits ?? stats.visits ?? employee.visits ?? 0);
      const empRating = Number(stats.averageRating ?? employee.rating ?? 0);
      const empRewards = Number(stats.revenue ?? 0); // As per EmployeeCard mapping

      const matchesRating = empRating >= filters.minRating;
      const matchesVisits = empVisits >= filters.minVisits;
      const matchesRewards = empRewards >= filters.minRewards;

      return matchesSearch && matchesRole && matchesRating && matchesVisits && matchesRewards;
    });
  }, [employees, searchTerm, filters]);

  const clearFilters = () => {
    setFilters({
      role: "all",
      minRating: 0,
      minVisits: 0,
      minRewards: 0,
    });
    setSearchTerm("");
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
    if (window.confirm(t('employees.confirmDelete') || "¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await deleteEmployee(employeeId);
        await loadEmployees();
      } catch (err) {
        console.error("Error deleting employee:", err);
        alert(t('employees.errorDelete') || "Error al eliminar el empleado");
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
        <p className="text-gray-500 font-medium tracking-tight">{t('employees.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">{t('employees.title')}</h1>
          <p className="text-sm text-gray-500 font-medium">{t('employees.subtitle')}</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('employees.addEmployee').toUpperCase()}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('employees.filters.search')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all flex-1 md:flex-none justify-center border ${
                isFilterPanelOpen || Object.values(filters).some(v => v !== "all" && v !== 0)
                ? "bg-orange-500 text-white border-transparent shadow-lg shadow-orange-200" 
                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{t('employees.filters.title').toUpperCase()}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isFilterPanelOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Panel Dropdown */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-[-1rem] mb-6 z-30"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Role Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('employees.filters.role')}</label>
                  <select 
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all"
                  >
                    <option value="all">{t('employees.filters.allRoles')}</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-yellow-400" /> {t('employees.filters.minRating')}
                  </label>
                  <input 
                    type="range" min="0" max="10" step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                    className="w-full accent-orange-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-black text-gray-400">
                    <span>0</span>
                    <span className="text-orange-500 text-xs">{filters.minRating}</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Visits Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-orange-500" /> {t('employees.filters.minVisits')}
                  </label>
                  <input 
                    type="number" min="0"
                    value={filters.minVisits}
                    onChange={(e) => setFilters({...filters, minVisits: parseInt(e.target.value) || 0})}
                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                {/* Rewards Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-green-500" /> {t('employees.filters.minRewards')}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="number" min="0"
                      value={filters.minRewards}
                      onChange={(e) => setFilters({...filters, minRewards: parseInt(e.target.value) || 0})}
                      className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all"
                    />
                    <button 
                      onClick={clearFilters}
                      className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                      title={t('employees.filters.clear')}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={loadEmployees}
            className="ml-auto text-xs font-black uppercase tracking-widest hover:underline"
          >
            {t('clients.retry')}
          </button>
        </div>
      )}

      {!error && employees.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800">{t('employees.noEmployees')}</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">{t('dashboard.employee.employees.none')}</p>
        </div>
      ) : !error && filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800">{t('employees.filters.noResults')}</h3>
          <button 
            onClick={clearFilters}
            className="mt-4 text-orange-500 font-black text-sm uppercase tracking-widest hover:underline"
          >
            {t('employees.filters.clear')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredEmployees.map((employee) => (
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

