import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("1. Enviando petición de login con:", { email, password });

      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("2. Status de la respuesta del backend:", response.status);

      const data = await response.json();
      console.log("3. Datos completos que devuelve el backend:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Credenciales inválidas");
      }

      // Validamos dónde viene el token (por si viene dentro de data.token o data.data.token)
      const token = data.token || data.data?.token;

      if (!token) {
        throw new Error("El servidor respondió pero no envió un token válido");
      }

      console.log("4. Token obtenido con éxito:", token);
      localStorage.setItem("token", token);

      navigate("/member-dashboard");
    } catch (err) {
      console.error("❌ Error atrapado en el login:", err);
      setError(err.message || "Error al conectar con el servidor");
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

          {error && (
            <div
              style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <a href="#" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit">Iniciar sesión</button>
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
