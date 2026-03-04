import { Paper, Typography, Box } from "@mui/material";

function AdminDashboard() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Dashboard Administración
      </Typography>

      <Typography variant="body1">
        Bienvenido al panel de administración.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Desde aquí puedes gestionar:
        </Typography>

        <Box component="ul" sx={{ pl: 3, m: 0 }}>
          <li>Usuarios</li>
          <li>Integridad de registros</li>
          <li>Backups</li>
          <li>Facturación global</li>
          <li>Configuración SIF</li>
        </Box>
      </Box>
    </Paper>
  );
}

export default AdminDashboard;
