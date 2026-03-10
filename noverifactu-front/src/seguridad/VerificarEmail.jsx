import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;
function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [estado, setEstado] = useState("verificando");
  // verificando | ok | error

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setEstado("error");
      return;
    }

    async function verificar() {
      try {
        const res = await fetch(
          `${API_URL}/api/auth/verificar-email?token=${token}`,
        );

        const data = await res.json();

        if (!res.ok) {
          setEstado("error");
          return;
        }

        setEstado("ok");
      } catch {
        setEstado("error");
      }
    }

    verificar();
  }, [searchParams]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
        {estado === "verificando" && (
          <>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Verificando tu email...</Typography>
          </>
        )}

        {estado === "ok" && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Email verificado correctamente 🎉
            </Alert>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Ir al login
            </Button>
          </>
        )}

        {estado === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              El enlace es inválido o ha expirado.
            </Alert>
            <Button variant="outlined" onClick={() => navigate("/login")}>
              Volver al login
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default VerificarEmail;
