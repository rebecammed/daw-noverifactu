import {
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const tab = location.pathname.split("/")[1] || false;

  const leftTabs = ["facturacion", "verificadores", "registro", "maestros"];

  const leftValue = leftTabs.includes(tab) ? tab : "";
  const rightValue = tab === "perfil" ? "perfil" : "";

  const menuItems = [
    { label: "Crear factura", value: "facturacion" },
    { label: "Verificador", value: "verificadores" },
    { label: "Registro", value: "registro" },
    { label: "Maestros", value: "maestros" },
    { label: "Perfil", value: "perfil" },
  ];

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "white",
        display: "flex",
        justifyContent: "space-between",
        px: { xs: 1, md: 2 },
      }}
    >
      {/* IZQUIERDA */}
      <Tabs
        value={leftValue}
        onChange={(e, value) => navigate(`/${value}`)}
        textColor="primary"
        indicatorColor="primary"
        variant={isMobile ? "fullWidth" : "standard"}
      >
        <Tab
          label={isMobile ? "Factura" : "Crear factura"}
          value="facturacion"
          sx={{ fontSize: { xs: 12, md: 14 } }}
        />
        <Tab
          label="Verificadores"
          value="verificadores"
          sx={{ fontSize: { xs: 12, md: 14 } }}
        />
        <Tab
          label="Registro"
          value="registro"
          sx={{ fontSize: { xs: 12, md: 14 } }}
        />
        <Tab
          label="Maestros"
          value="maestros"
          sx={{ fontSize: { xs: 12, md: 14 } }}
        />
      </Tabs>

      {/* DERECHA */}
      {!isMobile && (
        <Tabs
          value={rightValue}
          onChange={(e, value) => navigate(`/${value}`)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Perfil" value="perfil" />
        </Tabs>
      )}
    </Box>
  );
}

export default TopNav;
