import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

function SidebarPerfil() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Configuración
      </Typography>

      <List>
        <ListItemButton
          selected={isActive("/perfil/dashboard")}
          onClick={() => navigate("/perfil/dashboard")}
        >
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton
          selected={isActive("/perfil/empresa")}
          onClick={() => navigate("/perfil/empresa")}
        >
          <ListItemText primary="Empresa" />
        </ListItemButton>

        <ListItemButton
          selected={isActive("/perfil/tarifas")}
          onClick={() => navigate("/perfil/tarifas")}
        >
          <ListItemText primary="Tarifas" />
        </ListItemButton>

        <ListItemButton
          selected={isActive("/perfil/seguridad")}
          onClick={() => navigate("/perfil/seguridad")}
        >
          <ListItemText primary="Seguridad" />
        </ListItemButton>

        <ListItemButton
          selected={isActive("/perfil/sif")}
          onClick={() => navigate("/perfil/sif")}
        >
          <ListItemText primary="SIF" />
        </ListItemButton>
      </List>
    </>
  );
}

export default SidebarPerfil;
