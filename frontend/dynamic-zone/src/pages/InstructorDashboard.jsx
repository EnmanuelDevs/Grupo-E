import { useEffect, useState } from "react";
import { useNavigate, } from "react-router-dom";

import "./instructor-Dashboard.css"

const InstructorDashboard = () => {
    const [user, setUser] = useState(null)
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)

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

                if (!userData.success) {
                    throw new Error("Sesión inválida");
                }

                if (userData.data.role !== "instructor") {
                    alert("Acceso denegado: Esta sección es exclusiva para instructores.");
                    navigate("/login");
                    return;
                }

                setUser(userData.data);

                const instructorName = `${userData.data.name} ${userData.data.lastName}`;

                const classesRes = await fetch(
                    "http://localhost:3000/api/classes",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const classesData = await classesRes.json();

                if (classesData.success) {
                    const assignedClasses = classesData.data.filter(
                        (classItem) => classItem.instructor === instructorName
                    );

                    setClasses(assignedClasses);
                }

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



    if (loading) {
        return (

            <div className="instructor-loading">
                Panel Instructor
            </div>
        );
    }


    return (

        <div className="instructor-dashboard">

            <header className="instructor-header">

                <div>

                    <h1>Panel de Instructor</h1>

                    <p>
                        Bienvenido,{" "}
                        <strong>
                            {user?.name} {user?.lastName}
                        </strong>
                    </p>

                </div>

                <button onClick={handleLogout}
                    className="instructor-logout-btn">
                    Cerrar Sesión
                </button>

            </header>

            <main className="instructor-main">

                <section className="instructor-card">
                    <h2>Mis Clases</h2>

                    {classes.length === 0 ? (

                        <p className="instructor-empty">
                            No tienes clases asignadas acualmente.
                        </p>
                    ) : (

                        <div className="instructor-classes-list">

                            {classes.map((cls) => (

                                <div
                                    key={cls.id || cls._id}
                                    className="instructor-class-item"
                                >

                                    <h3>{cls.title}</h3>

                                    <p>{cls.description}</p>

                                    <p>
                                        <strong>Instructor:</strong>{" "}
                                        {cls.availableSpots} / {cls.capacity}
                                    </p>

                                </div>
                            ))}

                        </div>

                    )}

                </section>

                <section className="instructor-card">

                    <h2>Mis Horarios</h2>

                    <p className="instructor-empty">
                        Aquí se mostrarán los horarios de las clases
                        asignadas al instructor.
                    </p>

                </section>

            </main>

        </div>
    );
};



export default InstructorDashboard;