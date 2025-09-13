"use client";

import { useEffect, useState } from "react";

type Account = {
  id: number;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  archived?: boolean;
};

const accountTypes = {
  checking: "💰 Checking",
  savings: "🏦 Savings",
  credit: "💳 Credit",
  investment: "📈 Investment",
};

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<keyof typeof accountTypes>("checking");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<keyof typeof accountTypes>("checking");
  const [filterType, setFilterType] = useState<keyof typeof accountTypes | "all">("all");
  const [sortBalance, setSortBalance] = useState<"asc" | "desc">("desc");

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setAccounts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Add new account
  const handleAdd = async () => {
  if (!newAccountName.trim()) return;

  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newAccountName, type: newAccountType }),
  });
  const result = await res.json();

  if (res.status >= 400) {
    console.error("Backend error:", result);
    alert(result.error || "Failed to add account");
    return;
  }

  // Success
  setNewAccountName("");
  setNewAccountType("checking");
  fetchAccounts();
};


  // Save edits
  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName, type: editType }),
      });
      if (!res.ok) throw new Error("Failed to update account");
      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete account
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & sort
  const filteredAccounts = accounts
    .filter((acc) => filterType === "all" || acc.type === filterType)
    .sort((a, b) => (sortBalance === "asc" ? a.balance - b.balance : b.balance - a.balance));

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 16 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>⚙️ Account Management</h2>

      {/* Add new account */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Account Name"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <select
          value={newAccountType}
          onChange={(e) => setNewAccountType(e.target.value as keyof typeof accountTypes)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {Object.keys(accountTypes).map((type) => (
            <option key={type} value={type}>
              {accountTypes[type as keyof typeof accountTypes]}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          style={{ padding: "8px 16px", background: "#1976d2", color: "#fff", borderRadius: 6 }}
        >
          ➕ Add
        </button>
      </div>

      {/* Filter & Sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as keyof typeof accountTypes | "all")}
        >
          <option value="all">All Types</option>
          {Object.keys(accountTypes).map((type) => (
            <option key={type} value={type}>
              {accountTypes[type as keyof typeof accountTypes]}
            </option>
          ))}
        </select>

        <select value={sortBalance} onChange={(e) => setSortBalance(e.target.value as "asc" | "desc")}>
          <option value="desc">Balance: High → Low</option>
          <option value="asc">Balance: Low → High</option>
        </select>
      </div>

      {/* Loading */}
      {loading && <p>Loading accounts...</p>}

      {/* Account Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {!loading &&
          filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#f9f9f9",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {editingId === acc.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as keyof typeof accountTypes)}
                  >
                    {Object.keys(accountTypes).map((type) => (
                      <option key={type} value={type}>
                        {accountTypes[type as keyof typeof accountTypes]}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleSaveEdit(acc.id)} style={{ padding: 6, marginTop: 6 }}>
                    💾 Save
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>{acc.name}</div>
                  <div style={{ opacity: 0.7 }}>{accountTypes[acc.type]}</div>
                  <div style={{ fontSize: 16, marginTop: 4 }}>Balance: ₹{acc.balance.toFixed(2)}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => {
                        setEditingId(acc.id);
                        setEditName(acc.name);
                        setEditType(acc.type);
                      }}
                      style={{ flex: 1, padding: 6, borderRadius: 6 }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      style={{ flex: 1, padding: 6, borderRadius: 6, background: "#f44336", color: "#fff" }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
