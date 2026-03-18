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
    { label: "Verificadores", value: "verificadores" },
    { label: "Registro", value: "registro" },
    { label: "Maestros", value: "maestros" },
    { label: "Perfil", value: "perfil" },
  ];
  if (isMobile) {
    return (
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "white",
          px: 1,
        }}
      >
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              onClick={() => {
                navigate(`/${item.value}`);
                setAnchorEl(null);
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "white",
        display: "flex",
        justifyContent: "space-between",
        px: 2,
      }}
    >
      {/* IZQUIERDA */}
      <Tabs
        value={leftValue}
        onChange={(e, value) => navigate(`/${value}`)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Crear factura" value="facturacion" />
        <Tab label="Verificadores" value="verificadores" />
        <Tab label="Registro" value="registro" />
        <Tab label="Maestros" value="maestros" />
      </Tabs>

      {/* DERECHA */}
      <Tabs
        value={rightValue}
        onChange={(e, value) => {
          navigate(`/${value}`);
        }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Perfil" value="perfil" />
      </Tabs>
    </Box>
  );
}

export default TopNav;
