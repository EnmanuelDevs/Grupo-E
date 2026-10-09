import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./member-dashboard.css";
import Swal from "sweetalert2";
import { ShieldCheck, CalendarCheck, Dumbbell, } from "lucide-react";



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

  const myReservations = [];
  classes.forEach((cls) => {
    if (cls.schedules) {
      cls.schedules.forEach((sch) => {
        if (sch.participants && sch.participants.includes(userId)) {
          myReservations.push({
            classId: cls.id || cls._id,
            title: cls.title,
            instructor: cls.instructor,
            scheduleId: sch._id,
            date: sch.date,
            time: sch.time,
          });
        }
      });
    }
  });

  const handleReserve = async (scheduleId, classId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/classes/${scheduleId}/reserve`,
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
          text: "Tu lugar en el horario seleccionado ha sido asegurado con éxito.",
          icon: "success",
          confirmButtonText: "Genial",
          confirmButtonColor: "#10b981",
          background: "#f8f9fa",
          color: "#333",
          customClass: {
            popup: "gym-swal-popup",
            confirmButton: "gym-swal-confirm",
            cancelButton: "gym-swal-cancel",
          },
        });

        setClasses((prevClasses) =>
          prevClasses.map((cls) => {
            if ((cls.id || cls._id) === classId) {
              return {
                ...cls,
                schedules: cls.schedules.map((sch) => {
                  if (sch._id === scheduleId) {
                    return {
                      ...sch,
                      availableSpots: sch.availableSpots - 1,
                      participants: [...(sch.participants || []), userId],
                    };
                  }
                  return sch;
                }),
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
            cancelButton: "gym-swal-cancel",
          },
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
          cancelButton: "gym-swal-cancel",
        },
      });
    }
  };

  const handleCancelReservation = async (scheduleId, classId) => {
    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "¿Estás seguro de que deseas cancelar este horario?",
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
        cancelButton: "gym-swal-cancel",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/classes/${scheduleId}/reserve`,
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
            cancelButton: "gym-swal-cancel",
          },
        });

        setClasses((prevClasses) =>
          prevClasses.map((cls) => {
            if ((cls.id || cls._id) === classId) {
              return {
                ...cls,
                schedules: cls.schedules.map((sch) => {
                  if (sch._id === scheduleId) {
                    return {
                      ...sch,
                      availableSpots: sch.availableSpots + 1,
                      participants: (sch.participants || []).filter(
                        (pId) => pId !== userId,
                      ),
                    };
                  }
                  return sch;
                }),
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
              <div className="metric-icon">
                <ShieldCheck size={30} strokeWidth={1.7} />
              </div>
              <span className="metric-title">Estado de Membresía</span>
              <span className="metric-badge success">Activa</span>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <CalendarCheck size={30} strokeWidth={1.7} />
              </div>
              <span className="metric-title">Reservas Activas</span>
              <span className="metric-value">{myReservations.length}</span>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <Dumbbell size={30} strokeWidth={1.7} />
              </div>
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
                    {classes.map((cls) => (
                      <li key={cls.id || cls._id} className="class-item">
                        <div className="class-info">
                          <div className="class-header">
                            <h3>{cls.title}</h3>
                          </div>

                          <p className="class-description">{cls.description}</p>
                          <p className="class-instructor">
                            <strong>Instructor:</strong>{" "}
                            {cls.instructor?.name
                              ? `${cls.instructor.name} ${cls.instructor.lastName}`
                              : cls.instructor}
                          </p>

                          {cls.schedules && cls.schedules.length > 0 ? (
                            <div
                              className="class-schedules"
                              style={{ marginTop: "15px" }}
                            >
                              <strong>Horarios Disponibles:</strong>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  marginTop: "10px",
                                }}
                              >
                                {cls.schedules.map((schedule) => {
                                  const isReserved =
                                    schedule.participants &&
                                    schedule.participants.includes(userId);

                                  return (
                                    <li
                                      key={schedule._id}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        background: "#f8f9fa",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      <div>
                                        <span
                                          className="schedule-date"
                                          style={{
                                            fontWeight: "500",
                                            marginRight: "10px",
                                          }}
                                        >
                                          {schedule.date}
                                        </span>
                                        <span
                                          className="schedule-time"
                                          style={{
                                            color: "#4b5563",
                                            marginRight: "15px",
                                          }}
                                        >
                                          {schedule.time}
                                        </span>
                                        <span
                                          className="spots-badge"
                                          style={{ fontSize: "0.8rem" }}
                                        >
                                          {schedule.availableSpots} cupos
                                        </span>
                                      </div>

                                      <button
                                        style={{
                                          padding: "6px 12px",
                                          fontSize: "0.85rem",
                                        }}
                                        className={
                                          isReserved
                                            ? "btn-secondary"
                                            : "btn-primary"
                                        }
                                        disabled={
                                          schedule.availableSpots <= 0 ||
                                          isReserved
                                        }
                                        onClick={() =>
                                          handleReserve(
                                            schedule._id,
                                            cls.id || cls._id,
                                          )
                                        }
                                      >
                                        {isReserved
                                          ? "Reservado"
                                          : schedule.availableSpots > 0
                                            ? "Reservar"
                                            : "Agotado"}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : (
                            <p
                              className="no-schedules"
                              style={{ marginTop: "15px", color: "#6b7280" }}
                            >
                              Aún no hay horarios asignados.
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
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
                  </div>
                ) : (
                  <ul className="classes-list">
                    {myReservations.map((res) => (
                      <li
                        key={`my-res-${res.scheduleId}`}
                        className="class-item"
                      >
                        <div className="class-info">
                          <div className="class-header">
                            <h3>{res.title}</h3>
                            <span className="metric-badge success">
                              Confirmada
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: "10px",
                              background: "#f0fdf4",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #dcfce7",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                color: "#166534",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                              }}
                            >
                              {res.date} a las {res.time}
                            </p>
                          </div>

                          <p
                            className="class-instructor"
                            style={{ marginTop: "10px" }}
                          >
                            <strong>Instructor:</strong>{" "}
                            {res.instructor?.name
                              ? `${res.instructor.name} ${res.instructor.lastName}`
                              : res.instructor}
                          </p>
                        </div>
                        <div style={{ marginTop: "15px" }}>
                          <button
                            className="btn-cancel-reservation"
                            onClick={() =>
                              handleCancelReservation(
                                res.scheduleId,
                                res.classId,
                              )
                            }
                          >
                            Cancelar reserva
                          </button>
                        </div>
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
