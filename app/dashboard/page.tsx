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
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "calc(100vh - 50px)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Page Title */}
      <h1
        style={{
          fontSize: "2.6rem",
          marginBottom: "2.5rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          textAlign: "center",
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
            bg: isLight
              ? "linear-gradient(135deg, #a8e6a2, #4caf50)" // green gradient
              : "linear-gradient(135deg, #145214, #2e7d32)",
            color: "#fff",
          },
          {
            label: "Total Expenses",
            value: totalExpenses,
            bg: isLight
              ? "linear-gradient(135deg, #f28b82, #d32f2f)" // red gradient
              : "linear-gradient(135deg, #5c1d1d, #b71c1c)",
            color: "#fff",
          },
          {
            label: "Savings",
            value: savings,
            bg: isLight
              ? "linear-gradient(135deg, #81d4fa, #0288d1)" // blue gradient
              : "linear-gradient(135deg, #1a237e, #1976d2)",
            color: "#fff",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: "1 1 260px",
              padding: "2rem",
              borderRadius: "20px",
              background: card.bg,
              color: card.color,
              boxShadow: isLight
                ? "0 8px 20px rgba(0,0,0,0.08)"
                : "0 8px 20px rgba(0,0,0,0.35)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                isLight
                  ? "0 8px 20px rgba(0,0,0,0.08)"
                  : "0 8px 20px rgba(0,0,0,0.35)";
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
              {card.label}
            </h2>
            <p
              style={{
                fontSize: "1.8rem",
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
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
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
          {quickActions.map((action) => {
            const blueGradient = "linear-gradient(135deg, #81d4fa, #0288d1)"; // blue gradient
            return (
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
                  padding: "1rem 1.5rem",
                  borderRadius: "18px",
                  border: "none",
                  cursor: "pointer",
                  background: blueGradient,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px) scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 15px rgba(0,0,0,0.15)";
                }}
              >
                {action.name}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
