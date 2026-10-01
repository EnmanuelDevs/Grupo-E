import { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";
import "./create-class.css";

function CreateClass({ onClassCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    capacity: "",
    date: "",
    time: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiRequest("/auth/users", {
          method: "GET",
          token,
        });

        console.log("Respuesta del backend (/auth/users):", response);

        const usersList =
          response.data || response.usuarios || response.users || response;

        if (Array.isArray(usersList)) {
          const availableInstructors = usersList.filter(
            (user) =>
              (user.role === "instructor" || user.rol === "instructor") &&
              user.isActive !== false,
          );

          console.log(
            "Instructores filtrados listos para mostrar:",
            availableInstructors,
          );
          setInstructors(availableInstructors);
        } else {
          console.warn(
            "El backend no devolvió un array válido de usuarios.",
            usersList,
          );
        }
      } catch (err) {
        console.error("Error cargando instructores:", err);
        setError("Hubo un problema al cargar la lista de instructores.");
      }
    };

    fetchInstructors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError("La capacidad debe ser un número entero mayor que cero.");
      return;
    }

    if (!formData.date || !formData.time) {
      setError("La fecha y la hora son obligatorias para crear la clase.");
      return;
    }

    if (!formData.instructor) {
      setError("Debes seleccionar un instructor para la clase.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const data = await apiRequest("/classes", {
        method: "POST",
        token,
        body: {
          title: formData.title,
          description: formData.description,
          instructor: formData.instructor,
          capacity: Number(formData.capacity),
        },
      });

      const classId = data.data ? data.data._id : data._id;

      if (classId) {
        await apiRequest(`/classes/${classId}/schedule`, {
          method: "POST",
          token,
          body: {
            date: formData.date,
            time: formData.time,
          },
        });
      }

      setMessage("Clase y horario creados correctamente.");

      if (onClassCreated) {
        onClassCreated();
      }

      setFormData({
        title: "",
        description: "",
        instructor: "",
        capacity: "",
        date: "",
        time: "",
      });
    } catch (error) {
      console.error("Error creando la clase o el horario:", error);
      setError(
        error.message || "No se pudo crear la clase o asignar su horario.",
      );
    }
  };

  return (
    <section className="create-class">
      <h2>Crear nueva clase</h2>

      {message && <p className="create-class-message">{message}</p>}
      {error && <p className="create-class-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Nombre de la clase
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
          />
        </label>

        <label>
          Descripción
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Instructor
          <select
            name="instructor"
            required
            value={formData.instructor}
            onChange={handleChange}
          >
            <option value="">Selecciona un instructor</option>
            {instructors.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.name} {inst.lastName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Capacidad
          <input
            type="number"
            name="capacity"
            min="1"
            step="1"
            required
            value={formData.capacity}
            onChange={handleChange}
          />
        </label>

        <label>
          Fecha
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
          />
        </label>

        <label>
          Hora
          <input
            type="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Crear clase</button>
      </form>
    </section>
  );
}

export default CreateClass;
