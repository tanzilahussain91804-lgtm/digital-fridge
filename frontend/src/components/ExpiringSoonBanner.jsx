import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import api from "../api/axios.js";

// Lightweight, passive alert: fetches food items once per page visit and
// tells you at a glance if anything needs attention today. No backend
// changes, no push/email infrastructure — just a client-side check
// against data the app already has.
export default function ExpiringSoonBanner() {
  const [counts, setCounts] = useState(null);
  const location = useLocation();

  useEffect(() => {
    api.get("/food").then((res) => {
      const today = new Date();
      let soon = 0;
      let expired = 0;
      res.data.forEach((item) => {
        if (item.type !== "packaged" || !item.expiryDate) return;
        const days = Math.ceil((new Date(item.expiryDate) - today) / (1000 * 60 * 60 * 24));
        if (days < 0) expired++;
        else if (days <= 3) soon++;
      });
      setCounts({ soon, expired });
    });
  }, [location.pathname]);

  if (!counts || (counts.soon === 0 && counts.expired === 0)) return null;

  const parts = [];
  if (counts.expired > 0) parts.push(`${counts.expired} expired`);
  if (counts.soon > 0) parts.push(`${counts.soon} expiring soon`);

  return (
    <div className="expiring-banner">
      <AlertTriangle size={16} strokeWidth={2} />
      <span>You have {parts.join(" and ")} in your inventory.</span>
      <Link to="/inventory">Review inventory →</Link>
    </div>
  );
}
