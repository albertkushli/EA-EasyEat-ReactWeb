import { useEffect, useState } from "react";
import {
  getEmployeesByRestaurant,
  createEmployee,
  deleteEmployee,
} from "../services/employeeService";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    restaurant_id: "ID_DEL_RESTAURANTE",
    profile: {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      password: "",
    },
  });

  const loadEmployees = async () => {
    const data = await getEmployeesByRestaurant("ID_DEL_RESTAURANTE");
    setEmployees(data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createEmployee(form);
    loadEmployees();
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    loadEmployees();
  };

  return (
    <div>
      <h2>Empleados</h2>

      {/* LISTA */}
      {employees.map((emp) => (
        <div key={emp._id} className="card">
          <h3>{emp.profile.name}</h3>
          <p>{emp.profile.email}</p>
          <p>{emp.profile.phone}</p>
          <span>{emp.profile.role}</span>

          <button onClick={() => handleDelete(emp._id)}>
            Delete
          </button>
        </div>
      ))}

      {/* FORM */}
      <form onSubmit={handleCreate}>
        <input
          placeholder="Nombre"
          onChange={(e) =>
            setForm({
              ...form,
              profile: { ...form.profile, name: e.target.value },
            })
          }
        />

        <input
          placeholder="Email"
          onChange={(e) =>
            setForm({
              ...form,
              profile: { ...form.profile, email: e.target.value },
            })
          }
        />

        <input
          placeholder="Password"
          onChange={(e) =>
            setForm({
              ...form,
              profile: { ...form.profile, password: e.target.value },
            })
          }
        />

        <select
          onChange={(e) =>
            setForm({
              ...form,
              profile: { ...form.profile, role: e.target.value },
            })
          }
        >
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>

        <button type="submit">Crear</button>
      </form>
    </div>
  );
}