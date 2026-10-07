import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import CreateClass from "../components/admin/CreateClass";
import CapacityManagement from "../components/admin/CapacityManagement";
import UsersManagement from "../components/admin/UsersManagement";
import EditClass from "../components/admin/EditClass";
import Swal from "sweetalert2";

import "./admin-dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [classesError, setClassesError] = useState("");
  const [search, setSearch] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return () => controller.abort();
    }

    async function loadDashboard() {
      try {
        const options = { token, signal: controller.signal };
        const profile = await apiRequest("/auth/me", options);
        if (controller.signal.aborted) return;

        if (profile.active === false) {
          localStorage.removeItem("token");
          navigate("/login", {
            replace: true,
            state: {
              message: "Tu cuenta está inactiva. Contacta al administrador.",
            },
          });
          return;
        }
        if (profile.role === "member") {
          navigate("/member-dashboard", { replace: true });
          return;
        }
        if (profile.role !== "admin") {
          setAccessError("Esta sección es exclusiva para administradores.");
          return;
        }

        await apiRequest("/auth/admin-dashboard", options);
        if (controller.signal.aborted) return;
        setUser(profile);

        try {
          const records = await apiRequest("/classes", options);
          if (!Array.isArray(records))
            throw new Error(
              "El listado de clases no tiene el formato esperado.",
            );
          if (!controller.signal.aborted) setClasses(records);
        } catch (error) {
          if (error.name === "AbortError" || controller.signal.aborted) return;
          if (error.status === 401 || error.status === 403) throw error;
          setClassesError(error.message);
        }
      } catch (error) {
        if (error.name === "AbortError" || controller.signal.aborted) return;
        if (error.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", {
            replace: true,
            state: {
              message:
                "Tu sesión venció o no es válida. Inicia sesión nuevamente.",
            },
          });
        } else {
          setAccessError(
            error.status === 403
              ? "Tu cuenta no tiene permiso para acceder al panel administrativo."
              : error.message,
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [navigate, attempt]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  function reload() {
    setLoading(true);
    setUser(null);
    setClasses([]);
    setAccessError("");
    setClassesError("");
    setAttempt((value) => value + 1);
  }

  function handleClassCreated() {
    reload();
  }

  const handleAddSchedule = async (classId, classTitle) => {
    const { value: formValues } = await Swal.fire({
      title: `Nuevo horario para ${classTitle}`,
      html: `
      <div style="display: flex; flex-direction: column; gap: 10px; text-align: left; margin-top: 15px;">
        <label for="swal-date" style="font-size: 0.9rem; font-weight: bold; color: #374151;">Fecha de la clase:</label>
        <input id="swal-date" type="date" class="swal2-input" style="margin: 0; width: 100%; max-width: 100%; box-sizing: border-box;">

        <label for="swal-time" style="font-size: 0.9rem; font-weight: bold; color: #374151; margin-top: 10px;">Hora de la clase:</label>
        <input id="swal-time" type="time" class="swal2-input" style="margin: 0; width: 100%; max-width: 100%; box-sizing: border-box;">
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar Horario",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const date = document.getElementById("swal-date").value;
        const time = document.getElementById("swal-time").value;
        if (!date || !time) {
          Swal.showValidationMessage("Debes seleccionar una fecha y una hora");
          return false;
        }
        return { date, time };
      },
    });

    if (formValues) {
      const token = localStorage.getItem("token");
      try {
        await apiRequest(`/classes/${classId}/schedule`, {
          method: "POST",
          token: token,
          body: {
            date: formValues.date,
            time: formValues.time,
          },
        });

        Swal.fire({
          title: "¡Horario agregado!",
          text: `Se ha añadido un nuevo horario a la clase ${classTitle}.`,
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        reload();
      } catch (error) {
        console.error("Error agregando horario:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudo agregar el horario.",
          icon: "error",
          confirmButtonColor: "#e11d48",
        });
      }
    }
  };

  const handleDeleteClass = async (classId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará permanentemente la clase y todos sus horarios. No podrás revertirlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar clase",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");

    try {
      await apiRequest(`/classes/${classId}`, {
        method: "DELETE",
        token: token,
      });

      Swal.fire({
        title: "¡Eliminada!",
        text: "La clase y sus horarios han sido borrados exitosamente.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });

      reload();
    } catch (error) {
      console.error("Error eliminando la clase:", error);
      Swal.fire({
        title: "Error al eliminar",
        text: error.message || "No se pudo eliminar la clase.",
        icon: "error",
        confirmButtonColor: "#e11d48",
      });
    }
  };

  if (loading) {
    return (
      <main className="admin-status" role="status">
        Cargando panel administrativo…
      </main>
    );
  }

  if (accessError || !user) {
    return (
      <main className="admin-status">
        <h1>No se pudo abrir el panel</h1>
        <p role="alert">{accessError || "No se pudo verificar tu sesión."}</p>
        <div className="admin-actions">
          <button className="admin-primary" onClick={reload}>
            Reintentar
          </button>
          <button className="admin-secondary" onClick={logout}>
            Volver al inicio de sesión
          </button>
        </div>
      </main>
    );
  }

  const query = search.trim().toLocaleLowerCase("es");
  const filteredClasses = classes.filter((item) =>
    `${item.title || ""} ${item.instructor || ""}`
      .toLocaleLowerCase("es")
      .includes(query),
  );
  const withSpots = classes.filter(
    (item) => Number.isFinite(item.availableSpots) && item.availableSpots > 0,
  ).length;
  const withoutSpots = classes.filter(
    (item) => Number.isFinite(item.availableSpots) && item.availableSpots <= 0,
  ).length;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a
          href="#admin-overview"
          className="admin-brand"
          aria-label="Dynamic Zone, resumen"
        >
          <span className="admin-brand-mark" aria-hidden="true">
            DZ
          </span>
          <span>
            DYNAMIC ZONE<small>Administración</small>
          </span>
        </a>
        <nav aria-label="Navegación del administrador">
          <a href="#admin-overview">Resumen</a>
          <a href="#admin-classes">Clases registradas</a>
        </nav>
        <div className="admin-coming">
          <p>Próximas funciones</p>
          <span>Gestión de clases</span>
          <span>Usuarios e instructores</span>
          <span>Reservas y reportes</span>
        </div>
        <button className="admin-signout" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-main" id="admin-overview">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">TU GIMNASIO, EN UN VISTAZO</p>
            <h1>Panel del administrador</h1>
            <p>
              Bienvenido, {user.name} {user.lastName}.
            </p>
          </div>
          <span className="admin-role">Administrador</span>
        </header>

        <section
          className="admin-stats"
          aria-label="Resumen de clases registradas"
        >
          <article className="admin-stat">
            <p>Clases registradas</p>
            <strong>{classesError ? "—" : classes.length}</strong>
            <span>En el catálogo del gimnasio</span>
          </article>
          <article className="admin-stat">
            <p>Con cupos registrados</p>
            <strong>{classesError ? "—" : withSpots}</strong>
            <span>Clases con más de cero cupos</span>
          </article>
          <article className="admin-stat">
            <p>Sin cupos registrados</p>
            <strong>{classesError ? "—" : withoutSpots}</strong>
            <span>Clases con cero cupos o menos</span>
          </article>
        </section>
        <p className="admin-note">
          Disponibilidad según los registros actuales. Las reservas todavía no
          están habilitadas.
        </p>

        <UsersManagement />
        <CreateClass onClassCreated={handleClassCreated} />

        <EditClass classes={classes} onClassUpdated={reload} />

        <CapacityManagement classes={classes} onCapacityUpdated={reload} />

        <section
          className="admin-panel"
          id="admin-classes"
          aria-labelledby="admin-classes-title"
        >
          <div className="admin-panel-heading">
            <div>
              <h2 id="admin-classes-title">Clases registradas</h2>
              <p>Consulta la actividad y los cupos de tu gimnasio.</p>
            </div>
            <button className="admin-secondary" onClick={reload}>
              Actualizar
            </button>
          </div>
          <div className="admin-filter">
            <label htmlFor="admin-search">Buscar por clase o instructor</label>
            <input
              id="admin-search"
              type="search"
              placeholder="Ej.: Yoga o nombre del instructor"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {classesError ? (
            <div className="admin-empty" role="alert">
              <h3>No se pudieron cargar las clases</h3>
              <p>{classesError}</p>
              <button className="admin-primary" onClick={reload}>
                Reintentar
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="admin-empty">
              <h3>Aún no hay clases registradas</h3>
              <p>Cuando se registren clases en el gimnasio, aparecerán aquí.</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="admin-empty">
              <h3>No encontramos coincidencias</h3>
              <p>Prueba con otro nombre de clase o instructor.</p>
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="admin-sr-only">
                  Clases, instructores, capacidad y cupos registrados
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Clase</th>
                    <th scope="col">Instructor</th>
                    <th scope="col">Capacidad</th>
                    <th scope="col">Cupos</th>
                    <th scope="col" style={{ textAlign: "center" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((item) => (
                    <tr key={item._id || item.id}>
                      <td>
                        <strong>{item.title || "Sin título"}</strong>
                        <span>{item.description}</span>
                      </td>
                      <td>{item.instructor || "Sin asignar"}</td>
                      <td>
                        {Number.isFinite(item.capacity)
                          ? item.capacity
                          : "Sin dato"}
                      </td>
                      <td>
                        <span
                          className={`admin-spots ${item.availableSpots > 0 ? "admin-spots-open" : ""}`}
                        >
                          {Number.isFinite(item.availableSpots)
                            ? item.availableSpots
                            : "Sin dato"}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn-admin-add"
                          onClick={() =>
                            handleAddSchedule(item._id || item.id, item.title)
                          }
                          aria-label={`Añadir horario a ${item.title}`}
                        >
                          + Horario
                        </button>
                        <button
                          className="btn-admin-delete"
                          onClick={() => handleDeleteClass(item._id || item.id)}
                          aria-label={`Eliminar clase de ${item.title}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <footer className="admin-footer">
          Dynamic Zone · Panel administrativo
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
