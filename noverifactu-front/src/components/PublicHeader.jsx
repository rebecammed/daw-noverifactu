import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/inaltera.png";

function PublicHeader() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={2}
      sx={{
        height: 80,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: "80px !important",
          px: 4,
        }}
      >
        {/* LOGO */}
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Logo INALTERA" style={{ height: "52px" }} />
        </Box>

        {/* BOTONES */}
        <Box
          sx={{ display: "flex", gap: { xs: 1, sm: 2 }, alignItems: "center" }}
        >
          <Button
            size="small"
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.4)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              px: { xs: 1.2, sm: 2.5 },
              py: 0.5,
              minWidth: "auto",
              borderRadius: "10px",
              transition: "all .2s ease",

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
                borderColor: "white",
                transform: "translateY(-1px)",
              },
            }}
            onClick={() => navigate("/login")}
          >
            {isMobile ? "Iniciar" : "Iniciar sesión"}
          </Button>

          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "#1a73e8",
              fontWeight: 600,
              textTransform: "none",
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              px: { xs: 1.2, sm: 2.5 },
              py: 0.5,
              minWidth: "auto",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all .2s ease",

              "&:hover": {
                bgcolor: "#f3f6ff",
                transform: "translateY(-1px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              },
            }}
            onClick={() => navigate("/register")}
          >
            {isMobile ? "Registro" : "Registrarse"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default PublicHeader;
