import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./member-dashboard.css";

const MemberDashboard = () => {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userRes = await fetch("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await userRes.json();
        if (!userData.success) {
          throw new Error("Sesión inválida");
        }

        // --- VALIDACIÓN DE ROL (TAREA 4) ---
        // Si el rol no es "member" (por ejemplo, es admin o instructor), se bloquea el acceso
        if (userData.data.role !== "member") {
          alert("Acceso denegado: Esta sección es exclusiva para miembros.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setUser(userData.data);

        const classesRes = await fetch("http://localhost:3000/api/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classesData = await classesRes.json();
        if (classesData.success) {
          setClasses(classesData.data);
        }
      } catch (error) {
        console.error("Error cargando el panel:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          fontSize: "18px",
          color: "#6b7280",
        }}
      >
        Cargando panel de miembro...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Miembro - Gimnasio</h1>
        <div className="user-info">
          <span>
            Hola,{" "}
            <b>
              {user?.name} {user?.lastName}
            </b>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="dashboard-card">
          <h2>🏋️ Clases y Cupos Disponibles</h2>
          {classes.length === 0 ? (
            <p className="empty-text">
              No hay clases programadas por el momento.
            </p>
          ) : (
            <ul className="classes-list">
              {classes.map((cls) => (
                <li key={cls.id || cls._id} className="class-item">
                  <div className="class-info">
                    <h3>{cls.title}</h3>
                    <p>{cls.description}</p>
                    <p style={{ fontSize: "12px", color: "#4b5563" }}>
                      Instructor: {cls.instructor}
                    </p>
                    <span className="spots-badge">
                      Cupos disponibles: <b>{cls.availableSpots}</b> /{" "}
                      {cls.capacity}
                    </span>
                  </div>
                  <button
                    className="reserve-btn"
                    disabled={cls.availableSpots <= 0}
                  >
                    {cls.availableSpots > 0 ? "Reservar" : "Agotado"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-card">
          <h2>📅 Mis Reservas</h2>
          <p className="empty-text">
            Aquí podrás ver y cancelar las clases que hayas reservado.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MemberDashboard;
