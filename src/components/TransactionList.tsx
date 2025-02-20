
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, ShoppingCart, Trash2 } from "lucide-react";
import { Transaction } from "@/types/database.types";
import { EditTransactionDialog } from "./EditTransactionDialog";

interface TransactionListProps {
  type: "income" | "expense";
  transactions: Transaction[];
  isLoading?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { name: string; amount: number; date: string }) => void;
}

export const TransactionList = ({ 
  type, 
  transactions, 
  isLoading = false, 
  onDelete,
  onEdit 
}: TransactionListProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {type === "income" ? "Income" : "Expenses"}
        </CardTitle>
        {type === "income" ? (
          <HandCoins className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No {type === "income" ? "income" : "expenses"} recorded yet
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold ${
                      type === "income" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {type === "income" ? "+" : "-"}$
                    {Number(transaction.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <EditTransactionDialog 
                    transaction={transaction}
                    onEdit={onEdit}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
