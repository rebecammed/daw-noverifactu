import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/inaltera.png";

function PublicHeader() {
  const navigate = useNavigate();

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
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            size="large"
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.4)",
              textTransform: "none",
              fontWeight: 600,
              transition: "all .2s ease",

              "&:hover": {
                bgcolor: "rgba(255,255,255,0.15)",
                borderColor: "white",
                transform: "translateY(-1px)",
              },
            }}
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </Button>

          <Button
            size="large"
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "#1a73e8",
              fontWeight: 600,
              textTransform: "none",
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
            Registrarse
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default PublicHeader;
