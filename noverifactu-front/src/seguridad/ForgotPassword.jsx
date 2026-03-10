import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  TextField,
  Button,
} from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [errores, setErrores] = useState([]);
  const [linkDev, setLinkDev] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores([]);
    setMensaje(null);
    setLinkDev(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrores([data.error || "Error procesando solicitud"]);
        return;
      }

      // 🔐 Mensaje neutro (seguridad)
      setMensaje(
        "Si el email existe en el sistema, recibirás instrucciones para restablecer tu contraseña.",
      );

      // 👇 En desarrollo mostramos el enlace
      if (data.resetLink) {
        setLinkDev(data.resetLink);
      }
    } catch (err) {
      console.error("ERROR FORGOT PASSWORD:", err);
      setErrores(["Error de conexión"]);
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
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Recuperar contraseña
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

          {mensaje && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {mensaje}
            </Alert>
          )}

          {linkDev && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                🔧 Enlace de recuperación (modo desarrollo):
              </Typography>
              <Typography
                component="a"
                href={linkDev}
                sx={{
                  display: "block",
                  mt: 1,
                  wordBreak: "break-all",
                  color: "primary.main",
                }}
              >
                {linkDev}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
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
                fullWidth
              >
                Enviar instrucciones
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
