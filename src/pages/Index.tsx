import { useEffect, useState } from "react";
import { NetWorthCard } from "@/components/NetWorthCard";
import { CurrentBalanceCard } from "@/components/CurrentBalanceCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Transaction } from "@/types/database.types";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Index = () => {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState<{
    incomes: Transaction[];
    expenses: Transaction[];
  }>({ incomes: [], expenses: [] });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const calculateNetWorth = () => {
    const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    return totalIncome - totalExpenses;
  };

  const calculateCurrentBalance = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const totalIncome = incomes
      .filter(income => income.date <= today)
      .reduce((sum, income) => sum + Number(income.amount), 0);
    
    const totalExpenses = expenses
      .filter(expense => expense.date <= today)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    return totalIncome - totalExpenses;
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching transactions...");
      
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

      console.log("Income data:", incomeData);
      console.log("Income error:", incomeError);
      console.log("Expense data:", expenseData);
      console.log("Expense error:", expenseError);

      if (incomeError) throw incomeError;
      if (expenseError) throw expenseError;

      // Type assertion to ensure the data matches our Transaction type
      setIncomes(incomeData?.map(income => ({
        ...income,
        type: 'income' as const
      })) || []);
      
      setExpenses(expenseData?.map(expense => ({
        ...expense,
        type: 'expense' as const
      })) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Verileri yüklerken bir hata oluştu');
    } finally {
      // Biraz gecikme ekleyin, böylece DOM güncellenir ve render tamamlanır
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  const handleAddIncome = async (data: { name: string; amount: number; date: string }) => {
    try {
      console.log("Adding income:", data);
      
      const { data: newIncome, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...data,
            type: 'income' as const
          }
        ])
        .select();

      console.log("New income response:", newIncome);
      console.log("New income error:", error);

      if (error) throw error;
      if (!newIncome || newIncome.length === 0) throw new Error('No data returned after insert');

      const typedIncome: Transaction = {
        ...newIncome[0],
        type: 'income' as const
      };

      setIncomes([typedIncome, ...incomes]);
      toast.success('Income added successfully');
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const handleAddExpense = async (data: { name: string; amount: number; date: string }) => {
    try {
      console.log("Adding expense:", data);
      
      const { data: newExpense, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...data,
            type: 'expense' as const
          }
        ])
        .select();

      console.log("New expense response:", newExpense);
      console.log("New expense error:", error);

      if (error) throw error;
      if (!newExpense || newExpense.length === 0) throw new Error('No data returned after insert');

      const typedExpense: Transaction = {
        ...newExpense[0],
        type: 'expense' as const
      };

      setExpenses([typedExpense, ...expenses]);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleDeleteTransaction = async (id: string, type: 'income' | 'expense') => {
    try {
      console.log("Deleting transaction:", { id, type });
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      console.log("Delete error:", error);

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
      console.log("Editing transaction:", { id, type, data });
      
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

      console.log("Update response:", updatedTransaction);
      console.log("Update error:", error);

      if (error) throw error;

      const typedTransaction: Transaction = {
        ...updatedTransaction,
        type: type as 'income' | 'expense'
      };

      if (type === 'income') {
        setIncomes(incomes.map(income => 
          income.id === id ? typedTransaction : income
        ));
      } else {
        setExpenses(expenses.map(expense => 
          expense.id === id ? typedTransaction : expense
        ));
      }
      
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 fade-in">
        Finansal Takip
      </h1>
      
      <div className="grid gap-6 pb-12">
        <div className="grid gap-6 md:grid-cols-2 fade-in">
          <NetWorthCard netWorth={calculateNetWorth()} />
          <CurrentBalanceCard balance={calculateCurrentBalance()} />
        </div>

        <Tabs defaultValue="add" className="fade-in">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Add Transaction</TabsTrigger>
            <TabsTrigger value="view">View Transactions</TabsTrigger>
            <TabsTrigger value="calendar">Takvim Görünümü</TabsTrigger>
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
                transactions={incomes.filter(income => {
                  // Bir ay öncesini hesapla
                  const today = new Date();
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(today.getMonth() - 1);
                  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
                  
                  // Sadece bir aydan yeni gelirleri göster
                  return income.date >= oneMonthAgoStr;
                })}
                isLoading={isLoading}
                onDelete={(id) => handleDeleteTransaction(id, 'income')}
                onEdit={(id, data) => handleEditTransaction(id, 'income', data)}
              />
              <TransactionList 
                type="expense" 
                transactions={expenses.filter(expense => {
                  // Bir ay öncesini hesapla
                  const today = new Date();
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(today.getMonth() - 1);
                  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];
                  
                  // Sadece bir aydan yeni giderleri göster
                  return expense.date >= oneMonthAgoStr;
                })}
                isLoading={isLoading}
                onDelete={(id) => handleDeleteTransaction(id, 'expense')}
                onEdit={(id, data) => handleEditTransaction(id, 'expense', data)}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <h3 className="font-semibold mb-4">Takvim Görünümü</h3>
            <div className="calendar-container p-4 bg-white rounded-lg shadow">
              <Calendar
                className="w-full"
                value={selectedDate}
                onChange={(date) => {
                  // Tip olarak Date | Date[] olabileceği için kontrol ediyoruz
                  const selectedDate = Array.isArray(date) ? date[0] : date;
                  setSelectedDate(selectedDate);
                  
                  // Seçilen güne ait işlemleri bulma
                  if (selectedDate) {
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const dayIncomes = incomes.filter(income => income.date === dateStr);
                    const dayExpenses = expenses.filter(expense => expense.date === dateStr);
                    setSelectedDateTransactions({ incomes: dayIncomes, expenses: dayExpenses });
                  }
                }}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // O güne ait gelirler ve giderler
                    const dayIncomes = incomes.filter(income => income.date === dateStr);
                    const dayExpenses = expenses.filter(expense => expense.date === dateStr);
                    
                    const totalIncome = dayIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
                    const totalExpense = dayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
                    
                    // Eğer o gün için işlem varsa göster
                    if (dayIncomes.length > 0 || dayExpenses.length > 0) {
                      return (
                        <div className="text-xs">
                          {totalIncome > 0 && (
                            <div className="text-green-600">+{totalIncome.toFixed(2)} ₺</div>
                          )}
                          {totalExpense > 0 && (
                            <div className="text-red-600">-{totalExpense.toFixed(2)} ₺</div>
                          )}
                        </div>
                      );
                    }
                  }
                  return null;
                }}
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = date.toISOString().split('T')[0];
                    const hasIncome = incomes.some(income => income.date === dateStr);
                    const hasExpense = expenses.some(expense => expense.date === dateStr);
                    
                    if (hasIncome && hasExpense) return 'bg-purple-100';
                    if (hasIncome) return 'bg-green-100';
                    if (hasExpense) return 'bg-red-100';
                  }
                  return '';
                }}
              />
            </div>
            
            {/* Seçilen güne ait işlemler */}
            {selectedDate && (
              <div className="mt-6 bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">
                  {selectedDate.toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })} Tarihindeki İşlemler
                </h4>
                
                {selectedDateTransactions.incomes.length === 0 && 
                 selectedDateTransactions.expenses.length === 0 ? (
                  <p className="text-gray-500 text-sm">Bu tarihte herhangi bir işlem bulunmamaktadır.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Gelirler */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-green-600">Gelirler</h5>
                      {selectedDateTransactions.incomes.length === 0 ? (
                        <p className="text-gray-500 text-xs">Gelir bulunmamaktadır.</p>
                      ) : (
                        <ul className="space-y-2">
                          {selectedDateTransactions.incomes.map(income => (
                            <li key={income.id} className="p-2 bg-green-50 rounded text-sm">
                              <div className="flex justify-between">
                                <span>{income.name}</span>
                                <span className="font-medium text-green-600">{Number(income.amount).toFixed(2)} ₺</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {/* Giderler */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-red-600">Giderler</h5>
                      {selectedDateTransactions.expenses.length === 0 ? (
                        <p className="text-gray-500 text-xs">Gider bulunmamaktadır.</p>
                      ) : (
                        <ul className="space-y-2">
                          {selectedDateTransactions.expenses.map(expense => (
                            <li key={expense.id} className="p-2 bg-red-50 rounded text-sm">
                              <div className="flex justify-between">
                                <span>{expense.name}</span>
                                <span className="font-medium text-red-600">{Number(expense.amount).toFixed(2)} ₺</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 grid gap-4">
              <div className="p-3 rounded-lg bg-gray-100">
                <h4 className="font-medium text-sm mb-2">Renk Açıklamaları:</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100"></div>
                    <span className="text-sm">Gelir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100"></div>
                    <span className="text-sm">Gider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-100"></div>
                    <span className="text-sm">Gelir & Gider</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
