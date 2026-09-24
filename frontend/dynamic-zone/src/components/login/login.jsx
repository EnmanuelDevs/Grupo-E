import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      if (!data?.token || !data?.usuario?.role) {
        throw new Error("La respuesta del servidor no contiene una sesión válida.");
      }

      // Solo enviamos a pantallas que existen en esta versión.
      const destinations = {
        admin: "/admin-dashboard",
        member: "/member-dashboard",
      };
      const destination = destinations[data.usuario.role];
      if (!destination) {
        throw new Error("El panel de instructor todavía no está disponible.");
      }

      localStorage.setItem("token", data.token);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="background-logo">
        <img src="/Logo hombres.png" alt="" />
      </div>

      <div className="login-box">
        <div className="login-form">
          <h1>Iniciar sesión</h1>

          {(error || location.state?.message) && (
            <div
              role="alert"
              style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}
            >
              {error || location.state?.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                autoComplete="username"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <a href="#" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="login-brand">
          <div className="brand-content">
            <img
              className="main-logo"
              src="/logo vertical.png"
              alt="Logo Dynamic Zone"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;