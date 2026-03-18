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
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/inaltera.png";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Drawer, useTheme, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Header({ usuario, sidebar }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* IZQUIERDA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && sidebar && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
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
      {isMobile && sidebar && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280 } }}
        >
          <Box sx={{ py: 2 }}>{sidebar}</Box>
        </Drawer>
      )}
    </AppBar>
  );
}

export default Header;
