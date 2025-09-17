"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@lib/theme";

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
  const { theme } = useTheme();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] =
    useState<keyof typeof accountTypes>("checking");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] =
    useState<keyof typeof accountTypes>("checking");
  const [filterType, setFilterType] = useState<
    keyof typeof accountTypes | "all"
  >("all");
  const [sortBalance, setSortBalance] = useState<"asc" | "desc">("desc");
  const [showArchived, setShowArchived] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Theme variables
  const themeVars: React.CSSProperties & { [key: string]: string } =
    theme === "dark"
      ? {
          "--bg": "#121212",
          "--card-bg": "#1e1e1e",
          "--text": "#e0e0e0",
          "--subtext": "#aaa",
          "--primary": "#90caf9",
          "--primary-hover": "#64b5f6",
          "--danger": "#ef5350",
          "--danger-hover": "#e53935",
          "--border": "#333",
          "--shadow": "rgba(0,0,0,0.6)",
        }
      : {
          "--bg": "#f9f9f9",
          "--card-bg": "#ffffff",
          "--text": "#333",
          "--subtext": "#666",
          "--primary": "#1976d2",
          "--primary-hover": "#1565c0",
          "--danger": "#d32f2f",
          "--danger-hover": "#b71c1c",
          "--border": "#ddd",
          "--shadow": "rgba(0,0,0,0.08)",
        };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
      showNotification("Failed to load accounts", "error");
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newAccountName.trim()) {
      showNotification("Please enter an account name", "error");
      return;
    }
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAccountName, type: newAccountType }),
      });
      const result = await res.json();
      if (res.status >= 400) {
        showNotification(result.error || "Failed to add account", "error");
        return;
      }
      setNewAccountName("");
      setNewAccountType("checking");
      showNotification("Account added successfully", "success");
      fetchAccounts();
    } catch {
      showNotification("Failed to add account", "error");
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      showNotification("Account name cannot be empty", "error");
      return;
    }
    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName, type: editType }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      showNotification("Account updated successfully", "success");
      fetchAccounts();
    } catch {
      showNotification("Failed to update account", "error");
    }
  };

  const handleArchive = async (id: number, archive: boolean) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archived: archive }),
      });
      if (!res.ok) throw new Error();
      showNotification(
        `Account ${archive ? "archived" : "restored"}`,
        "success"
      );
      fetchAccounts();
    } catch {
      showNotification(
        `Failed to ${archive ? "archive" : "restore"} account`,
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this account? This cannot be undone."
      )
    )
      return;
    try {
      const res = await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      showNotification("Account deleted successfully", "success");
      fetchAccounts();
    } catch {
      showNotification("Failed to delete account", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditType("checking");
  };

  const filteredAccounts = accounts
    .filter((acc) => {
      if (filterType !== "all" && acc.type !== filterType) return false;
      if (!showArchived && acc.archived) return false;
      if (showArchived && !acc.archived) return false;
      return true;
    })
    .sort((a, b) =>
      sortBalance === "asc" ? a.balance - b.balance : b.balance - a.balance
    );

  return (
    <div
      className="settings-container"
      style={themeVars as React.CSSProperties} // cast to CSSProperties
    >
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <h2 className="page-title">⚙️ Account Management</h2>

      {/* Add Account */}
      <div className="add-account-card">
        <h3>Add New Account</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Account Name"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            className="text-input"
          />
          <select
            value={newAccountType}
            onChange={(e) =>
              setNewAccountType(e.target.value as keyof typeof accountTypes)
            }
            className="select-input"
          >
            {Object.keys(accountTypes).map((type) => (
              <option key={type} value={type}>
                {accountTypes[type as keyof typeof accountTypes]}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="btn-primary"
            disabled={!newAccountName.trim()}
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="controls-card">
        <h3>Filter & Sort</h3>
        <div className="controls-row">
          <div className="control-group">
            <label>Account Type:</label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as keyof typeof accountTypes | "all"
                )
              }
              className="select-input"
            >
              <option value="all">All Types</option>
              {Object.keys(accountTypes).map((type) => (
                <option key={type} value={type}>
                  {accountTypes[type as keyof typeof accountTypes]}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Sort by Balance:</label>
            <select
              value={sortBalance}
              onChange={(e) => setSortBalance(e.target.value as "asc" | "desc")}
              className="select-input"
            >
              <option value="desc">High → Low</option>
              <option value="asc">Low → High</option>
            </select>
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Show Archived
            </label>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading accounts...</p>
        </div>
      )}

      {/* Account Cards */}
      {!loading && (
        <>
          <h3>
            {showArchived ? "Archived Accounts" : "Active Accounts"} (
            {filteredAccounts.length})
          </h3>
          {filteredAccounts.length === 0 ? (
            <div className="empty-state">
              <p>No accounts found</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {filteredAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`account-card ${acc.archived ? "archived" : ""}`}
                >
                  {editingId === acc.id ? (
                    <div className="edit-form">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="text-input"
                        autoFocus
                      />
                      <select
                        value={editType}
                        onChange={(e) =>
                          setEditType(
                            e.target.value as keyof typeof accountTypes
                          )
                        }
                        className="select-input"
                      >
                        {Object.keys(accountTypes).map((type) => (
                          <option key={type} value={type}>
                            {accountTypes[type as keyof typeof accountTypes]}
                          </option>
                        ))}
                      </select>
                      <div className="button-group">
                        <button
                          onClick={() => handleSaveEdit(acc.id)}
                          className="btn-primary"
                          disabled={!editName.trim()}
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="account-header">
                        <div className="account-name">{acc.name}</div>
                        <div className="account-type">
                          {accountTypes[acc.type]}
                        </div>
                      </div>
                      <div className="account-balance">
                        ₹
                        {acc.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      {acc.archived && (
                        <div className="archived-badge">Archived</div>
                      )}
                      <div className="account-actions">
                        <button
                          onClick={() => {
                            setEditingId(acc.id);
                            setEditName(acc.name);
                            setEditType(acc.type);
                          }}
                          className="btn-icon"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        {acc.archived ? (
                          <button
                            onClick={() => handleArchive(acc.id, false)}
                            className="btn-icon"
                            title="Restore"
                          >
                            📂 Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(acc.id, true)}
                            className="btn-icon"
                            title="Archive"
                          >
                            📁 Archive
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="btn-icon danger"
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .settings-container {
          background: var(--bg);
          color: var(--text);
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: system-ui, sans-serif;
        }

        .page-title {
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .add-account-card,
        .controls-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px var(--shadow);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .form-row,
        .controls-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .text-input,
        .select-input {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          min-width: 150px;
        }

        .btn-primary {
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          margin-right: 0.5rem;
        }
        .btn-icon.danger {
          color: var(--danger);
        }
        .btn-icon.danger:hover {
          color: var(--danger-hover);
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .account-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 8px var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .account-card.archived {
          opacity: 0.7;
        }

        .account-header {
          display: flex;
          justify-content: space-between;
          font-weight: 500;
        }
        .account-name {
          font-size: 1rem;
        }
        .account-type {
          font-size: 0.85rem;
          color: var(--subtext);
        }

        .account-balance {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .archived-badge {
          background: var(--border);
          color: var(--subtext);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          display: inline-block;
        }

        .account-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        .notification {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: 500;
        }
        .notification.success {
          background: #4caf50;
          color: white;
        }
        .notification.error {
          background: #ef5350;
          color: white;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9rem;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--subtext);
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 0.5rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
