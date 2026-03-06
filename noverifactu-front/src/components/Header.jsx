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
              component={Link}
              to="/admin"
              sx={{
                bgcolor: "#0f4fb3",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                px: 3,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "all .2s ease",

                "&:hover": {
                  bgcolor: "#0b3d8c",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
                },
              }}
            >
              Panel Admin
            </Button>
          )}

          <Typography variant="body2">{usuario?.email}</Typography>

          <Button
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.4)",
              textTransform: "none",
              fontWeight: 600,
              transition: "all .2s ease",

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
                borderColor: "white",
                transform: "translateY(-1px)",
              },
            }}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
