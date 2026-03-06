import { useNavigate, useLocation } from "react-router-dom";
import { List, ListItemButton, ListItemText } from "@mui/material";

function SidebarAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const items = [
    { label: "Dashboard", path: "/admin" },
    { label: "Usuarios", path: "/admin/usuarios" },
    { label: "Integridad", path: "/admin/integridad" },
    { label: "Backups", path: "/admin/backups" },
    { label: "Facturación Global", path: "/admin/facturas" },
    { label: "Configuración SIF", path: "/admin/configuracion" },
  ];
  return (
    <List sx={{ p: 0 }}>
      {items.map((item) => (
        <ListItemButton
          key={item.path}
          selected={isActive(item.path)}
          onClick={() => navigate(item.path)}
          sx={{
            width: "100%",
            borderRadius: 0,
            pl: 3,
            pr: 2,
            py: 1.2,

            "&:hover": {
              bgcolor: "#f1f5f9",
            },

            "& .MuiListItemText-root": {
              margin: 0,
            },

            "&.Mui-selected": {
              bgcolor: "#e8f0fe",
              color: "#1a73e8",
              fontWeight: 600,
              borderLeft: "3px solid #1a73e8",
            },

            "&.Mui-selected:hover": {
              bgcolor: "#e8f0fe",
            },
          }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
}

export default SidebarAdmin;
