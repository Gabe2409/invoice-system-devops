import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { THEME_SETTINGS } from './ThemeContext';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }

    // Set up interceptor for expired tokens
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Show session expired message
          setSnackbarMessage("Your session has expired. Please log in again.");
          setShowSnackbar(true);
          
          // Clear user data after a short delay to allow the message to be seen
          setTimeout(() => {
            handleSessionExpired();
          }, 3000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleSessionExpired = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    // No navigation here - let the routing logic handle it
  };

  const login = async (userName, pin, navigate) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, { userName, pin });
      setUser(data);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = (navigate) => {
    // Clear user authentication
    setUser(null);
    setToken("");
    
    // Clear authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear theme settings from localStorage to prevent leakage between users
    Object.values(THEME_SETTINGS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear authorization headers
    delete axios.defaults.headers.common["Authorization"];
    
    // Navigate to login
    if (navigate) {
      navigate("/login");
    }
  };

  // Add function to update user information after profile updates
  const updateUserInfo = (updatedUserData) => {
    // Make sure we preserve the token when updating user data
    const updatedUser = {
      ...updatedUserData,
      token: token || updatedUserData.token
    };
    
    setUser(updatedUser);
    
    // Update localStorage with the new user data
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUserInfo,
        showSnackbar,
        snackbarMessage,
        setShowSnackbar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;