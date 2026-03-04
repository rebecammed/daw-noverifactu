import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import App from "./App";
import theme from "./theme";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { SystemProvider } from "./context/SystemContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SystemProvider>
      <BrowserRouter>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </BrowserRouter>
    </SystemProvider>
  </ThemeProvider>,
);
