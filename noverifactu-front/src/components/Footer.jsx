import { Box, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        px: { xs: 2, md: 4 },
        textAlign: "center",
        backgroundColor: "background.paper",
        borderTop: "1px solid #eee",
        width: "100%",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          wordBreak: "break-word",
        }}
      >
        © 2026 INALTERA · Proyecto Académico DAW ·{" "}
        <MuiLink component={Link} to="/politica-privacidad" underline="hover">
          Privacidad
        </MuiLink>
      </Typography>
    </Box>
  );
}

export default Footer;
