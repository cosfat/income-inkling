import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface NetWorthCardProps {
  netWorth: number;
}

export const NetWorthCard = ({ netWorth }: NetWorthCardProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Net Varlık</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {netWorth.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </div>
        <p className="text-xs text-muted-foreground">
          Toplam net varlığınız
        </p>
      </CardContent>
    </Card>
  );
};
