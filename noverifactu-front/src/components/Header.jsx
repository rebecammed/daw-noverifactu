import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/inaltera.png";

function Header({ usuario }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* IZQUIERDA */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            onClick={() => navigate("/dashboard")}
            alt="Logo INALTERA"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <Typography variant="h6" fontWeight="bold"></Typography>
        </Box>

        {/* DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* BOTÓN ADMIN SOLO SI ES ADMIN */}
          {usuario?.rol === "ADMIN" && (
            <Button
              variant="contained"
              component={Link}
              to="/admin"
              sx={{
                bgcolor: "#1a237e", // Azul oscuro profesional (Indigo 900 de MUI)
                color: "white",
                fontWeight: "bold",
                px: 3,
                borderRadius: 1,
                textTransform: "none", // Evita que salga todo en mayúsculas si prefieres un look más moderno
                "&:hover": {
                  bgcolor: "#0d47a1", // Un azul ligeramente distinto al pasar el ratón
                },
              }}
            >
              Panel Admin
            </Button>
          )}

          <Typography variant="body2">{usuario?.email}</Typography>

          <Button variant="outlined" color="inherit" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
