import { List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

function SidebarVerificador() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Verificadores
      </Typography>

      <List>
        <ListItemButton
          selected={isActive("/verificadores/qr")}
          onClick={() => navigate("/verificadores/qr")}
        >
          <ListItemText primary="Verificador QR" />
        </ListItemButton>

        <ListItemButton
          selected={isActive("/verificadores/xml")}
          onClick={() => navigate("/verificadores/xml")}
        >
          <ListItemText primary="Verificador XML / JSON" />
        </ListItemButton>
      </List>
    </>
  );
}

export default SidebarVerificador;
