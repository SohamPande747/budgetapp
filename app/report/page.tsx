"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@lib/theme";

interface Transaction {
  id: number;
  account: string;
  type: "income" | "expense";
  amount: number;
  created_at: string;
}

interface AccountReport {
  account: string;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactions: Transaction[];
}

export default function ReportPage() {
  const { theme } = useTheme();
  const [reports, setReports] = useState<AccountReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    // fetch all transactions
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // aggregate per account
    const accountsMap: Record<string, AccountReport> = {};

    data.forEach((tx: Transaction) => {
      if (!accountsMap[tx.account]) {
        accountsMap[tx.account] = {
          account: tx.account,
          totalIncome: 0,
          totalExpense: 0,
          currentBalance: 0,
          transactions: [],
        };
      }

      if (tx.type === "income") accountsMap[tx.account].totalIncome += tx.amount;
      if (tx.type === "expense") accountsMap[tx.account].totalExpense += tx.amount;

      accountsMap[tx.account].transactions.push(tx);
      accountsMap[tx.account].currentBalance =
        accountsMap[tx.account].totalIncome - accountsMap[tx.account].totalExpense;
    });

    setReports(Object.values(accountsMap));
    setLoading(false);
  };

  const isLight = theme === "light";
    return (
    <main
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: isLight ? "#fafafa" : "#121212",
        color: isLight ? "#111" : "#f0f0f0",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Reports</h1>

      {loading && <p>Loading...</p>}

      {!loading &&
        reports.map((acc) => (
          <div
            key={acc.account}
            style={{
              marginBottom: "2rem",
              borderRadius: "12px",
              padding: "1rem",
              backgroundColor: isLight ? "#fff" : "#1e1e1e",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>{acc.account}</h2>
            <p>
              Total Income: ₹{acc.totalIncome} | Total Expense: ₹{acc.totalExpense} | Balance: ₹
              {acc.currentBalance}
            </p>

            <table
              style={{
                width: "100%",
                marginTop: "1rem",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Type</th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Amount</th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {acc.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ padding: "0.5rem" }}>{tx.type}</td>
                    <td style={{ padding: "0.5rem" }}>₹{tx.amount}</td>
                    <td style={{ padding: "0.5rem" }}>{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </main>
  );
}
