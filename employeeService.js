const API = "http://localhost:3000/employees";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 🔥 LISTA POR RESTAURANTE (LA QUE NECESITAS)
export const getEmployeesByRestaurant = async (restaurantId) => {
  const res = await fetch(`${API}/restaurant/${restaurantId}/stats`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.data; // ⚠️ viene paginado
};

// ➕ CREAR
export const createEmployee = async (employee) => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(employee),
  });
  return res.json();
};

// ✏️ UPDATE
export const updateEmployee = async (id, employee) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(employee),
  });
  return res.json();
};

// ❌ DELETE (soft)
export const deleteEmployee = async (id) => {
  await fetch(`${API}/${id}/soft`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};