import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "İsim gereklidir"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Tutar pozitif bir sayı olmalıdır",
  }),
  date: z.string().min(1, "Tarih gereklidir"),
});

interface TransactionFormProps {
  type: "income" | "expense";
  onSubmit: (data: { name: string; amount: number; date: string }) => void;
}

// Yardımcı fonksiyon - saat dilimi sorunlarını önler
const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm = ({ type, onSubmit }: TransactionFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "",
      date: formatDateToYYYYMMDD(new Date()),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      name: values.name,
      amount: Number(values.amount),
      date: values.date,
    });
    form.reset();
    toast.success(`${type === "income" ? "Gelir" : "Gider"} başarıyla eklendi!`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input placeholder={`${type === "income" ? "Gelir" : "Gider"} ismi girin`} {...field} />
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
                <Input type="number" placeholder="Tutar girin" step="0.01" {...field} />
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
          {type === "income" ? "Gelir" : "Gider"} Ekle
        </Button>
      </form>
    </Form>
  );
};
