import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, Refrigerator, Receipt, ListChecks, LogOut, Leaf } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/inventory", label: "Inventory", icon: Refrigerator },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/shopping-list", label: "Shopping List", icon: ListChecks },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Leaf size={22} strokeWidth={2.25} />
        <span>Digital Fridge</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user?.name && <p className="sidebar-user">Signed in as {user.name}</p>}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
