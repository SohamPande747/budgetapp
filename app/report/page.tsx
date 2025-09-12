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
  date: string;
};

const COLORS = ["#4caf50", "#f44336"];

export default function ReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState<null | Transaction>(null);
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");

  const { theme } = useTheme();
  const isLight = theme === "light";

  // Filter & Sort State
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "thisWeek" | "lastMonth">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // --------------------- Fetch Transactions ---------------------
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const data: Transaction[] = await res.json();
        setTransactions(data ?? []);
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

  // --------------------- Edit & Delete ---------------------
  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount);
    setAccount(transaction.account);
    setType(transaction.type);
  };

  const saveEdit = async () => {
    if (!editingTransaction) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTransaction.id,
          amount,
          account,
          type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? data.transaction : t))
      );
      setEditingTransaction(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading...</p>;

  // --------------------- Filter & Sort ---------------------
  const filterByDate = (t: Transaction) => {
    const now = new Date();
    const txDate = new Date(t.date);

    if (filterDateRange === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return txDate >= startOfWeek && txDate <= now;
    }

    if (filterDateRange === "lastMonth") {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    }

    return true;
  };

  const filteredTransactions = transactions
    .filter((t) => (filterType === "all" ? true : t.type === filterType))
    .filter((t) => (filterAccount === "all" ? true : t.account === filterAccount))
    .filter(filterByDate)
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  // --------------------- Totals ---------------------
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Pie chart
  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  // Bar chart by account
  const accounts: { [key: string]: { income: number; expense: number } } = {};
  filteredTransactions.forEach((t) => {
    if (!accounts[t.account]) accounts[t.account] = { income: 0, expense: 0 };
    accounts[t.account][t.type] += t.amount;
  });
  const barData = Object.keys(accounts).map((account) => ({
    account,
    income: accounts[account].income,
    expense: accounts[account].expense,
  }));

  return (
    <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif", color: isLight ? "#111" : "#f0f0f0" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2rem", color: isLight ? "#1976d2" : "#90caf9" }}>
        📊 Transaction Report
      </h1>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        {[
          { label: "Total Income", value: totalIncome, color: "#4caf50" },
          { label: "Total Expense", value: totalExpense, color: "#f44336" },
          { label: "Balance", value: balance, color: "#2196f3" },
        ].map((card) => (
          <div key={card.label} style={{ flex: "1 1 200px", padding: "1rem", borderRadius: "12px", backgroundColor: card.color, color: "#fff", textAlign: "center", fontWeight: 600, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
            <p style={{ margin: 0 }}>{card.label}</p>
            <h2 style={{ margin: "0.5rem 0 0 0" }}>₹{card.value.toLocaleString("en-IN")}</h2>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <h2 style={{ textAlign: "center", margin: "2rem 0 1rem" }}>Income vs Expense</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Bar Chart */}
      <h2 style={{ textAlign: "center", margin: "2rem 0 1rem" }}>Accounts Breakdown</h2>
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

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem", justifyContent: "center" }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
          <option value="all">All Accounts</option>
          {Array.from(new Set(transactions.map((t) => t.account))).map((acc) => (
            <option key={acc} value={acc}>{acc}</option>
          ))}
        </select>

        <select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value as any)}>
          <option value="all">All Dates</option>
          <option value="thisWeek">This Week</option>
          <option value="lastMonth">Last Month</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Transaction List */}
      <h2 style={{ margin: "2rem 0 1rem" }}>Transactions</h2>
      {filteredTransactions.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem" }}>No transactions match the filter.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredTransactions.map((t) => (
            <div key={t.id} style={{ padding: "1rem 1.5rem", borderRadius: "12px", background: isLight ? "#fff" : "#2a2a2a", boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.1)" : "0 4px 12px rgba(0,0,0,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `6px solid ${t.type === "income" ? "#4caf50" : "#f44336"}` }}>
              <div>
                <strong style={{ textTransform: "capitalize" }}>{t.type}</strong>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>{t.account} — {new Date(t.date).toLocaleDateString()}</p>
              </div>
              <span style={{ fontWeight: 600, fontSize: "1.1rem", color: t.type === "income" ? "#4caf50" : "#f44336" }}>
                ₹{Number(t.amount).toLocaleString("en-IN")}
              </span>
              <div>
                <button onClick={() => startEditing(t)} style={{ marginLeft: "1rem", cursor: "pointer", color: "blue" }}>Edit</button>
                <button onClick={() => handleDelete(t.id)} style={{ marginLeft: "0.5rem", cursor: "pointer", color: "red" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      {editingTransaction && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #888", borderRadius: "12px", background: isLight ? "#f0f0f0" : "#1e1e1e" }}>
          <h3>Edit Transaction</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" />
            <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account" />
            <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div style={{ marginTop: "0.5rem" }}>
              <button onClick={saveEdit} style={{ marginRight: "0.5rem" }}>Save</button>
              <button onClick={() => setEditingTransaction(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
