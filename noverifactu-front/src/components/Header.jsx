import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate, useState, Link } from "react-router-dom";
import logo from "../assets/inaltera.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Header({ usuario }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* IZQUIERDA */}
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={logo}
            alt="Logo INALTERA"
            style={{ height: "34px", marginRight: "10px" }}
          />
        </Box>

        {/* DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <AccountCircleIcon />
            <Typography
              variant="body2"
              sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
            >
              {usuario?.email}
            </Typography>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                navigate("/perfil");
                setAnchorEl(null);
              }}
            >
              Perfil
            </MenuItem>

            {usuario?.rol === "ADMIN" && (
              <MenuItem
                onClick={() => {
                  navigate("/admin");
                  setAnchorEl(null);
                }}
              >
                Panel Admin
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                cerrarSesion();
                setAnchorEl(null);
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
