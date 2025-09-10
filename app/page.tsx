"use client";

import { useBudgetStore } from "@lib/store";
import { useTheme } from "@lib/theme";
import { useState } from "react";

export default function HomePage() {
  const { incomes, expenses } = useBudgetStore();
  const { theme } = useTheme();

  const [activeAction, setActiveAction] = useState<string | null>(null);

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
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            marginBottom: "1rem",
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => setActiveAction(action.type)}
              style={{
                width: "50%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeAction === action.type ? "#1976d2" : "#2196f3",
                color: "#fff",
                fontWeight: 600,
                boxShadow:
                  activeAction === action.type
                    ? "0 4px 8px rgba(25, 118, 210, 0.4)"
                    : "0 2px 4px rgba(33, 150, 243, 0.3)",
                transition: "all 0.2s ease",
                margin: "0 auto", // <-- this centers the button
                display: "block", // <-- required for margin auto to work
              }}
            >
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder for dynamic content */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: "8px",
          backgroundColor: isLight ? "#f9f9f9" : "#2a2a2a",
          color: isLight ? "#111" : "#f0f0f0",
          minHeight: "80px",
          fontWeight: 500,
          fontSize: "0.95rem",
          transition: "all 0.3s",
        }}
      >
        {activeAction === "income" && <p>Income form goes here</p>}
        {activeAction === "expense" && <p>Expense form goes here</p>}
        {activeAction === "report" && <p>Reports view goes here</p>}
        {!activeAction && <p>Select an action above</p>}
      </div>
    </main>
  );
}
