import React from "react";
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <div className={token ? "app-shell" : ""}>
      {token && <Sidebar />}
      <main className={token ? "app-content" : ""}>
        {token && <ExpiringSoonBanner />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <Inventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/add"
            element={
              <PrivateRoute>
                <AddFood />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/edit/:id"
            element={
              <PrivateRoute>
                <AddFood />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <PrivateRoute>
                <ShoppingList />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}
