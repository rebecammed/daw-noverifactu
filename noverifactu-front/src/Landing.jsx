import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSystem } from "./context/SystemContext";

import PublicHeader from "./components/PublicHeader";
import Footer from "./components/Footer";

import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
} from "@mui/material";

function Landing() {
  const { mantenimiento } = useSystem();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/perfil");
  }, [navigate]);

  return (
    <Box
      sx={{
        bgcolor: "#f6f8fb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 4,
            border: "1px solid #eee",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* HERO */}

          <Container
            maxWidth="md"
            sx={{
              textAlign: "center",
              mt: 4,
              mb: 6,
              bgcolor: "linear-gradient(180deg,#f6f8fb 0%,#ffffff 100%)",
            }}
          >
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              INALTERA
            </Typography>

            <Typography variant="h5" color="text.secondary" mb={5}>
              Plataforma de gestión y verificación de facturas electrónicas con
              integridad garantizada.
            </Typography>

            {/* VERIFICADORES PUBLICOS */}
            <Stack direction="row" spacing={3} justifyContent="center" mt={4}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  bgcolor: "#1a73e8",
                  color: "#fff",
                  transition: "all 0.2s ease",

                  "&:hover": {
                    bgcolor: "#155ec0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => navigate("/verificadores")}
              >
                Verificar XML / JSON
              </Button>
            </Stack>
          </Container>

          {/* VENTAJAS */}
          <Container maxWidth="lg" sx={{ mt: 10 }}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #eee",
                    height: "100%",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography fontWeight="bold" mb={1} fontSize="1.2rem">
                    Integridad garantizada
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    Cada factura se registra con eventos encadenados que
                    permiten verificar su integridad.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #eee",
                    height: "100%",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography fontWeight="bold" mb={1} fontSize="1.2rem">
                    Verificación pública
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Cualquier usuario puede comprobar la autenticidad de un
                    documento mediante QR o XML.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #eee",
                    height: "100%",
                    textAlign: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography fontWeight="bold" mb={1} fontSize="1.2rem">
                    Cumplimiento normativo
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Inspirado en el modelo de control de integridad del sistema
                    Veri*Factu.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Container>
      <Box sx={{ mt: "auto" }}>
        <Footer />
      </Box>
    </Box>
  );
}

export default Landing;
