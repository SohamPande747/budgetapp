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

  // ⬇️ fetch transactions on page load
  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch("/api/transactions");
      const data = await res.json();

      // Split into incomes and expenses
      const incomeData = data.filter((t: any) => t.type === "income");
      const expenseData = data.filter((t: any) => t.type === "expense");

      setIncomes(incomeData);
      setExpenses(expenseData);
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
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundColor: isLight ? "#fafafa" : "#121212",
        color: isLight ? "#111" : "#f0f0f0",
        minHeight: "calc(100vh - 50px)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
        Budget Dashboard
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Total Income", value: totalIncome, bg: "#4caf50" },
          { label: "Total Expenses", value: totalExpenses, bg: "#f44336" },
          { label: "Savings", value: savings, bg: "#2196f3" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: "1 1 200px",
              padding: "1.5rem",
              borderRadius: "12px",
              backgroundColor: card.bg,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-4px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 500 }}>
              {card.label}
            </h2>
            <p style={{ fontSize: "1.5rem", margin: "0.5rem 0 0 0" }}>
              ₹{card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1976d2",
            letterSpacing: "0.5px",
            fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => {
                if (action.type === "income") {
                  router.push("/addIncome"); // navigate to Add Income page
                } else if (action.type === "expense") {
                  router.push("/addExpense"); // navigate to Add Expense page
                } else if (action.type === "report") {
                  router.push("/report"); // navigate to Reports page
                }
                setActiveAction(action.type); // optional: keep track for styling
              }}
              style={{
                minWidth: "150px",
                padding: "0.85rem 1.2rem",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeAction === action.type ? "#1976d2" : "#2196f3",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow:
                  activeAction === action.type
                    ? "0 6px 12px rgba(25, 118, 210, 0.4)"
                    : "0 3px 6px rgba(33, 150, 243, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeAction === action.type ? "#1565c0" : "#1976d2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeAction === action.type ? "#1976d2" : "#2196f3")
              }
            >
              {action.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
