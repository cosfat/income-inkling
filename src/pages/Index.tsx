
import { useEffect, useState } from "react";
import { NetWorthCard } from "@/components/NetWorthCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from "@/types/database.types";

const Index = () => {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'income')
        .order('date', { ascending: false });

      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (incomeError) throw incomeError;
      if (expenseError) throw expenseError;

      setIncomes((incomeData as Transaction[]) || []);
      setExpenses((expenseData as Transaction[]) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNetWorth = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return totalIncome - totalExpenses;
  };

  const handleAddIncome = async (data: { name: string; amount: number; date: string }) => {
    try {
      const { data: newIncome, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...data,
            type: 'income' as const
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setIncomes([newIncome as Transaction, ...incomes]);
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const handleAddExpense = async (data: { name: string; amount: number; date: string }) => {
    try {
      const { data: newExpense, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...data,
            type: 'expense' as const
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setExpenses([newExpense as Transaction, ...expenses]);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'income') {
        setIncomes(incomes.filter(income => income.id !== id));
      } else {
        setExpenses(expenses.filter(expense => expense.id !== id));
      }
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleEditTransaction = async (id: string, type: 'income' | 'expense', data: { name: string; amount: number; date: string }) => {
    try {
      const { data: updatedTransaction, error } = await supabase
        .from('transactions')
        .update({
          name: data.name,
          amount: data.amount,
          date: data.date,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (type === 'income') {
        setIncomes(incomes.map(income => 
          income.id === id ? (updatedTransaction as Transaction) : income
        ));
      } else {
        setExpenses(expenses.map(expense => 
          expense.id === id ? (updatedTransaction as Transaction) : expense
        ));
      }
      
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 fade-in">
        Financial Tracker
      </h1>
      
      <div className="grid gap-6">
        <div className="fade-in" style={{ animationDelay: "0.2s" }}>
          <NetWorthCard netWorth={calculateNetWorth()} />
        </div>

        <Tabs defaultValue="add" className="fade-in" style={{ animationDelay: "0.4s" }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="view">View Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-4">Add Income</h3>
                <TransactionForm type="income" onSubmit={handleAddIncome} />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Add Expense</h3>
                <TransactionForm type="expense" onSubmit={handleAddExpense} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="view" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <TransactionList 
                type="income" 
                transactions={incomes}
                isLoading={isLoading}
                onDelete={(id) => handleDeleteTransaction(id, 'income')}
                onEdit={(id, data) => handleEditTransaction(id, 'income', data)}
              />
              <TransactionList 
                type="expense" 
                transactions={expenses}
                isLoading={isLoading}
                onDelete={(id) => handleDeleteTransaction(id, 'expense')}
                onEdit={(id, data) => handleEditTransaction(id, 'expense', data)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
