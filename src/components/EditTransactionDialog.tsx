import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/types/database.types";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Tutar pozitif bir sayı olmalıdır",
  }),
  date: z.string().min(1, "Tarih gereklidir"),
});

interface EditTransactionDialogProps {
  transaction: Transaction;
  onEdit: (id: string, data: { name: string; amount: number; date: string }) => void;
}

// Yardımcı fonksiyon - saat dilimi sorunlarını önler
const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const EditTransactionDialog = ({ transaction, onEdit }: EditTransactionDialogProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: transaction.name,
      amount: String(transaction.amount),
      date: transaction.date,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onEdit(transaction.id, {
      name: values.name,
      amount: Number(values.amount),
      date: values.date,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>İşlemi Düzenle</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İsim</FormLabel>
                  <FormControl>
                    <Input placeholder="İsim girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tutar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Tutar girin"
                      step="0.01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarih</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Değişiklikleri Kaydet
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
