import { NavLink } from "react-router-dom";
import { List, ListItemButton, ListItemText } from "@mui/material";

function SidebarAdmin() {
  return (
    <List>
      <ListItemButton component={NavLink} to="/admin">
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      <ListItemButton component={NavLink} to="/admin/usuarios">
        <ListItemText primary="Usuarios" />
      </ListItemButton>

      <ListItemButton component={NavLink} to="/admin/integridad">
        <ListItemText primary="Integridad" />
      </ListItemButton>

      <ListItemButton component={NavLink} to="/admin/backups">
        <ListItemText primary="Backups" />
      </ListItemButton>

      <ListItemButton component={NavLink} to="/admin/facturas">
        <ListItemText primary="Facturación Global" />
      </ListItemButton>

      <ListItemButton component={NavLink} to="/admin/configuracion">
        <ListItemText primary="Configuración SIF" />
      </ListItemButton>
    </List>
  );
}

export default SidebarAdmin;
