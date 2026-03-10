import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import logo from "./assets/inaltera.png";
const API_URL = import.meta.env.VITE_API_URL;
function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [errores, setErrores] = useState([]);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = [];

    if (!aceptaPrivacidad) {
      nuevosErrores.push(
        "Debes aceptar la Política de Privacidad para registrarte.",
      );
    }

    // Validación nombre
    if (!nombre.trim()) {
      nuevosErrores.push("El nombre es obligatorio");
    }

    // Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      nuevosErrores.push("El email no tiene un formato válido");
    }

    // Validación contraseña
    const erroresPassword = [];
    console.log("Validando contraseña...");

    if (password.length < 8) {
      erroresPassword.push("Debe tener al menos 8 caracteres");
    }

    if (!/[A-Z]/.test(password)) {
      erroresPassword.push("Debe incluir al menos una letra mayúscula");
    }

    if (!/[0-9]/.test(password)) {
      erroresPassword.push("Debe incluir al menos un número");
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(password)) {
      erroresPassword.push("Debe incluir al menos un carácter especial");
    }

    if (erroresPassword.length > 0) {
      setErrores(erroresPassword);
      return;
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores([]);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nombre, aceptaPrivacidad }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detalles) {
          setErrores(data.detalles);
        } else {
          setErrores([data.error || "Error en el registro"]);
        }
        return;
      }

      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch {
      setErrores(["Error de conexión con el servidor"]);
    }
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
            Crear cuenta
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

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                fullWidth
              />

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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={aceptaPrivacidad}
                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Acepto la{" "}
                    <a
                      href="/politica-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidad
                    </a>
                  </Typography>
                }
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  bgcolor: "#1a73e8",
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "all 0.2s ease",

                  "&:hover": {
                    bgcolor: "#155ec0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
                disabled={!aceptaPrivacidad}
              >
                Registrarse
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
