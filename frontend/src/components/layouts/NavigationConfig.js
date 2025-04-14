import React from "react";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  CreditCard as TransactionsIcon,
  BarChart as ReportsIcon,
  People as UsersIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  SettingsApplications as SettingsApplicationsIcon
} from "@mui/icons-material";

// Navigation items configuration - easy to add new routes
export const navigationItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: React.createElement(DashboardIcon),
    allowedRoles: ["admin", "user"]
  },
  // {
  //   title: "Transactions",
  //   path: "/transactions",
  //   icon: React.createElement(TransactionsIcon),
  //   allowedRoles: ["admin", "user"]
  // },
  {
    title: "Reports (Beta)",
    path: "/reports",
    icon: React.createElement(ReportsIcon),
    allowedRoles: ["admin", "user"],
    // Uncomment if you want to add subitems later
    // subItems: [
    //   { title: "Revenue", path: "/reports/revenue", allowedRoles: ["admin", "user"] }, 
    //   { title: "Transactions", path: "/reports/transactions", allowedRoles: ["admin", "user"] }
    // ]
  },
  {
    title: "Users",
    path: "/users",
    icon: React.createElement(UsersIcon),
    allowedRoles: ["admin"]
  },
  {
    title: "Settings",
    path: "/settings",
    icon: React.createElement(SettingsIcon),
    allowedRoles: ["admin", "user"],
    subItems: [
      { 
        title: "Theme", 
        path: "/settings?tab=theme", 
        icon: React.createElement(PaletteIcon),
        allowedRoles: ["admin", "user"] 
      },
      { 
        title: "Profile", 
        path: "/settings?tab=profile", 
        icon: React.createElement(PersonIcon),
        allowedRoles: ["admin", "user"] 
      },
      { 
        title: "Application", 
        path: "/settings?tab=application", 
        icon: React.createElement(SettingsApplicationsIcon),
        allowedRoles: ["admin"] 
      },
      { 
        title: "Admin Settings", 
        path: "/settings?tab=admin", 
        icon: React.createElement(AdminPanelSettingsIcon),
        allowedRoles: ["admin"] 
      }
    ]
  }
];