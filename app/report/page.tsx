"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@lib/theme";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type Transaction = {
  id: string | number;
  type: "income" | "expense";
  amount: number;
  account: string;
};

const COLORS = ["#4caf50", "#f44336"];

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

  // 📊 Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // 📊 Pie chart data
  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  // 📊 Bar chart data (group by account)
  const accounts: { [key: string]: { income: number; expense: number } } = {};
  transactions.forEach((t) => {
    if (!accounts[t.account]) accounts[t.account] = { income: 0, expense: 0 };
    accounts[t.account][t.type] += t.amount;
  });
  const barData = Object.keys(accounts).map((account) => ({
    account,
    income: accounts[account].income,
    expense: accounts[account].expense,
  }));

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "1000px",
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

      {/* Summary cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Income", value: totalIncome, color: "#4caf50" },
          { label: "Total Expense", value: totalExpense, color: "#f44336" },
          { label: "Balance", value: balance, color: "#2196f3" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: "1 1 200px",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: card.color,
              color: "#fff",
              textAlign: "center",
              fontWeight: 600,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ margin: 0 }}>{card.label}</p>
            <h2 style={{ margin: "0.5rem 0 0 0" }}>
              ₹{card.value.toLocaleString("en-IN")}
            </h2>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <h2 style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
        Income vs Expense
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Bar Chart */}
      <h2 style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
        Accounts Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="account" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#4caf50" />
          <Bar dataKey="expense" fill="#f44336" />
        </BarChart>
      </ResponsiveContainer>

      {/* Transaction List */}
      <h2 style={{ margin: "2rem 0 1rem" }}>All Transactions</h2>
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
