import { useState } from "react";
import { apiRequest } from "../../services/api";

function CapacityManagement({ classes, onCapacityUpdated }) {

    const [classId, setClassId] = useState("");
    const [capacity, setCapacity] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const numericCapacity = Number(capacity);

        if (!classId) {
            setError("Selecciona una clase.");
            return;
        }

        if (
            !Number.isInteger(numericCapacity) ||
            numericCapacity <= 0
        ) {
            setError(
                "La capacidad debe ser un número entero mayor que cero."
            );
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await apiRequest(
                `/classes/${classId}/capacity`,
                {
                    method: "PATCH",
                    token,
                    body: {
                        capacity: numericCapacity
                    }
                }
            );

            setMessage(
                "Capacidad actualizada correctamente."
            );

            setCapacity("");

            if (onCapacityUpdated) {
                onCapacityUpdated();
            }

        } catch (error) {

            setError(
                error.message ||
                "No se pudo actualizar la capacidad."
            );
        }
    };

    return (
        <section className="create-class">

            <h2>Gestionar capacidad de clases</h2>

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
                    Clase

                    <select
                        value={classId}
                        onChange={(event) =>
                            setClassId(event.target.value)
                        }
                        required
                    >
                        <option value="">
                            Selecciona una clase
                        </option>

                        {classes.map((gymClass) => (
                            <option
                                key={gymClass._id}
                                value={gymClass._id}
                            >
                                {gymClass.title}
                                {" - "}
                                Capacidad actual: {gymClass.capacity}
                            </option>
                        ))}

                    </select>
                </label>

                <label>
                    Nueva capacidad

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={capacity}
                        onChange={(event) =>
                            setCapacity(event.target.value)
                        }
                        required
                    />
                </label>

                <button type="submit">
                    Actualizar capacidad
                </button>

            </form>

        </section>
    );
}

export default CapacityManagement;