import DashboardLayout from "./DashboardLayout";

function OptionalDashboardLayout({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    return children;
  }

  return <DashboardLayout usuario={usuario}>{children}</DashboardLayout>;
}

export default OptionalDashboardLayout;
