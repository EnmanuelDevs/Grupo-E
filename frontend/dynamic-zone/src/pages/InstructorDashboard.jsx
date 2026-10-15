import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LogOut,
    UsersRound,
    Dumbbell,
    CalendarDays,
    Clock,
} from "lucide-react";

import "./instructor-Dashboard.css";

const InstructorDashboard = () => {
    const [user, setUser] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const userRes = await fetch(
                    "http://localhost:3000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const userData = await userRes.json();

                if (!userRes.ok || !userData.success) {
                    throw new Error("Sesión inválida");
                }

                if (userData.data.role !== "instructor") {
                    alert(
                        "Acceso denegado: Esta sección es exclusiva para instructores."
                    );
                    navigate("/login");
                    return;
                }

                setUser(userData.data);

                const instructorName =
                    `${userData.data.name} ${userData.data.lastName}`.trim();

                const classesRes = await fetch(
                    "http://localhost:3000/api/classes",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const classesData = await classesRes.json();

                if (!classesRes.ok || !classesData.success) {
                    throw new Error("No se pudieron cargar las clases");
                }

                const assignedClasses = classesData.data.filter(
                    (classItem) => classItem.instructor === instructorName
                );

                setClasses(assignedClasses);
            } catch (error) {
                console.error(
                    "Error cargando el panel del instructor:",
                    error
                );

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

    const totalClasses = classes.length;


    const getScheduleSpots = (schedule, cls) => {
        const available =
            schedule.availableSpots != null
                ? Number(schedule.availableSpots)
                : null;

        const occupied =
            schedule.occupiedSpots != null
                ? Number(schedule.occupiedSpots)
                : Array.isArray(schedule.participants)
                    ? schedule.participants.length
                    : null;

        const capacity =
            schedule.totalCapacity != null
                ? Number(schedule.totalCapacity)
                : schedule.capacity != null
                    ? Number(schedule.capacity)
                    : cls.capacity != null
                        ? Number(cls.capacity)
                        : null;

        return {
            available:
                available != null && Number.isFinite(available)
                    ? Math.max(0, available)
                    : capacity != null && occupied != null
                        ? Math.max(0, capacity - occupied)
                        : 0,

            capacity:
                capacity != null && Number.isFinite(capacity)
                    ? Math.max(0, capacity)
                    : available != null && occupied != null
                        ? Math.max(0, available + occupied)
                        : 0,
        };
    };


    const totalAvailableSpots = classes.reduce((total, cls) => {
        const schedules = Array.isArray(cls.schedules)
            ? cls.schedules
            : [];

        if (schedules.length === 0) {
            return total + (Number(cls.availableSpots) || 0);
        }

        return total + schedules.reduce(
            (scheduleTotal, schedule) =>
                scheduleTotal +
                getScheduleSpots(schedule, cls).available,
            0
        );
    }, 0);


    const formatScheduleDate = (dateString) => {
        if (!dateString) {
            return "Fecha no disponible";
        }

        const [year, month, day] = String(dateString)
            .slice(0, 10)
            .split("-")
            .map(Number);

        if (!year || !month || !day) {
            return "Fecha no disponible";
        }

        const date = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat("es-DO", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const getClassSchedules = (cls) => {
        return [...(cls.schedules || [])].sort((a, b) => {
            const dateComparison = String(a.date || "").localeCompare(
                String(b.date || "")
            );

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return String(a.time || "").localeCompare(
                String(b.time || "")
            );
        });
    };

    if (loading) {
        return (
            <div className="instructor-loading">
                <div className="instructor-spinner" />
                <p>Cargando panel de instructor...</p>
            </div>
        );
    }

    return (
        <div className="instructor-dashboard">
            <header className="instructor-header">
                <div className="instructor-welcome">
                    <h1>Panel de Instructor</h1>

                    <p>
                        Bienvenido,{" "}
                        <strong>
                            {user?.name} {user?.lastName}
                        </strong>
                    </p>
                </div>

                <div className="instructor-header-actions">
                    <div className="instructor-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "I"}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="instructor-logout-btn"
                    >
                        <LogOut size={17} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </header>

            <main className="instructor-main">
                {/* Métricas principales */}
                <section className="instructor-metrics">
                    <article className="instructor-metric-card">
                        <div>
                            <p className="instructor-metric-label">
                                Mis clases
                            </p>

                            <h2>{totalClasses}</h2>


                        </div>

                        <div className="instructor-metric-icon">
                            <Dumbbell size={24} />
                        </div>
                    </article>

                    <article className="instructor-metric-card">
                        <div>
                            <p className="instructor-metric-label">
                                Cupos disponibles
                            </p>

                            <h2>{totalAvailableSpots}</h2>


                        </div>

                        <div className="instructor-metric-icon">
                            <UsersRound size={24} />
                        </div>
                    </article>
                </section>

                {/* Clases y horarios en una sola sección */}
                <section className="instructor-card">
                    <div className="instructor-section-heading">
                        <div>
                            <h2>Mis clases y horarios</h2>

                            <p>
                                Consulta tus clases asignadas y sus horarios.
                            </p>
                        </div>

                        <span className="instructor-count">
                            {totalClasses}{" "}
                            {totalClasses === 1 ? "clase" : "clases"}
                        </span>
                    </div>

                    {classes.length === 0 ? (
                        <p className="instructor-empty">
                            No tienes clases asignadas actualmente.
                        </p>
                    ) : (
                        <div className="instructor-classes-list">
                            {classes.map((cls) => {
                                const schedules = getClassSchedules(cls);


                                return (
                                    <article
                                        key={cls.id || cls._id}
                                        className="instructor-class-item"
                                    >
                                        <div className="instructor-class-header">
                                            <div className="instructor-class-icon">
                                                <Dumbbell size={21} />
                                            </div>

                                            <div className="instructor-class-info">
                                                <h3>{cls.title}</h3>

                                                <p>
                                                    {cls.description ||
                                                        "Sin descripción disponible."}
                                                </p>

                                            </div>

                                            <span className="instructor-schedule-count">
                                                {schedules.length}{" "}
                                                {schedules.length === 1
                                                    ? "horario"
                                                    : "horarios"}
                                            </span>
                                        </div>

                                        <div className="instructor-class-schedules">
                                            {schedules.length === 0 ? (
                                                <p className="instructor-no-schedules">
                                                    Esta clase todavía no tiene horarios
                                                    asignados.
                                                </p>
                                            ) : (
                                                schedules.map((schedule) => (
                                                    <div
                                                        key={schedule._id}
                                                        className="instructor-schedule-row"
                                                    >
                                                        <div className="instructor-schedule-date">
                                                            <CalendarDays size={18} />

                                                            <span>
                                                                {formatScheduleDate(schedule.date)}
                                                            </span>
                                                        </div>

                                                        <div className="instructor-schedule-time">
                                                            <Clock size={18} />

                                                            <span>
                                                                {schedule.time ||
                                                                    "Hora no disponible"}
                                                            </span>
                                                        </div>


                                                        <div className="instructor-schedule-spots">
                                                            <UsersRound size={18} />

                                                            <span>
                                                                Cupos:{" "}
                                                                <strong>
                                                                    {getScheduleSpots(schedule, cls).available}/
                                                                    {getScheduleSpots(schedule, cls).capacity}
                                                                </strong>
                                                            </span>
                                                        </div>

                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default InstructorDashboard;