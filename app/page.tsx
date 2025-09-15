


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
    <main>this will the the landing page very soon 
      
    </main>
  );
}
