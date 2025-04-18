import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface CurrentBalanceCardProps {
  balance: number;
}

export const CurrentBalanceCard = ({ balance }: CurrentBalanceCardProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mevcut Bakiye</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </div>
        <p className="text-xs text-muted-foreground">
          Bugüne kadarki bakiyeniz
        </p>
      </CardContent>
    </Card>
  );
};
