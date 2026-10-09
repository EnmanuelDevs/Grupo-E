import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import Swal from "sweetalert2";
import "./users-management.css";

function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        role: "member"
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };


    const handleCreateUser = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const method = editingUser ? "PUT" : "POST";

            const path = editingUser
                ? `/auth/users/${editingUser._id}`
                : "/auth/users";

            await apiRequest(path, {
                method,
                token,
                body: formData
            });

            await loadUsers();

            await Swal.fire({
                title: editingUser ? "Usuario actualizado" : "Usuario creado",
                text: editingUser
                    ? "Los datos del usuario se actualizaron correctamente."
                    : "El usuario se creó correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar",

                customClass: {
                    popup: "gym-swal-popup",
                    confirmButton: "gym-swal-confirm",
                    cancelButton: "gym-swal-cancel"
                }
            });

            setFormData({
                name: "",
                lastName: "",
                email: "",
                password: "",
                role: "member"
            });

            setShowForm(false);
            setEditingUser(null);

        } catch (error) {
            console.error("Error al crear usuario:", error);

            await Swal.fire({
                title: "Error",
                text: error.message || "No se pudo completar la operación.",
                icon: "error",
                confirmButtonText: "Aceptar",

                customClass: {
                    popup: "gym-swal-popup",
                    confirmButton: "gym-swal-confirm",
                    cancelButton: "gym-swal-cancel"
                }
            });

            setError("");
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);

        setFormData({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: "",
            role: user.role
        });

        setShowForm(true);
    };



    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);

        setFormData({
            name: "",
            lastName: "",
            email: "",
            password: "",
            role: "member"
        });
    };



    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: "¿Eliminar usuario?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,

            customClass: {
                popup: "gym-swal-popup",
                confirmButton: "gym-swal-confirm",
                cancelButton: "gym-swal-cancel"
            }

        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await apiRequest(`/auth/users/${userId}`, {
                method: "DELETE",
                token
            });

            await loadUsers();

            await Swal.fire({
                title: "Usuario eliminado",
                text: "El usuario se eliminó correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar",

                customClass: {
                    popup: "gym-swal-popup",
                    confirmButton: "gym-swal-confirm",
                    cancelButton: "gym-swal-cancel"
                }

            });

        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setError(error.message || "No se pudo eliminar el usuario.");
        }
    };




    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const data = await apiRequest("/auth/users", {
                token
            });

            setUsers(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setError(error.message || "No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <section className="users-management">

            <div className="users-management-header">

                {showForm && (
                    <div className="user-modal-overlay">
                        <form
                            className="user-form"
                            onSubmit={handleCreateUser}
                        >
                            <div className="user-form-title">
                                <img src="/icons/user_icon.svg" alt="" />

                                <h3>
                                    {editingUser
                                        ? "Editar usuario"
                                        : "Crear usuario"}
                                </h3>
                            </div>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nombre"
                            />

                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Apellido"
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Correo electrónico"
                            />

                            {!editingUser && (
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Contraseña"
                                />
                            )}

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="member">Miembro</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Administrador</option>
                            </select>

                            <div className="user-form-actions">

                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                >
                                    Cancelar
                                </button>

                                <button type="submit">
                                    {editingUser
                                        ? "Guardar cambios"
                                        : "Crear usuario"}
                                </button>

                            </div>
                        </form>
                    </div>
                )}

                <h2>Gestión de usuarios</h2>

                <div className="users-management-actions">

                    <button
                        type="button"
                        className="add-user-button"
                        onClick={() => setShowForm(true)}
                    >
                        <img
                            src="/icons/add_icon.svg"
                            alt=""
                        />
                        Crear usuario
                    </button>

                </div>

            </div>

            {loading && <p>Cargando usuarios...</p>}

                    {error && <p>{error}</p>}

                    {!loading && !error && (
                        <div className="users-list">

                            {users.map((user) => (
                                <div
                                    className="user-item"
                                    key={user._id}
                                >

                                    <div>
                                        <strong>
                                            {user.name} {user.lastName}
                                        </strong>

                                        <p>{user.email}</p>
                                    </div>

                                    <div className="user-actions">

                                        <span>{user.role}</span>

                                        <button
                                            type="button"
                                            className="user-action-button"
                                            onClick={() =>
                                                handleEditUser(user)
                                            }
                                            aria-label={`Editar usuario ${user.name}`}
                                        >
                                            <img
                                                src="/icons/edit_icon.svg"
                                                alt=""
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className="user-action-button"
                                            onClick={() =>
                                                handleDeleteUser(user._id)
                                            }
                                            aria-label={`Eliminar usuario ${user.name}`}
                                        >
                                            <img
                                                src="/icons/delete_icon.svg"
                                                alt=""
                                            />
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>
            )}

        </section>
    );

}

export default UsersManagement;