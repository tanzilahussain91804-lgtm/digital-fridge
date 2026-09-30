import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";

export default function ShoppingList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const loadItems = () => api.get("/shopping").then((res) => setItems(res.data));

  useEffect(() => {
    loadItems();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    await api.post("/shopping", { item: newItem });
    setNewItem("");
    loadItems();
  };

  const handleToggle = async (id) => {
    await api.patch(`/shopping/${id}`);
    loadItems();
  };

  const handleDelete = async (id) => {
    await api.delete(`/shopping/${id}`);
    loadItems();
  };

  const pending = items.filter((i) => !i.completed);
  const bought = items.filter((i) => i.completed);

  return (
    <div className="page">
      <PageHeader
        title="Shopping List"
        subtitle={`${pending.length} pending · ${bought.length} bought`}
      />

      <div className="panel">
        <form onSubmit={handleAdd} className="shopping-form">
          <input placeholder="Add an item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
          <button type="submit" className="btn-primary"><Plus size={16} /> Add</button>
        </form>

        <ul className="shopping-list">
          {pending.map((it) => (
            <li key={it._id}>
              <label>
                <input type="checkbox" checked={false} onChange={() => handleToggle(it._id)} />
                {it.item}
              </label>
              <button className="icon-btn" onClick={() => handleDelete(it._id)} aria-label="Remove item">
                <X size={15} />
              </button>
            </li>
          ))}
          {bought.length > 0 && (
            <>
              <li className="shopping-divider">Bought</li>
              {bought.map((it) => (
                <li key={it._id} className="completed">
                  <label>
                    <input type="checkbox" checked={true} onChange={() => handleToggle(it._id)} />
                    {it.item}
                  </label>
                  <button className="icon-btn" onClick={() => handleDelete(it._id)} aria-label="Remove item">
                    <X size={15} />
                  </button>
                </li>
              ))}
            </>
          )}
          {items.length === 0 && <p className="empty-note">Your shopping list is empty.</p>}
        </ul>
      </div>
    </div>
  );
}
