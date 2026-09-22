import "./login.css";

function Login() {
    return (
        <div className="login-container">

            <div className="background-logo">
                <img src="/Logo hombres.png" alt="" />
            </div>

            <div className="login-box">
                <div className="login-form">
                    <h1>Iniciar sesión</h1>

                    <form>
                        <div className="form-group">
                            <label htmlFor="email">Correo electrónico</label>

                            <input type="email" id="email" placeholder="correo@ejemplo.com" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>

                            <input type="password" id="password" placeholder="••••••••" />

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
