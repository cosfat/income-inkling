
export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
    };
  };
}
