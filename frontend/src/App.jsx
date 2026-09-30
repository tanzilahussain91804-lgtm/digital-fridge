import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import AddFood from "./pages/AddFood.jsx";
import Expenses from "./pages/Expenses.jsx";
import ShoppingList from "./pages/ShoppingList.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ExpiringSoonBanner from "./components/ExpiringSoonBanner.jsx";

function PrivateRoute({ token, children }) {
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  };

  return (
    <div className={token ? "app-shell" : ""}>
      {token && <Sidebar onLogout={handleLogout} />}

      <main className={token ? "app-content" : ""}>
        {token && <ExpiringSoonBanner />}

        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute token={token}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <PrivateRoute token={token}>
                <Inventory />
              </PrivateRoute>
            }
          />

          <Route
            path="/inventory/add"
            element={
              <PrivateRoute token={token}>
                <AddFood />
              </PrivateRoute>
            }
          />

          <Route
            path="/inventory/edit/:id"
            element={
              <PrivateRoute token={token}>
                <AddFood />
              </PrivateRoute>
            }
          />

          <Route
            path="/expenses"
            element={
              <PrivateRoute token={token}>
                <Expenses />
              </PrivateRoute>
            }
          />

          <Route
            path="/shopping-list"
            element={
              <PrivateRoute token={token}>
                <ShoppingList />
              </PrivateRoute>
            }
          />

          <Route
            path="*"
            element={
              <Navigate to={token ? "/dashboard" : "/login"} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}