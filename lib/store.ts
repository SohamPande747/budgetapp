import { create } from "zustand";

interface Transaction {
  id: number;
  type: "income" | "expense";
  account: string;
  amount: number;
  date: string;
}

interface BudgetState {
  incomes: Transaction[];
  expenses: Transaction[];
  setIncomes: (incomes: Transaction[]) => void;
  setExpenses: (expenses: Transaction[]) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  incomes: [],
  expenses: [],
  setIncomes: (incomes) => set({ incomes }),
  setExpenses: (expenses) => set({ expenses }),
}));
