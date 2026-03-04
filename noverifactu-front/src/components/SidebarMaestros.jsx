import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

function SidebarMaestros() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Maestros
      </Typography>

      <List>
        <ListItemButton
          selected={isActive("/maestros/clientes")}
          onClick={() => navigate("/maestros/clientes")}
        >
          <ListItemText primary="Clientes" />
        </ListItemButton>

        <ListItemButton
          selected={isActive("/maestros/productos")}
          onClick={() => navigate("/maestros/productos")}
        >
          <ListItemText primary="Productos" />
        </ListItemButton>
      </List>
    </>
  );
}

export default SidebarMaestros;
