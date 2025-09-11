"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@lib/theme"; // ✅ theme hook

type Transaction = {
  id: string | number;
  type: "income" | "expense";
  amount: number;
  account: string;
};

export default function ReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load transactions.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading...</p>;

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "700px",
        margin: "0 auto",
        fontFamily: "Segoe UI, sans-serif",
        color: isLight ? "#111" : "#f0f0f0",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "2rem",
          color: isLight ? "#1976d2" : "#90caf9",
        }}
      >
        📊 Transaction Report
      </h1>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {transactions.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem" }}>
          No transactions yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {transactions.map((t) => (
            <div
              key={t.id}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                background: isLight ? "#fff" : "#2a2a2a",
                boxShadow: isLight
                  ? "0 4px 12px rgba(0,0,0,0.1)"
                  : "0 4px 12px rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: `6px solid ${
                  t.type === "income" ? "#4caf50" : "#f44336"
                }`,
              }}
            >
              <div>
                <strong style={{ textTransform: "capitalize" }}>
                  {t.type}
                </strong>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
                  {t.account}
                </p>
              </div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  color: t.type === "income" ? "#4caf50" : "#f44336",
                }}
              >
                ₹{Number(t.amount).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
