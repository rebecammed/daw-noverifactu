import DashboardLayout from "./DashboardLayout";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";
import { Box } from "@mui/material";

function OptionalDashboardLayout({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Usuario logueado → layout privado
  if (usuario) {
    return <DashboardLayout usuario={usuario}>{children}</DashboardLayout>;
  }

  // Usuario NO logueado → layout público
  return (
    <Box
      sx={{
        bgcolor: "#f6f8fb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader />

      <Box
        sx={{
          flexGrow: 1,
          maxWidth: "1100px",
          width: "100%",
          mx: "auto",
          px: 2,
          py: 4,
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}

export default OptionalDashboardLayout;
