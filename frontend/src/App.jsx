import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

//ADMIN PAGES
import Users from "./pages/admin/Users";

import Layout from "./components/layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import ReportingDashboard from "./pages/ReportingDashboard";
import AuthLayout from "./components/layouts/AuthLayout";
import { AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Snackbar from "./context/Snackbar";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <ThemeProvider>
      {!user ? (
        // If user is not logged in, show the login page
        <AuthLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          {/* Include Snackbar here to show session expired messages even when logged out */}
          <Snackbar />
        </AuthLayout>
      ) : (
        // If user is logged in, show the app with proper routes
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<ReportingDashboard />} />
            <Route path="/reports/*" element={<ReportingDashboard />} />
            {/* Redirect to dashboard as default */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          {/* Include Snackbar for session timeout warnings */}
          <Snackbar />
        </Layout>
      )}
    </ThemeProvider>
  );
}

export default App;