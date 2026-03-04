import { useEffect, useState } from "react";
import { authFetch } from "./utils/authFetch";
import { Button } from "@mui/material";
import { Tabs, Tab, Box, Paper } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";

function DatosTarifas() {
  useEffect(() => {
    if (location.search) {
      navigate("/perfil/dashboard", { replace: true });
    }
  }, []);
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Outlet />
    </Paper>
  );
}

export default DatosTarifas;
