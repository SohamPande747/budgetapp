"use client";

import { useBudgetStore } from "@lib/store";
import { useTheme } from "@lib/theme";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { incomes, expenses, setIncomes, setExpenses } = useBudgetStore();
  const { theme } = useTheme();
  const router = useRouter();

  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch("/api/transactions");
      const data = await res.json();

      setIncomes(data.filter((t: any) => t.type === "income"));
      setExpenses(data.filter((t: any) => t.type === "expense"));
    };

    fetchTransactions();
  }, [setIncomes, setExpenses]);

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const savings = totalIncome - totalExpenses;

  const quickActions = [
    { name: "Add Income", type: "income" },
    { name: "Add Expense", type: "expense" },
    { name: "View Reports", type: "report" },
  ];

  const isLight = theme === "light";

  return (
    <main
      style={{
        padding: "3rem 2rem",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        minHeight: "100vh",
        background: isLight ? "#f5f5f7" : "#1c1c1e",
        color: isLight ? "#111" : "#f5f5f7",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "2.5rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: isLight ? "#111" : "#fff",
        }}
      >
        Spendle
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
          justifyContent: "center",
        }}
      >
        {[
          {
            label: "Total Income",
            value: totalIncome,
            bg: isLight ? "#ffffffcc" : "#2c2c2e",
            accent: "#34c759",
          },
          {
            label: "Total Expenses",
            value: totalExpenses,
            bg: isLight ? "#ffffffcc" : "#2c2c2e",
            accent: "#ff3b30",
          },
          {
            label: "Savings",
            value: savings,
            bg: isLight ? "#ffffffcc" : "#2c2c2e",
            accent: "#0a84ff",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: "1 1 260px",
              padding: "2rem",
              borderRadius: "24px",
              background: card.bg,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: isLight
                ? "0 4px 12px rgba(0,0,0,0.08)"
                : "0 4px 18px rgba(0,0,0,0.5)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              cursor: "default",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = isLight
                ? "0 8px 20px rgba(0,0,0,0.12)"
                : "0 8px 24px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = isLight
                ? "0 4px 12px rgba(0,0,0,0.08)"
                : "0 4px 18px rgba(0,0,0,0.5)";
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: card.accent,
              }}
            >
              {card.label}
            </h2>
            <p
              style={{
                fontSize: "2rem",
                margin: "0.6rem 0 0 0",
                fontWeight: 700,
              }}
            >
              ₹{card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            marginBottom: "1.8rem",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: isLight ? "#111" : "#f5f5f7",
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.2rem",
            flexWrap: "wrap",
          }}
        >
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => {
                if (action.type === "income") router.push("/addIncome");
                else if (action.type === "expense") router.push("/addExpense");
                else if (action.type === "report") router.push("/report");
                setActiveAction(action.type);
              }}
              style={{
                minWidth: "180px",
                padding: "0.9rem 1.4rem",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                background: isLight ? "#0a84ff" : "#0a84ff",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
                boxShadow: "0 4px 14px rgba(10,132,255,0.3)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(10,132,255,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(10,132,255,0.3)";
              }}
            >
              {action.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
