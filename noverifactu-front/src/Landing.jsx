import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSystem } from "./context/SystemContext";
import logo from "./assets/inaltera.png";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";

function Landing() {
  const { mantenimiento } = useSystem();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/perfil");
    }
  }, [navigate]);

  return (
    <Box textAlign="center">
      <Typography variant="h3" mb={2}>
        INALTERA
      </Typography>

      <Typography mb={4}>Tu solución NO-VERI*FACTU</Typography>

      {/* LOGIN */}
      <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Iniciar sesión
        </Button>

        <Button variant="outlined" onClick={() => navigate("/register")}>
          Registrarse
        </Button>
      </Stack>

      {/* HERRAMIENTAS PUBLICAS */}
      <Typography variant="h6" mb={2}>
        Verificación pública de documentos
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="outlined" onClick={() => navigate("/verificar-qr")}>
          Verificar factura por QR
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/verificadores/xml")}
        >
          Verificar XML / JSON
        </Button>
      </Stack>
    </Box>
  );
}
export default Landing;
/*
<Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 5,
            textAlign: "center",
            width: "100%",
            borderRadius: 3,
          }}
        >
          {/* Logo */ /*}
          <Box sx={{ mb: 3 }}>
            <img src={logo} alt="Logo INALTERA" style={{ width: "120px" }} />
          </Box>

          {/* Nombre */ /*}
          <Typography
            variant="h3"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            INALTERA
          </Typography>

          {/* Eslogan */ /*}
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Tu solución NO-VERI*FACTU
          </Typography>

          {/* Botones */ /*}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/login"
              disabled={mantenimiento}
            >
              Iniciar sesión
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              to="/register"
              disabled={mantenimiento}
            >
              Registrarse
            </Button>
          </Stack>
        </Paper>
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2026 INALTERA · Proyecto Académico DAW ·{" "}
          </Typography>
        </Box>
      </Box>
    </Container>*/
