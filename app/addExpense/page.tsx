"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@lib/theme";

export default function AddExpensePage() {
  const [accounts, setAccounts] = useState(["Cash", "Bank", "UPI"]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("Cash");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [amount, setAmount] = useState("");

  const { theme } = useTheme();
  const isLight = theme === "light";

  const primaryColor = "#d32f2f"; // expense accent
  const inputBg = isLight ? "#fff" : "#2a2a2a";
  const textColor = isLight ? "#1c1c1e" : "#f0f0f0";
  const borderColor = isLight ? "#888" : "#555";

  // Fetch expense categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const expenseCats = (data ?? []).filter((c: any) => c.type === "expense");
        setCategories(expenseCats);
        if (expenseCats.length > 0) setSelectedCategory(expenseCats[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
      )
    ) {
      alert("Category already exists!");
      return;
    }
    const newCatObj = { id: Date.now(), name: newCategory.trim() };
    setCategories([...categories, newCatObj]);
    setSelectedCategory(newCatObj.id);
    setNewCategory("");
  };

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    if (!selectedCategory) return alert("Select a category");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense",
          account: selectedAccount,
          amount: Number(amount),
          date: new Date().toISOString(),
          category_id: selectedCategory,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert(
        `✅ Expense added:\nAccount: ${selectedAccount}\nCategory: ${
          categories.find((c) => c.id === selectedCategory)?.name || "N/A"
        }\nAmount: ₹${amount}`
      );

      setAmount("");
      setSelectedAccount("Cash");
      if (categories.length > 0) setSelectedCategory(categories[0].id);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save expense");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "3rem auto",
        padding: "2rem",
        borderRadius: "16px",
        background: isLight ? "#ffffff" : "#1e1e1e",
        boxShadow: isLight
          ? "0 6px 20px rgba(0,0,0,0.1)"
          : "0 6px 20px rgba(0,0,0,0.6)",
        fontFamily: "Segoe UI, sans-serif",
        color: textColor,
      }}
    >
      <h2
        style={{
          marginBottom: "2rem",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: primaryColor,
        }}
      >
        ➖ Add Expense
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
          border: `1px solid ${borderColor}`,
          background: inputBg,
          color: textColor,
        }}
      >
        {accounts.map((acc) => (
          <option key={acc} value={acc}>
            {acc}
          </option>
        ))}
      </select>

      {/* Category Dropdown */}
      <label style={{ display: "block", marginBottom: "0.5rem" }}>Select Category</label>
      <select
        value={selectedCategory ?? ""}
        onChange={(e) => setSelectedCategory(Number(e.target.value))}
        style={{
          width: "100%",
          padding: "0.9rem",
          marginBottom: "1rem",
          borderRadius: "10px",
          border: `1px solid ${borderColor}`,
          background: inputBg,
          color: textColor,
        }}
      >
        <option value="" disabled>
          -- Select Category --
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Add New Category */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.8rem" }}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          style={{
            flex: 1,
            padding: "0.9rem",
            borderRadius: "10px",
            border: `1px solid ${borderColor}`,
            background: inputBg,
            color: textColor,
          }}
        />
        <button
          onClick={handleAddCategory}
          style={{
            padding: "0.9rem 1.2rem",
            border: "none",
            borderRadius: "10px",
            background: primaryColor,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Amount */}
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
          border: `1px solid ${borderColor}`,
          background: inputBg,
          color: textColor,
        }}
      />

      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "1rem",
          border: "none",
          borderRadius: "12px",
          background: primaryColor,
          color: "#fff",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        💾 Save Expense
      </button>
    </div>
  );
}
