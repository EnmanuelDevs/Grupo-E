import { useState } from "react";
import { apiRequest } from "../../services/api";
import "./create-class.css";

function CreateClass({ onClassCreated }) {

    const [formData, setFormData] = useState({

        title: "",
        description: "",
        instructor: "",
        capacity: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            
            const token = localStorage.getItem("token");

            const data = await apiRequest('/classes', {
                method: "POST",
                token,
                body: {
                    title: formData.title,
                    description: formData.description,
                    instructor: formData.instructor,
                    capacity: Number(formData.capacity)
                }
            });

            console.log("Clase creada:", data);
            setMessage("Clase creada correctamente.");

            if (onClassCreated) {
                onClassCreated();
            }

            setFormData({
                title: "",
                description: "",
                instructor: "",
                capacity: ""
            });
            
        } catch (error) {
            console.error("Error creando la clase:", error);
            setError(error.message || "No se pudo crear la clase.");
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
                    value={formData.title}
                    onChange={handleChange}
                />
            </label>

            <label>
                Descripción
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </label>

            <label>
                Instructor
                <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                />
            </label>

            <label>
                Capacidad
                <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                />
            </label>

            <button type="submit">
                Crear clase
            </button>

        </form>
    </section>
);


}


export default CreateClass;