import React, { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";
import StatStrip from "../components/StatStrip.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DONUT_COLORS = ["#3E7C5C", "#C77C2E", "#7C9D6E", "#AE4331", "#9BB89F", "#D9A441"];

export default function Dashboard() {
  const [food, setFood] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/food").then((res) => setFood(res.data));
    api.get("/expenses").then((res) => setExpenses(res.data));
    api.get("/expenses/summary/monthly").then((res) => setMonthly(res.data));
  }, []);

  const today = new Date();
  const packaged = food.filter((f) => f.type === "packaged");
  const fresh = food.filter((f) => f.type === "fresh");

  const daysLeft = (item) =>
    item.expiryDate ? Math.ceil((new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24)) : null;

  const expiringSoon = packaged.filter((f) => {
    const d = daysLeft(f);
    return d !== null && d >= 0 && d <= 3;
  });
  const expired = packaged.filter((f) => {
    const d = daysLeft(f);
    return d !== null && d < 0;
  });

  const currentMonthTotal =
    monthly.find((m) => m._id.month === today.getMonth() + 1 && m._id.year === today.getFullYear())?.total || 0;
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthTotal =
    monthly.find((m) => m._id.month === lastMonthDate.getMonth() + 1 && m._id.year === lastMonthDate.getFullYear())
      ?.total || 0;
  const monthDelta =
    lastMonthTotal > 0 ? Math.round(((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : null;

  const lineData = {
    labels: monthly.map((m) => `${MONTH_NAMES[m._id.month - 1]} ${String(m._id.year).slice(2)}`),
    datasets: [
      {
        label: "Spending",
        data: monthly.map((m) => m.total),
        borderColor: "#3E7C5C",
        backgroundColor: "rgba(62,124,92,0.12)",
        pointBackgroundColor: "#3E7C5C",
        fill: true,
        tension: 0.35,
      },
    ],
  };
  const lineOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (v) => `₹${v}` } } },
  };

  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});
  const donutData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: DONUT_COLORS,
        borderWidth: 0,
      },
    ],
  };
  const donutOptions = {
    plugins: { legend: { position: "right", labels: { boxWidth: 10, padding: 12, font: { family: "Inter" } } } },
  };

  const topExpiring = [...packaged]
    .filter((f) => daysLeft(f) !== null)
    .sort((a, b) => daysLeft(a) - daysLeft(b))
    .slice(0, 4);

  return (
    <div className="page">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle="Here's what's in your fridge today."
      />

      <StatStrip
        stats={[
          { label: "Food Items", value: food.length, color: "#3E7C5C" },
          { label: "Expiring Soon", value: expiringSoon.length, color: "#C77C2E" },
          { label: "Expired", value: expired.length, color: "#AE4331" },
          {
            label: "This Month",
            value: `₹${currentMonthTotal}`,
            sub: monthDelta !== null ? `${monthDelta >= 0 ? "↑" : "↓"} ${Math.abs(monthDelta)}% vs last month` : null,
            color: "#22402F",
          },
        ]}
      />

      <div className="dashboard-grid">
        <div className="panel">
          <h2>Monthly Spending</h2>
          {monthly.length > 0 ? (
            <div className="chart-wrap"><Line data={lineData} options={lineOptions} /></div>
          ) : (
            <p className="empty-note">Log a few expenses to see your trend here.</p>
          )}
        </div>

        <div className="panel">
          <h2>Spending by Category</h2>
          {expenses.length > 0 ? (
            <div className="chart-wrap donut-wrap"><Doughnut data={donutData} options={donutOptions} /></div>
          ) : (
            <p className="empty-note">No expenses recorded yet.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header-row">
          <h2>Needs Attention</h2>
          <Link to="/inventory" className="panel-link">View all inventory →</Link>
        </div>
        {topExpiring.length === 0 ? (
          <p className="empty-note">Nothing expiring soon — you're all caught up.</p>
        ) : (
          <div className="attention-list">
            {topExpiring.map((item) => {
              const d = daysLeft(item);
              const status = d < 0 ? "expired" : d <= 3 ? "soon" : "fresh";
              return (
                <div className="attention-row" key={item._id}>
                  <span className="attention-name">{item.name}</span>
                  <span className={`pill pill-${status}`}>
                    {d < 0 ? `Expired ${Math.abs(d)}d ago` : d === 0 ? "Expires today" : `Expires in ${d}d`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
