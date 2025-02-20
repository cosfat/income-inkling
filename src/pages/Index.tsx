
import { useState } from "react";
import { NetWorthCard } from "@/components/NetWorthCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
}

const Index = () => {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);

  const calculateNetWorth = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return totalIncome - totalExpenses;
  };

  const handleAddIncome = (data: { name: string; amount: number; date: string }) => {
    setIncomes([...incomes, { ...data, id: crypto.randomUUID() }]);
  };

  const handleAddExpense = (data: { name: string; amount: number; date: string }) => {
    setExpenses([...expenses, { ...data, id: crypto.randomUUID() }]);
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
              <TransactionList type="income" transactions={incomes} />
              <TransactionList type="expense" transactions={expenses} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
