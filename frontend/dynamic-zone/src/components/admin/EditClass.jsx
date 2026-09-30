import { useState } from "react";
import { apiRequest } from "../../services/api";

function EditClass({ classes, onClassUpdated }) {
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleClassChange(event) {
    const selectedId = event.target.value;

    setClassId(selectedId);
    setMessage("");
    setError("");

    const selectedClass = classes.find(
      (item) => item._id === selectedId
    );

    if (selectedClass) {
      setTitle(selectedClass.title || "");
      setDescription(selectedClass.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!classId) {
      setError("Selecciona una clase.");
      return;
    }

    if (!title.trim()) {
      setError("El nombre de la clase es obligatorio.");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await apiRequest(
        `/classes/${classId}`,
        {
          method: "PATCH",
          token,
          body: {
            title: title.trim(),
            description: description.trim()
          }
        }
      );

      setMessage("Clase actualizada correctamente.");

      if (onClassUpdated) {
        onClassUpdated();
      }

    } catch (error) {
      setError(
        error.message ||
        "No se pudo actualizar la clase."
      );
    }
  }

  return (
    <section className="create-class">
      <h2>Modificar clase</h2>

      {message && (
        <p className="create-class-message">
          {message}
        </p>
      )}

      {error && (
        <p className="create-class-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <label>
          Seleccionar clase

          <select
            value={classId}
            onChange={handleClassChange}
            required
          >
            <option value="">
              Selecciona una clase
            </option>

            {classes.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Nombre de la clase

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />
        </label>

        <label>
          Descripción

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
          />
        </label>

        <button type="submit">
          Guardar cambios
        </button>

      </form>
    </section>
  );
}

export default EditClass;