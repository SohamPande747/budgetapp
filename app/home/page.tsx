"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";

// -------------------- Theme type --------------------
type Theme = {
  background: string;
  color: string;
  cardBg: string;
  shadow: string;
  border: string;
  secondary: string;
  primary: string;
  hoverShadow: string;
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ balance: 0, expenses: 0, savings: 0 });
  const router = useRouter();

  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
      } else {
        setUser(user);
        fetchTransactions();
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      const data = await res.json();

      if (Array.isArray(data)) {
        setTransactions(data);

        // compute stats
        const expenses = data
          .filter((t: any) => t.type === "expense")
          .reduce((acc: number, t: any) => acc + t.amount, 0);

        const income = data
          .filter((t: any) => t.type === "income")
          .reduce((acc: number, t: any) => acc + t.amount, 0);

        setStats({
          balance: income,
          expenses,
          savings: income - expenses,
        });
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        color: colors.color,
        background: colors.background,
        minHeight: "100vh",
      }}
    >
      {/* Welcome */}
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
        Welcome back, {user?.user_metadata?.full_name || "User"} 👋
      </h1>


      {/* Quick Stats */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ ...cardStyle(colors) }}>
          <h2 style={{ fontSize: "0.9rem", color: colors.secondary }}>Total Income</h2>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, marginTop: "0.5rem" }}>
            ₹{stats.balance.toLocaleString()}
          </p>
        </div>
        <div style={{ ...cardStyle(colors) }}>
          <h2 style={{ fontSize: "0.9rem", color: colors.secondary }}>Total Expenses</h2>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, marginTop: "0.5rem", color: colors.primary }}>
            ₹{stats.expenses.toLocaleString()}
          </p>
        </div>
        <div style={{ ...cardStyle(colors) }}>
          <h2 style={{ fontSize: "0.9rem", color: colors.secondary }}>Savings</h2>
          <p style={{ fontSize: "1.8rem", fontWeight: 600, marginTop: "0.5rem", color: colors.primary }}>
            ₹{stats.savings.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Recent Transactions */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>
          Recent Transactions
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {transactions.slice(0, 5).map((txn: any) => (
            <li key={txn.id} style={transactionStyle(colors, txn.type)}>
              <span>{txn.account}</span>
              <span style={{ fontWeight: 600 }}>
                {txn.type === "expense" ? "-" : "+"} ₹{txn.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// Styles
const cardStyle = (colors: Theme): React.CSSProperties => ({
  background: colors.cardBg,
  borderRadius: "1rem",
  padding: "1.5rem",
  boxShadow: colors.shadow,
});

const transactionStyle = (colors: Theme, type: string): React.CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "0.8rem 0",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: "1rem",
  color: type === "expense" ? "#EF4444" : "#22C55E",
});
