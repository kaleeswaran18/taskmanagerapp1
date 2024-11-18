import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppProvider from "./context/AppContext"; // Import the AppProvider
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";


const isAuthenticated = () => !!sessionStorage.getItem("user");

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
         
        
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated() ? "/home" : "/login"} />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
