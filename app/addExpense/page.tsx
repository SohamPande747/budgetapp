"use client";

import { useState } from "react";

export default function AddExpense() {
  const [accounts, setAccounts] = useState(["Cash", "Bank", "Credit Card"]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]); // default to "Cash"
  const [newAccount, setNewAccount] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddAccount = () => {
    if (newAccount.trim() === "") return;

    // prevent duplicates (case-insensitive)
    if (
      accounts.some(
        (acc) => acc.toLowerCase() === newAccount.trim().toLowerCase()
      )
    ) {
      alert("Account already exists!");
      return;
    }

    setAccounts([...accounts, newAccount.trim()]);
    setSelectedAccount(newAccount.trim());
    setNewAccount("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "expense",
        account: selectedAccount,
        amount: Number(amount),
        date: new Date().toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
      alert(`❌ ${data.error || "Failed to save expense"}`);
      return;
    }

    console.log("✅ Saved to backend:", data);
    alert(`✅ Expense of ₹${amount} added to ${selectedAccount}`);

    setAmount("");
    setSelectedAccount("");
  } catch (error) {
    console.error("Fetch error:", error);
    alert("❌ Failed to save expense to backend");
  }
};


  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "3rem auto",
        padding: "2rem",
        backgroundColor: "var(--card-bg)",
        color: "var(--text-color)",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Add Expense
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {/* Select existing account */}
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="">Select Account</option>
          {accounts.map((account, idx) => (
            <option key={idx} value={account}>
              {account}
            </option>
          ))}
        </select>

        {/* Add new account */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add New Account"
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="button"
            onClick={handleAddAccount}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {/* Expense Amount */}
        <input
          type="number"
          placeholder="Expense Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#f44336",
            color: "#fff",
            fontWeight: "600",
            boxShadow: "0 4px 8px rgba(244,67,54,0.3)",
            transition: "all 0.2s ease",
          }}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
