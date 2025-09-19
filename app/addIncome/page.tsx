"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@lib/theme";

interface Category {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
}

export default function AddIncomePage() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "default_cash", name: "Cash" },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "default_salary", name: "Salary" },
  ]);
  const [selectedAccount, setSelectedAccount] = useState("default_cash");
  const [selectedCategory, setSelectedCategory] = useState("default_salary");
  const [newCategory, setNewCategory] = useState("");
  const [amount, setAmount] = useState("");

  const { theme } = useTheme();
  const isLight = theme === "light";

  // Fetch accounts and categories from backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data: Account[] = await res.json();
        if (data.length > 0) {
          setAccounts(data);
          setSelectedAccount(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?type=income");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        if (data.length > 0) {
          setCategories(data);
          setSelectedCategory(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAccounts();
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!selectedCategory || !selectedAccount) {
      alert("Please select an account and category");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "income",
          account_id: selectedAccount,
          amount: Number(amount),
          date: new Date().toISOString(),
          category_id: selectedCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to save income");
      const data = await res.json();
      console.log("Saved:", data);

      alert(
        `Income added:\nAccount: ${
          accounts.find((a) => a.id === selectedAccount)?.name
        }\nCategory: ${
          categories.find((c) => c.id === selectedCategory)?.name
        }\nAmount: ₹${amount}`
      );

      setAmount("");
      if (accounts.length > 0) setSelectedAccount(accounts[0].id);
      if (categories.length > 0) setSelectedCategory(categories[0].id);
    } catch (err) {
      console.error(err);
      alert("Failed to save income");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "3rem auto",
        padding: "2rem",
        borderRadius: "16px",
        background: isLight ? "#ffffff" : "#0d101aff",
        boxShadow: isLight ? "0 6px 20px #0000008" : "0 6px 20px #000008ff",
        fontFamily: "Segoe UI, sans-serif",
        color: isLight ? "#000008ff" : "#f0f0f0",
      }}
    >
      <h2
        style={{
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: isLight ? "#1976d2" : "#90caf9",
        }}
      >
        ➕ Add Income
      </h2>

      {/* Account Dropdown */}
      <label style={{ display: "block", marginBottom: "0.5rem" }}>Select Account</label>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        style={{
          width: "100%",
          padding: "0.9rem",
          marginBottom: "1.8rem",
          borderRadius: "10px",
          border: "1px solid #888",
          background: isLight ? "#fff" : "#2a2a2a",
          color: isLight ? "#000008ff" : "#f0f0f0",
        }}
      >
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>

      {/* Category Dropdown */}
      <label style={{ display: "block", marginBottom: "0.5rem" }}>Select Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "0.9rem",
          marginBottom: "1.8rem",
          borderRadius: "10px",
          border: "1px solid #888",
          background: isLight ? "#fff" : "#2a2a2a",
          color: isLight ? "#000008ff" : "#f0f0f0",
        }}
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Amount Input */}
      <label style={{ display: "block", marginBottom: "0.5rem" }}>Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount (₹)"
        style={{
          width: "100%",
          padding: "0.9rem",
          marginBottom: "2rem",
          borderRadius: "10px",
          border: "1px solid #888",
          background: isLight ? "#fff" : "#2a2a2a",
          color: isLight ? "#000008ff" : "#f0f0f0",
        }}
      />

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "1rem",
          border: "none",
          borderRadius: "12px",
          background: isLight ? "#1976d2" : "#1565c0",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        💾 Save Income
      </button>
    </div>
  );
}
