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
  LineChart,
  Line,
} from "recharts";

type Transaction = {
  id: string | number;
  type: "income" | "expense";
  amount: number;
  account: string;
  date: string;
  category_id: string;
  categories?: { name: string };
};

type Category = {
  id: string | number;
  name: string;
  type: "income" | "expense";
};

const COLORS = ["#4caf50", "#f44336"];


export default function ReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<null | Transaction>(null);

  // Edit state
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState<
    "all" | "thisWeek" | "lastMonth"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Chart dropdown
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

const [dropdownOpen, setDropdownOpen] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === "light";

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/categories"),
        ]);

        if (!txRes.ok || !catRes.ok) throw new Error("Failed to fetch data");

        const txData: Transaction[] = await txRes.json();
        const catData: Category[] = await catRes.json();

        const txWithCategory = txData.map((tx) => ({
          ...tx,
          categories: {
            name:
              catData.find((c) => c.id === tx.category_id)?.name ??
              "Uncategorized",
          },
        }));

        setTransactions(txWithCategory);
        setCategories(catData ?? []);
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load report data.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading...</p>;

  // ---------------- FILTER & SORT ----------------
  const filterByDate = (t: Transaction) => {
    const now = new Date();
    const txDate = new Date(t.date);

    if (filterDateRange === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return txDate >= startOfWeek && txDate <= now;
    }

    if (filterDateRange === "lastMonth") {
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    }

    return true;
  };

  const filteredTransactions = transactions
    .filter((t) => (filterType === "all" ? true : t.type === filterType))
    .filter((t) =>
      filterAccount === "all" ? true : t.account === filterAccount
    )
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

  // ---------------- METRICS ----------------
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const pieData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
  ];

  const accounts: { [key: string]: { income: number; expense: number } } = {};
  filteredTransactions.forEach((t) => {
    if (!accounts[t.account]) accounts[t.account] = { income: 0, expense: 0 };
    accounts[t.account][t.type] += t.amount;
  });
  const barData = Object.keys(accounts).map((acc) => ({
    account: acc,
    income: accounts[acc].income,
    expense: accounts[acc].expense,
  }));

  const lineData = filteredTransactions.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN"),
    amount: t.amount,
    type: t.type,
  }));

  // ---------------- HANDLERS ----------------
  const handleChartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedCharts(options);
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount);
    setAccount(transaction.account);
    setType(transaction.type);
    setCategoryId(transaction.category_id);
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
          categoryId,
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

  // ---------------- UI ----------------
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

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

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
            }}
          >
            <p style={{ margin: 0 }}>{card.label}</p>
            <h2 style={{ margin: "0.5rem 0 0 0" }}>
              ₹{card.value.toLocaleString("en-IN")}
            </h2>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: "center",
        }}
      >
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
        >
          <option value="all">All Accounts</option>
          {Array.from(new Set(transactions.map((t) => t.account))).map(
            (acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            )
          )}
        </select>

        <select
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value as any)}
        >
          <option value="all">All Dates</option>
          <option value="thisWeek">This Week</option>
          <option value="lastMonth">Last Month</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Transactions */}
      <h2 style={{ margin: "2rem 0 1rem" }}>Transactions</h2>
      {filteredTransactions.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem" }}>
          No transactions match the filter.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredTransactions.map((t) => (
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
                  {t.account} — {new Date(t.date).toLocaleDateString()} <br />
                  <em>{t.categories?.name || "Uncategorized"}</em>
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
              <div>
                <button
                  onClick={() => startEditing(t)}
                  style={{
                    marginLeft: "1rem",
                    cursor: "pointer",
                    color: "blue",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={{
                    marginLeft: "0.5rem",
                    cursor: "pointer",
                    color: "red",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form */}
      {editingTransaction && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #888",
            borderRadius: "12px",
            background: isLight ? "#f0f0f0" : "#1e1e1e",
          }}
        >
          <h3>Edit Transaction</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Amount"
            />
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Account"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <div style={{ marginTop: "0.5rem" }}>
              <button onClick={saveEdit} style={{ marginRight: "0.5rem" }}>
                Save
              </button>
              <button onClick={() => setEditingTransaction(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown for charts */}
      <div
        style={{
          margin: "3rem 0 2rem",
          textAlign: "center",
          position: "relative",
        }}
      >
        <label style={{ marginRight: "1rem", fontWeight: 600 }}>
          Show Visualizations:
        </label>

        {/* Dropdown toggle */}
        <div style={{ display: "inline-block", position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              padding: "0.5rem 1rem",
              minWidth: "220px",
              borderRadius: "8px",
              border: "1px solid #888",
              background: isLight ? "#fff" : "#2a2a2a",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {selectedCharts.length > 0
              ? `Selected: ${selectedCharts.join(", ")}`
              : "Select Visualizations"}
            <span style={{ float: "right" }}>▼</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                right: 0,
                background: isLight ? "#fff" : "#2a2a2a",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                zIndex: 10,
                textAlign: "left",
              }}
            >
              {[
                { value: "pie", label: "Income vs Expense" },
                { value: "bar", label: "Accounts Breakdown" },
                { value: "line", label: "Spending Trends" },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCharts.includes(option.value)}
                    onChange={() => {
                      if (selectedCharts.includes(option.value)) {
                        setSelectedCharts((prev) =>
                          prev.filter((c) => c !== option.value)
                        );
                      } else {
                        setSelectedCharts((prev) => [...prev, option.value]);
                      }
                    }}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render selected charts */}
      {selectedCharts.includes("pie") && (
        <>
          <h2 style={{ textAlign: "center" }}>Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

      {selectedCharts.includes("bar") && (
        <>
          <h2 style={{ textAlign: "center" }}>Accounts Breakdown</h2>
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
        </>
      )}

      {selectedCharts.includes("line") && (
        <>
          <h2 style={{ textAlign: "center" }}>Spending Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#2196f3" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </main>
  );
}
