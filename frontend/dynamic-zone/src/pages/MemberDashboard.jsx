import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./member-dashboard.css";
import Swal from "sweetalert2";

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

  const userId = user?.id || user?._id;

  const myReservations = classes.filter(
    (cls) => cls.participants && cls.participants.includes(userId),
  );

  const handleReserve = async (classId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/classes/${classId}/reserve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "¡Reserva Confirmada!",
          text: "Tu lugar en la clase ha sido asegurado con éxito.",
          icon: "success",
          confirmButtonText: "Genial",
          confirmButtonColor: "#10b981",
          background: "#f8f9fa",
          color: "#333",

          customClass: {
            popup: "gym-swal-popup",
            confirmButton: "gym-swal-confirm",
            cancelButton: "gym-swal-cancel"
          }
        });

        setClasses((prevClasses) =>
          prevClasses.map((cls) => {
            const currentId = cls.id || cls._id;
            if (currentId === classId) {
              return {
                ...cls,
                availableSpots: cls.availableSpots - 1,
                participants: [...(cls.participants || []), userId],
              };
            }
            return cls;
          }),
        );
      } else {
        Swal.fire({
          title: "No se pudo reservar",
          text: data.error,
          icon: "warning",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#e11d48",
          background: "#f8f9fa",
          color: "#333",

          customClass: {
            popup: "gym-swal-popup",
            confirmButton: "gym-swal-confirm",
            cancelButton: "gym-swal-cancel"
          }
        });
      }
    } catch (error) {
      console.error("Error realizando la reserva:", error);

      Swal.fire({
        title: "Error de conexión",
        text: "Hubo un problema de conexión al intentar reservar. Inténtalo más tarde.",
        icon: "error",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#333",

        customClass: {
          popup: "gym-swal-popup",
          confirmButton: "gym-swal-confirm",
          cancelButton: "gym-swal-cancel"
        }
      });
    }
  };

  const handleCancelReservation = async (classId) => {
    console.log("CLICK EN CANCELAR", classId);

    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "¿Estás seguro de que deseas cancelar esta reserva?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener",
      reverseButtons: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      background: "#f8f9fa",
      color: "#333",


      customClass: {
        popup: "gym-swal-popup",
        confirmButton: "gym-swal-confirm",
        cancelButton: "gym-swal-cancel"
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/classes/${classId}/reserve`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: "Reserva cancelada",
          text: "Tu reserva se canceló correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#10b981",
          background: "#f8f9fa",
          color: "#333",

          customClass: {
            popup: "gym-swal-popup",
            confirmButton: "gym-swal-confirm",
            cancelButton: "gym-swal-cancel"
          }
        });

        setClasses((prevClasses) =>
          prevClasses.map((cls) => {
            const currentId = cls.id || cls._id;

            if (currentId === classId) {
              return {
                ...cls,
                availableSpots: cls.availableSpots + 1,
                participants: (cls.participants || []).filter(
                  (participantId) => participantId !== userId,
                ),
              };
            }

            return cls;
          }),
        );
      } else {
        Swal.fire({
          title: "No se pudo cancelar",
          text: data.error,
          icon: "warning",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#e11d48",
          background: "#f8f9fa",
          color: "#333",
        });
      }
    } catch (error) {
      console.error("Error cancelando la reserva:", error);

      Swal.fire({
        title: "Error de conexión",
        text: "Hubo un problema de conexión al intentar cancelar la reserva.",
        icon: "error",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#333",
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tu panel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="welcome-message">
            <h1>
              Hola, {user?.name} {user?.lastName}
            </h1>
            <p className="text-muted">
              Aquí tienes el resumen de tu actividad.
            </p>
          </div>
          <div className="user-controls">
            <div className="user-avatar">
              {user?.name?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="metrics-row">
            <div className="metric-card">
              <span className="metric-title">Estado de Membresía</span>
              <span className="metric-badge success">Activa</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Clases Reservadas</span>
              <span className="metric-value">{myReservations.length}</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Clases Disponibles</span>
              <span className="metric-value">{classes.length} opciones</span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-card classes-card">
              <div className="card-header">
                <h2>Explorar Clases</h2>
              </div>

              <div className="card-body">
                {classes.length === 0 ? (
                  <p className="empty-text">
                    No hay clases programadas por el momento.
                  </p>
                ) : (
                  <ul className="classes-list">
                    {classes.map((cls) => {
                      const isReserved =
                        cls.participants && cls.participants.includes(userId);

                      return (
                        <li key={cls.id || cls._id} className="class-item">
                          <div className="class-info">
                            <div className="class-header">
                              <h3>{cls.title}</h3>
                              <span className="spots-badge">
                                {cls.availableSpots} / {cls.capacity} cupos
                              </span>
                            </div>

                            <p className="class-description">
                              {cls.description}
                            </p>
                            <p className="class-instructor">
                              <strong>Instructor:</strong>{" "}
                              {cls.instructor?.name
                                ? `${cls.instructor.name} ${cls.instructor.lastName}`
                                : cls.instructor}
                            </p>

                            {cls.schedules && cls.schedules.length > 0 ? (
                              <div className="class-schedules">
                                <strong>Horarios:</strong>
                                <ul>
                                  {cls.schedules.map((schedule, index) => (
                                    <li key={index}>
                                      <span className="schedule-date">
                                        {schedule.date}
                                      </span>
                                      <span className="schedule-time">
                                        {schedule.time}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="no-schedules">
                                Aún no hay horarios asignados.
                              </p>
                            )}
                          </div>
                          <div className="class-actions">
                            <button
                              className={
                                isReserved ? "btn-secondary" : "btn-primary"
                              }
                              disabled={cls.availableSpots <= 0 || isReserved}
                              onClick={() => handleReserve(cls.id || cls._id)}
                            >
                              {isReserved
                                ? "Ya reservada"
                                : cls.availableSpots > 0
                                  ? "Reservar Clase"
                                  : "Agotado"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="dashboard-card reservations-card">
              <div className="card-header">
                <h2>Mis Reservas</h2>
              </div>
              <div className="card-body">
                {myReservations.length === 0 ? (
                  <div className="center-content">
                    <p className="empty-text">
                      Aún no tienes reservas activas.
                    </p>
                    <button className="btn-secondary">Explorar clases</button>
                  </div>
                ) : (
                  <ul className="classes-list">
                    {myReservations.map((res) => (
                      <li
                        key={`my-res-${res.id || res._id}`}
                        className="class-item"
                      >
                        <div className="class-info">
                          <div className="class-header">
                            <h3>{res.title}</h3>
                            <span className="metric-badge success">
                              Confirmada
                            </span>
                          </div>
                          <p
                            className="class-instructor"
                          >
                            <strong>Instructor:</strong>{" "}
                            {res.instructor?.name
                              ? `${res.instructor.name} ${res.instructor.lastName}`
                              : res.instructor}
                          </p>
                        </div>
                          <button
                            className="btn-cancel-reservation"
                            onClick={() =>
                              handleCancelReservation(res.id || res._id)
                            }
                          >
                            Cancelar reserva
                          </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );


};

export default MemberDashboard;
