import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Trash2, Pencil, Package, Carrot } from "lucide-react";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";

function getStatus(item) {
  if (item.type !== "packaged" || !item.expiryDate) return "fresh";
  const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "expired";
  if (days <= 3) return "soon";
  return "fresh";
}

function daysSince(date) {
  return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
}

const TABS = [
  { key: "all", label: "All" },
  { key: "fresh", label: "Fresh" },
  { key: "soon", label: "Expiring Soon" },
  { key: "expired", label: "Expired" },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const loadItems = () => api.get("/food").then((res) => setItems(res.data));

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/food/${id}`);
    loadItems();
  };

  const filtered = useMemo(() => {
    return items
      .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      .filter((i) => tab === "all" || getStatus(i) === tab);
  }, [items, search, tab]);

  const counts = useMemo(() => {
    const c = { all: items.length, fresh: 0, soon: 0, expired: 0 };
    items.forEach((i) => c[getStatus(i)]++);
    return c;
  }, [items]);

  return (
    <div className="page">
      <PageHeader
        title="Food Inventory"
        subtitle={`${items.length} item${items.length === 1 ? "" : "s"} currently stored`}
        action={
          <Link to="/inventory/add" className="btn-primary">
            <Plus size={16} /> Add Food
          </Link>
        }
      />

      <div className="inventory-controls">
        <div className="search-field">
          <Search size={16} />
          <input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tab-row">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={"tab" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label} <span className="tab-count">{counts[t.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="item-list">
        {filtered.map((item) => {
          const status = getStatus(item);
          const Icon = item.type === "packaged" ? Package : Carrot;
          return (
            <div key={item._id} className="item-row">
              <div className={`item-icon icon-${item.type}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="item-info">
                <strong>{item.name}</strong>
                <span className="item-meta">{item.quantity}</span>
              </div>
              <div className="item-detail">
                {item.type === "packaged" ? (
                  item.expiryDate ? (
                    <span className={`pill pill-${status}`}>
                      {status === "expired"
                        ? "Expired"
                        : status === "soon"
                        ? "Expiring Soon"
                        : `Fresh · ${new Date(item.expiryDate).toLocaleDateString()}`}
                    </span>
                  ) : (
                    <span className="pill pill-neutral">No expiry set</span>
                  )
                ) : (
                  <span className="pill pill-neutral">Added {daysSince(item.purchaseDate)}d ago</span>
                )}
              </div>
              <Link to={`/inventory/edit/${item._id}`} className="icon-btn" aria-label="Edit item">
                <Pencil size={16} />
              </Link>
              <button className="icon-btn" onClick={() => handleDelete(item._id)} aria-label="Delete item">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="empty-note">No items match here yet.</p>}
      </div>
    </div>
  );
}
