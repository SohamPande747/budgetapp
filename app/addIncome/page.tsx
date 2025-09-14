"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@lib/theme";

export default function AddIncomePage() {
  const [accounts, setAccounts] = useState(["Cash", "Bank", "UPI"]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("Cash");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [amount, setAmount] = useState("");

  const { theme } = useTheme();
  const isLight = theme === "light";

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data ?? []);
        if (data.length > 0) setSelectedCategory(data[0].id);
      } catch (err) {
        console.error("Error fetching categories:", err);
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
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "income",
          account: selectedAccount,
          amount: Number(amount),
          date: new Date().toISOString(),
          category_id: selectedCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to save income");
      const newIncome = await res.json();
      console.log("Saved to backend:", newIncome);

      alert(
        `Income added:\nAccount: ${selectedAccount}\nCategory: ${
          categories.find((c) => c.id === selectedCategory)?.name || "N/A"
        }\nAmount: ₹${amount}`
      );

      setAmount("");
      setSelectedAccount("Cash");
      if (categories.length > 0) setSelectedCategory(categories[0].id);
    } catch (error) {
      console.error(error);
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
        boxShadow: isLight
          ? "0 6px 20px #0000008"
          : "0 6px 20px #000008ff",
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
          border: "1px solid #888",
          background: isLight ? "#fff" : "#2a2a2a",
          color: isLight ? "#000008ff" : "#f0f0f0",
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
            border: "1px solid #888",
            background: isLight ? "#fff" : "#2a2a2a",
            color: isLight ? "#000008ff" : "#f0f0f0",
          }}
        />
        <button
          onClick={handleAddCategory}
          style={{
            padding: "0.9rem 1.2rem",
            border: "none",
            borderRadius: "10px",
            background: isLight ? "#4caf50" : "#388e3c",
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
          width: "95%",
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
