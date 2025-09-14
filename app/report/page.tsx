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
import { FiFilter } from "react-icons/fi"; // Funnel icon

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

  // Filter dropdown
  const [filterOpen, setFilterOpen] = useState(false);

  // Charts
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === "light";

  const bgPage = isLight ? "#f0f2f5" : "#111";
  const cardBg = isLight ? "#fff" : "#1c1c1e";
  const cardShadow = isLight
    ? "0 8px 24px rgba(0,0,0,0.06)"
    : "0 8px 24px rgba(0,0,0,0.5)";

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

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>⏳ Loading...</p>
    );

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

  const accountsSummary: {
    [key: string]: { income: number; expense: number };
  } = {};
  filteredTransactions.forEach((t) => {
    if (!accountsSummary[t.account])
      accountsSummary[t.account] = { income: 0, expense: 0 };
    accountsSummary[t.account][t.type] += t.amount;
  });

  const barData = Object.keys(accountsSummary).map((acc) => ({
    account: acc,
    income: accountsSummary[acc].income,
    expense: accountsSummary[acc].expense,
  }));

  const lineData = filteredTransactions.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN"),
    amount: t.amount,
    type: t.type,
  }));

  // ---------------- HANDLERS ----------------
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
        background: bgPage,
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
        Transaction Report
      </h1>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Summary Cards */}
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

      {/* Filter Dropdown */}
      <div
        style={{
          position: "relative",
          textAlign: "right",
          marginBottom: "0rem",
        }}
      >
        <button
          onClick={() => setFilterOpen((prev) => !prev)}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #888",
            background: isLight ? "#fff" : "#2a2a2a",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            fontSize: "1.1rem",
          }}
        >
          <FiFilter style={{ marginRight: "0.25rem" }} />
        </button>

        {filterOpen && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: "50%",
              transform: "translateX(-50%)",
              background: isLight ? "#fff" : "#2a2a2a",
              padding: "1rem",
              borderRadius: "12px",
              boxShadow: cardShadow,
              zIndex: 10,
              minWidth: "300px",
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
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
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        )}
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
            padding: "1.5rem",
            borderRadius: "12px",
            background: cardBg,
            boxShadow: cardShadow,
          }}
        >
          <h3>Edit Transaction</h3>
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
          <select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={saveEdit}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      )}

      {/* Charts Section */}
      <h2 style={{ margin: "2rem 0 1rem" }}>Charts</h2>

      {/* Chart Toggle Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {["Pie Chart", "Bar Chart", "Line Chart"].map((chart) => (
          <button
            key={chart}
            onClick={() => {
              setSelectedCharts((prev) =>
                prev.includes(chart)
                  ? prev.filter((c) => c !== chart)
                  : [...prev, chart]
              );
            }}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #888",
              background: selectedCharts.includes(chart)
                ? "#1976d2"
                : isLight
                ? "#fff"
                : "#2a2a2a",
              color: selectedCharts.includes(chart)
                ? "#fff"
                : isLight
                ? "#000"
                : "#fff",
              cursor: "pointer",
            }}
          >
            {chart}
          </button>
        ))}
      </div>

      {/* Render Charts */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          marginTop: "1rem",
        }}
      >
        {selectedCharts.includes("Pie Chart") && (
  <div style={{ height: "300px" }}>
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
)}


        {selectedCharts.includes("Bar Chart") && (
          <div style={{ height: "300px" }}>
            <ResponsiveContainer>
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
          </div>
        )}

        {selectedCharts.includes("Line Chart") && (
          <div style={{ height: "300px" }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}
