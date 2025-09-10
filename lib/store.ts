"use client";

import { create } from "zustand";
import { Income, Expense } from "../types/budget"; // Make sure @types/budget exists

interface BudgetState {
  incomes: Income[];
  expenses: Expense[];
  addIncome: (income: Income) => void;
  addExpense: (expense: Expense) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  incomes: [],
  expenses: [],
  addIncome: (income) =>
    set((state) => ({ incomes: [...state.incomes, income] })),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
}));
