
export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cashier";
  password: string; // In a real app, this would be hashed on the server
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  threshold: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  cashierId: string;
  cashierName: string;
  timestamp: string;
};

export type Category = {
  id: string;
  name: string;
};

export type ChartData = {
  name: string;
  value: number;
};

export type TimeSeriesData = {
  date: string;
  value: number;
};

export type StockAlert = {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: "warning" | "critical";
};
