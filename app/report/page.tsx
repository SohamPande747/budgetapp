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

const chartCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const DEFAULT_COLORS = ["#34c759", "#ff3b30"]; // income, expense - Apple-ish green/red

export default function ReportPage() {
  // ---------- state ----------
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<null | Transaction>(null);

  // Edit state
  const [amount, setAmount] = useState<number>(0);
  const [account, setAccount] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Filters & sorts
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<
    "all" | "thisWeek" | "lastMonth"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // filter dropdown / UI
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // charts
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);

  // theme
  const { theme } = useTheme();
  const isLight = theme === "light";

  // styling tokens (kept inline for simplicity, but centralized)
  const bgPage = isLight ? "#f6f7fb" : "#0b0b0c";
  const cardBg = isLight ? "#ffffff" : "#121212";
  const faintBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.04)";
  const accent = isLight ? "#007aff" : "#58a6ff"; // apple blue-ish
  const subtleText = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)";
  const cardShadow = isLight
    ? "0 8px 24px rgba(15,15,15,0.06)"
    : "0 8px 24px rgba(0,0,0,0.75)";

  // ---------- fetch data ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [txRes, catRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/categories"),
        ]);

        if (!txRes.ok || !catRes.ok) {
          throw new Error("Failed to fetch data");
        }

        // keep types
        const txData: Transaction[] = await txRes.json();
        const catData: Category[] = await catRes.json();

        // attach categories to transactions (preserve original logic)
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
        setError("");
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
      <div
        style={{
          minHeight: "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: subtleText,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>⏳ Loading</div>
          <div style={{ fontSize: "0.9rem", color: subtleText }}>
            fetching transactions & categories...
          </div>
        </div>
      </div>
    );

  // ---------- helpers: date filters ----------
  const filterByDate = (t: Transaction) => {
    const now = new Date();
    const txDate = new Date(t.date);

    if (filterDateRange === "thisWeek") {
      // start of week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return txDate >= startOfWeek && txDate <= now;
    }

    if (filterDateRange === "lastMonth") {
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      startOfLastMonth.setHours(0, 0, 0, 0);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
    }

    return true;
  };

  // ---------- filtered & sorted transactions ----------
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

  // ---------- metrics ----------
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const pieData = categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      name: c.name,
      value: filteredTransactions
        .filter((t) => t.type === "expense" && t.category_id === c.id)
        .reduce((s, t) => s + Number(t.amount), 0),
    }))
    .filter((d) => d.value > 0);

  const accountsSummary: {
    [key: string]: { income: number; expense: number };
  } = {};
  filteredTransactions.forEach((t) => {
    if (!accountsSummary[t.account]) {
      accountsSummary[t.account] = { income: 0, expense: 0 };
    }
    accountsSummary[t.account][t.type] += Number(t.amount);
  });

  const barData = Object.keys(accountsSummary).map((acc) => ({
    account: acc,
    income: accountsSummary[acc].income,
    expense: accountsSummary[acc].expense,
  }));

  const lineData: { date: string; balance: number }[] = [];
  let runningBalance = 0;

  filteredTransactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((t) => {
      runningBalance +=
        t.type === "income" ? Number(t.amount) : -Number(t.amount);
      lineData.push({
        date: new Date(t.date).toLocaleDateString("en-IN"),
        balance: runningBalance,
      });
    });

  // ---------- handlers ----------
  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(Number(transaction.amount));
    setAccount(transaction.account);
    setType(transaction.type);
    setCategoryId(transaction.category_id);
    // scroll to edit form if needed
    setTimeout(() => {
      const el = document.getElementById("edit-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
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
      alert(err.message || "Failed to save transaction");
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
      alert(err.message || "Failed to delete transaction");
    }
  };

  // chart toggle handler (keeps same behaviour)
  const toggleChart = (chartName: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chartName)
        ? prev.filter((c) => c !== chartName)
        : [...prev, chartName]
    );
  };

  // ---------- small UI helpers ----------
  const formatMoney = (val: number) =>
    "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ---------- UI ----------
  return (
    <main
      style={{
        padding: "28px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        color: isLight ? "#0b1226" : "#e6eef8",
        background: bgPage,
        minHeight: "100vh",
      }}
    >
      {/* header */}
      <header style={{ textAlign: "center", marginBottom: 22 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.3px",
            color: isLight ? "#0b1226" : "#e6eef8",
          }}
        >
          Transaction Report
        </h1>
        <p style={{ margin: "8px 0 0", color: subtleText, fontSize: 13 }}>
          Overview of recent activity — filter & adjust as needed
        </p>
      </header>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: 12,
            background: isLight ? "#fff6f6" : "rgba(255,59,48,0.08)",
            border: `1px solid ${
              isLight ? "rgba(255,0,0,0.06)" : "rgba(255,59,48,0.12)"
            }`,
            color: isLight ? "#8b0000" : "#ffabad",
          }}
        >
          {error}
        </div>
      )}

      {/* summary cards */}
      <section
        aria-label="summary-cards"
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            flex: "1 1 260px",
            minWidth: 220,
            padding: "18px",
            borderRadius: 14,
            background: cardBg,
            boxShadow: cardShadow,
            border: `1px solid ${faintBorder}`,
            textAlign: "center",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
        >
          <div style={{ fontSize: 13, color: subtleText, marginBottom: 6 }}>
            Total Income
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#34c759" }}>
            {formatMoney(totalIncome)}
          </div>
        </div>

        <div
          style={{
            flex: "1 1 260px",
            minWidth: 220,
            padding: "18px",
            borderRadius: 14,
            background: cardBg,
            boxShadow: cardShadow,
            border: `1px solid ${faintBorder}`,
            textAlign: "center",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
        >
          <div style={{ fontSize: 13, color: subtleText, marginBottom: 6 }}>
            Total Expense
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#ff3b30" }}>
            {formatMoney(totalExpense)}
          </div>
        </div>

        <div
          style={{
            flex: "1 1 260px",
            minWidth: 220,
            padding: "18px",
            borderRadius: 14,
            background: cardBg,
            boxShadow: cardShadow,
            border: `1px solid ${faintBorder}`,
            textAlign: "center",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
        >
          <div style={{ fontSize: 13, color: subtleText, marginBottom: 6 }}>
            Balance
          </div>
          <div style={{ fontWeight: 700, fontSize: 20, color: accent }}>
            {formatMoney(balance)}
          </div>
        </div>
      </section>

      {/* top controls: filters + chart toggles */}
      <section
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {/* left: filters */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                border: `1px solid ${faintBorder}`,
                background: cardBg,
                boxShadow: "none",
                cursor: "pointer",
                color: isLight ? "#0b1226" : "#e6eef8",
                fontWeight: 600,
              }}
            >
              <FiFilter />
              <span style={{ fontSize: 14 }}>Filters</span>
            </button>

            {filterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  transform: "translateY(8px)",
                  background: cardBg,
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${faintBorder}`,
                  boxShadow: cardShadow,
                  zIndex: 40,
                  minWidth: 420,
                }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: subtleText,
                        fontSize: 12,
                      }}
                    >
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(
                          e.target.value as "all" | "income" | "expense"
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid ${faintBorder}`,
                        background: isLight ? "#fff" : "#0f0f10",
                        color: isLight ? "#0b1226" : "#e6eef8",
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: subtleText,
                        fontSize: 12,
                      }}
                    >
                      Account
                    </label>
                    <select
                      value={filterAccount}
                      onChange={(e) => setFilterAccount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid ${faintBorder}`,
                        background: isLight ? "#fff" : "#0f0f10",
                        color: isLight ? "#0b1226" : "#e6eef8",
                      }}
                    >
                      <option value="all">All Accounts</option>
                      {Array.from(
                        new Set(transactions.map((t) => t.account))
                      ).map((acc) => (
                        <option key={acc} value={acc}>
                          {acc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: subtleText,
                        fontSize: 12,
                      }}
                    >
                      Date Range
                    </label>
                    <select
                      value={filterDateRange}
                      onChange={(e) =>
                        setFilterDateRange(
                          e.target.value as "all" | "thisWeek" | "lastMonth"
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid ${faintBorder}`,
                        background: isLight ? "#fff" : "#0f0f10",
                        color: isLight ? "#0b1226" : "#e6eef8",
                      }}
                    >
                      <option value="all">All Dates</option>
                      <option value="thisWeek">This Week</option>
                      <option value="lastMonth">Last Month</option>
                    </select>
                  </div>

                  <div style={{ width: 140 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: subtleText,
                        fontSize: 12,
                      }}
                    >
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "date" | "amount")
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid ${faintBorder}`,
                        background: isLight ? "#fff" : "#0f0f10",
                        color: isLight ? "#0b1226" : "#e6eef8",
                      }}
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>

                  <div style={{ width: 140 }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: subtleText,
                        fontSize: 12,
                      }}
                    >
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "asc" | "desc")
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1px solid ${faintBorder}`,
                        background: isLight ? "#fff" : "#0f0f10",
                        color: isLight ? "#0b1226" : "#e6eef8",
                      }}
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                </div>
                {/* ✅ Reset Button */}
                <div style={{ marginTop: 22, textAlign: "left" }}>
                  <button
                    onClick={() => {
                      setFilterType("all");
                      setFilterAccount("all");
                      setFilterDateRange("all");
                      setSortBy("date");
                      setSortOrder("desc");
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: isLight ? "#f0f0f5" : "#2c2c2e",
                      color: isLight ? "#0b1226" : "#e6eef8",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isLight
                        ? "#e0e0e5"
                        : "#3a3a3c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isLight
                        ? "#f0f0f5"
                        : "#2c2c2e")
                    }
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* right: chart toggles */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Pie Chart", "Bar Chart", "Line Chart"].map((chartName) => {
            const active = selectedCharts.includes(chartName);
            return (
              <button
                key={chartName}
                onClick={() => toggleChart(chartName)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: `1px solid ${active ? accent : faintBorder}`,
                  background: active ? accent : cardBg,
                  color: active ? "#fff" : isLight ? "#0b1226" : "#e6eef8",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {chartName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Transactions list */}
      <section style={{ marginTop: 8 }}>
        <h2 style={{ margin: "8px 0 12px", fontSize: 18, fontWeight: 600 }}>
          Transactions
        </h2>

        {filteredTransactions.length === 0 ? (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: cardBg,
              border: `1px solid ${faintBorder}`,
              color: subtleText,
            }}
          >
            No transactions match the filter.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTransactions.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: cardBg,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  border: `1px solid ${faintBorder}`,
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background:
                          t.type === "income"
                            ? DEFAULT_COLORS[0]
                            : DEFAULT_COLORS[1],
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    />
                    <strong
                      style={{ textTransform: "capitalize", fontSize: 14 }}
                    >
                      {t.type}
                    </strong>
                  </div>

                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color: subtleText,
                    }}
                  >
                    {t.account} • {new Date(t.date).toLocaleDateString()}
                    <br />
                    <em style={{ color: subtleText }}>
                      {t.categories?.name || "Uncategorized"}
                    </em>
                  </p>
                </div>

                <div
                  style={{ justifySelf: "end", fontWeight: 700, fontSize: 15 }}
                >
                  <span
                    style={{
                      color:
                        t.type === "income"
                          ? DEFAULT_COLORS[0]
                          : DEFAULT_COLORS[1],
                    }}
                  >
                    ₹{Number(t.amount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div style={{ justifySelf: "end", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => startEditing(t)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: `1px solid ${faintBorder}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: accent,
                      fontWeight: 600,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: `1px solid ${faintBorder}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: "#ff3b30",
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit form (expanded, same logic) */}
      {editingTransaction && (
        <section
          id="edit-form"
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: cardBg,
            boxShadow: cardShadow,
            border: `1px solid ${faintBorder}`,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700 }}>
            Edit Transaction
          </h3>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: subtleText,
                  marginBottom: 6,
                }}
              >
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Amount"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${faintBorder}`,
                  background: isLight ? "#fff" : "#0f0f10",
                  color: isLight ? "#0b1226" : "#e6eef8",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: subtleText,
                  marginBottom: 6,
                }}
              >
                Account
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="Account name"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${faintBorder}`,
                  background: isLight ? "#fff" : "#0f0f10",
                  color: isLight ? "#0b1226" : "#e6eef8",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: subtleText,
                  marginBottom: 6,
                }}
              >
                Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "income" | "expense")
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${faintBorder}`,
                  background: isLight ? "#fff" : "#0f0f10",
                  color: isLight ? "#0b1226" : "#e6eef8",
                }}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: subtleText,
                  marginBottom: 6,
                }}
              >
                Category
              </label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${faintBorder}`,
                  background: isLight ? "#fff" : "#0f0f10",
                  color: isLight ? "#0b1226" : "#e6eef8",
                }}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setEditingTransaction(null)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${faintBorder}`,
                background: "transparent",
                cursor: "pointer",
                color: subtleText,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: accent,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              Save
            </button>
          </div>
        </section>
      )}

      {/* Charts */}
      {selectedCharts.includes("Pie Chart") && (
        <div style={chartCardStyle}>
          <ResponsiveContainer width="100%" height={300}>
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
                    fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => formatMoney(val)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedCharts.includes("Bar Chart") && (
        <div style={chartCardStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="account" />
              <YAxis />
              <Tooltip formatter={(val: number) => formatMoney(val)} />
              <Legend />
              <Bar dataKey="income" fill={DEFAULT_COLORS[0]} />
              <Bar dataKey="expense" fill={DEFAULT_COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedCharts.includes("Line Chart") && (
        <div style={chartCardStyle}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(val: number) => formatMoney(val)} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke={accent} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <footer
        style={{
          marginTop: 36,
          textAlign: "center",
          color: subtleText,
          fontSize: 13,
        }}
      >
        Built with care • Minimal modern UI
      </footer>
    </main>
  );
}
