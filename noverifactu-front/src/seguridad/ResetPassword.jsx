import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrores([]);
    setMensaje(null);

    if (!token) {
      setErrores(["Token inválido o ausente"]);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          nuevaPassword,
          repetirPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detalles) {
          setErrores(data.detalles);
        } else {
          setErrores([data.error || "Error restableciendo contraseña"]);
        }
        return;
      }

      setMensaje("Contraseña actualizada correctamente. Redirigiendo...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("ERROR RESET FRONT:", error);
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
            Restablecer contraseña
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

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Nueva contraseña"
                type={mostrarPassword ? "text" : "password"}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                fullWidth
                slotProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        edge="end"
                      >
                        {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {nuevaPassword && (
                <Box sx={{ fontSize: "0.85rem" }}>
                  <Typography
                    color={nuevaPassword.length >= 8 ? "success.main" : "error"}
                  >
                    • Mínimo 8 caracteres
                  </Typography>

                  <Typography
                    color={
                      /[A-Z]/.test(nuevaPassword) ? "success.main" : "error"
                    }
                  >
                    • Al menos una mayúscula
                  </Typography>

                  <Typography
                    color={
                      /[0-9]/.test(nuevaPassword) ? "success.main" : "error"
                    }
                  >
                    • Al menos un número
                  </Typography>

                  <Typography
                    color={
                      /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(
                        nuevaPassword,
                      )
                        ? "success.main"
                        : "error"
                    }
                  >
                    • Al menos un carácter especial
                  </Typography>
                </Box>
              )}
              <TextField
                label="Repetir contraseña"
                type={mostrarPassword ? "text" : "password"}
                value={repetirPassword}
                onChange={(e) => setRepetirPassword(e.target.value)}
                required
                fullWidth
                error={
                  repetirPassword.length > 0 &&
                  repetirPassword !== nuevaPassword
                }
                helperText={
                  repetirPassword.length > 0 &&
                  repetirPassword !== nuevaPassword
                    ? "Las contraseñas no coinciden"
                    : ""
                }
                slotProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        edge="end"
                      >
                        {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
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
                disabled={
                  nuevaPassword.length < 8 ||
                  !/[A-Z]/.test(nuevaPassword) ||
                  !/[0-9]/.test(nuevaPassword) ||
                  !/[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\/`~;]/.test(
                    nuevaPassword,
                  ) ||
                  nuevaPassword !== repetirPassword
                }
              >
                Cambiar contraseña
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default ResetPassword;
