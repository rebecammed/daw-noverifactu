import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import logo from "./assets/inaltera.png";
import { authFetch } from "./utils/authFetch";

function Login({ setUsuario }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo2fa, setCodigo2fa] = useState("");
  const [errores, setErrores] = useState([]);
  const [twofaStep, setTwofaStep] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [mostrarReenviar, setMostrarReenviar] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores([]);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.codigo === "EMAIL_NO_VERIFICADO") {
          setMostrarReenviar(true);
        }

        setErrores([data.error || "Error iniciando sesión"]);
        return;
      }

      // 🔐 Paso 2FA
      if (data.twofaRequired) {
        setTwofaStep(true);
        setTempUserId(data.tempUserId);
        return;
      }

      // ✅ LOGIN NORMAL
      setUsuario(data.usuario);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("token", data.token);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("ERROR FETCH LOGIN:", error);
      setErrores(["Error de conexión"]);
    }
  }

  async function handleSubmit2FA(e) {
    e.preventDefault();
    setErrores([]);

    try {
      const res = await fetch("/api/auth/login/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tempUserId,
          token2fa: codigo2fa,
        }),
      });

      const data = await res.json();
      console.log("RESPUESTA LOGIN:", data);

      if (!res.ok) {
        setErrores([data.error || "Código 2FA incorrecto"]);
        return;
      }

      // Login definitivo
      setUsuario(data.usuario);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("ERROR EN 2FA:", error);
      setErrores(["Error verificando el código 2FA"]);
    }
  }

  async function reenviarVerificacion() {
    await fetch("http://localhost:3000/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    alert("Si el email existe, se ha enviado un enlace de verificación");
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 5, width: "100%", borderRadius: 3 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img src={logo} alt="Logo" style={{ height: 60 }} />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Iniciar sesión
          </Typography>

          {errores.length > 0 && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              {errores.map((e, i) => (
                <Alert key={i} severity="error">
                  {e}
                </Alert>
              ))}
            </Stack>
          )}

          {!twofaStep ? (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />

                <TextField
                  label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />

                <Box>
                  <Link to="/forgot-password" style={{ fontSize: "0.9rem" }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Entrar
                </Button>
                {mostrarReenviar && (
                  <Button
                    type="button"
                    variant="contained"
                    size="large"
                    onClick={reenviarVerificacion}
                  >
                    Reenviar email de verificación
                  </Button>
                )}
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleSubmit2FA}>
              <Stack spacing={2}>
                <TextField
                  label="Código de autenticación"
                  value={codigo2fa}
                  onChange={(e) => setCodigo2fa(e.target.value)}
                  placeholder="123456"
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Verificar código
                </Button>
              </Stack>
            </form>
          )}

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
