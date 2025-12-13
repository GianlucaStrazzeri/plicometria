export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia" | "otro";

export type Payment = {
  id: string;
  client?: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  date: string; // ISO
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO
  note?: string;
};
