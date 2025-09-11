"use client";

import { useState } from "react";
import { useTheme } from "@lib/theme"; // ✅ import theme hook

export default function AddIncomePage() {
  const [accounts, setAccounts] = useState(["Cash", "Bank", "UPI"]);
  const [newAccount, setNewAccount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("Cash");
  const [amount, setAmount] = useState("");

  const { theme } = useTheme(); // ✅ get theme
  const isLight = theme === "light";

  const handleAddAccount = () => {
    if (newAccount.trim() && !accounts.includes(newAccount)) {
      setAccounts([...accounts, newAccount]);
      setSelectedAccount(newAccount);
      setNewAccount("");
    }
  };

  const handleSave = () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }
    alert(`Income added:\nAccount: ${selectedAccount}\nAmount: ₹${amount}`);
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "3rem auto",
        padding: "2rem",
        borderRadius: "16px",
        background: isLight ? "#ffffff" : "#1e1e1e", // ✅ theme aware
        boxShadow: isLight
          ? "0 6px 20px rgba(0,0,0,0.1)"
          : "0 6px 20px rgba(0,0,0,0.6)",
        fontFamily: "Segoe UI, sans-serif",
        color: isLight ? "#111" : "#f0f0f0", // ✅ text color
        transition: "all 0.3s ease",
      }}
    >
      <h2
        style={{
          marginBottom: "1.5rem",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: 600,
          color: isLight ? "#1976d2" : "#90caf9", // ✅ theme aware
        }}
      >
        ➕ Add Income
      </h2>

      {/* Account Dropdown */}
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
        Select Account
      </label>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        style={{
          width: "100%",
          padding: "0.9rem",
          marginBottom: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #888",
          fontSize: "1rem",
          outline: "none",
          background: isLight ? "#fff" : "#2a2a2a", // ✅ theme aware
          color: isLight ? "#111" : "#f0f0f0",
        }}
      >
        {accounts.map((acc) => (
          <option key={acc} value={acc}>
            {acc}
          </option>
        ))}
      </select>

      {/* Add New Account */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          placeholder="New account name"
          style={{
            flex: 1,
            padding: "0.9rem",
            borderRadius: "10px",
            border: "1px solid #888",
            fontSize: "1rem",
            outline: "none",
            background: isLight ? "#fff" : "#2a2a2a", // ✅ theme aware
            color: isLight ? "#111" : "#f0f0f0",
          }}
        />
        <button
          onClick={handleAddAccount}
          style={{
            padding: "0.9rem 1.2rem",
            border: "none",
            borderRadius: "10px",
            background: isLight ? "#4caf50" : "#388e3c", // ✅ theme aware
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background 0.2s",
          }}
        >
          Add
        </button>
      </div>

      {/* Amount */}
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
        Amount
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount (₹)"
        style={{
          width: "80%",
          padding: "0.9rem",
          marginBottom: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #888",
          fontSize: "1rem",
          outline: "none",
          alignItems: "center",
          background: isLight ? "#fff" : "#2a2a2a", // ✅ theme aware
          color: isLight ? "#111" : "#f0f0f0",
        }}
      />

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          width: "100%",
          padding: "1rem",
          border: "none",
          borderRadius: "12px",
          background: isLight ? "#1976d2" : "#1565c0", // ✅ theme aware
          color: "#fff",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: isLight
            ? "0 4px 12px rgba(25, 118, 210, 0.3)"
            : "0 4px 12px rgba(21, 101, 192, 0.6)",
          transition: "all 0.2s ease",
        }}
      >
        💾 Save Income
      </button>
    </div>
  );
}
