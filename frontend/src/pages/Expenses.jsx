import React, { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";
import StatStrip from "../components/StatStrip.jsx";

const EMPTY_FORM = {
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Groceries",
  description: "",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const loadExpenses = () => api.get("/expenses").then((res) => setExpenses(res.data));

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.patch(`/expenses/${editingId}`, form);
      setEditingId(null);
    } else {
      await api.post("/expenses", form);
    }
    setForm(EMPTY_FORM);
    loadExpenses();
  };

  const startEdit = (exp) => {
    setEditingId(exp._id);
    setForm({
      amount: exp.amount,
      date: exp.date.slice(0, 10),
      category: exp.category || "",
      description: exp.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    if (editingId === id) cancelEdit();
    loadExpenses();
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const avgPerEntry = expenses.length ? Math.round(total / expenses.length) : 0;

  return (
    <div className="page">
      <PageHeader title="Food Expenses" subtitle="Track spending and spot trends over time." />

      <StatStrip
        stats={[
          { label: "Total Recorded", value: `₹${total}`, color: "#22402F" },
          { label: "This Month", value: `₹${thisMonthTotal}`, color: "#3E7C5C" },
          { label: "Entries Logged", value: expenses.length, color: "#C77C2E" },
          { label: "Avg per Entry", value: `₹${avgPerEntry}`, color: "#6E7A70" },
        ]}
      />

      <div className="panel">
        <h2>{editingId ? "Edit Expense" : "Add an Expense"}</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <input name="amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} required />
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
          <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
          <button type="submit" className="btn-primary">
            {editingId ? "Save Changes" : <><Plus size={16} /> Add</>}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              <X size={14} /> Cancel
            </button>
          )}
        </form>
      </div>

      <div className="panel">
        <h2>Expense History</h2>
        <div className="item-list">
          {expenses.map((exp) => (
            <div key={exp._id} className="item-row">
              <div className="item-info">
                <strong>₹{exp.amount}</strong>
                <span className="item-meta">{exp.category}{exp.description ? ` · ${exp.description}` : ""}</span>
              </div>
              <div className="item-detail">
                <span className="pill pill-neutral">{new Date(exp.date).toLocaleDateString()}</span>
              </div>
              <button className="icon-btn" onClick={() => startEdit(exp)} aria-label="Edit expense">
                <Pencil size={16} />
              </button>
              <button className="icon-btn" onClick={() => handleDelete(exp._id)} aria-label="Delete expense">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {expenses.length === 0 && <p className="empty-note">No expenses recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
