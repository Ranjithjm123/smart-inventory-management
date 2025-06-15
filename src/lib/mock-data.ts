
import { Product, Sale, User, Category, StockAlert } from "@/types";
import { formatDistanceToNow } from "date-fns";

// Helper functions for generating mock data
const generateId = () => Math.random().toString(36).substring(2, 10);

const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@hypermart.com",
    role: "admin",
    password: "admin123", // In a real app, this would be hashed
  },
  {
    id: "cashier1",
    name: "John Cashier",
    email: "john@hypermart.com",
    role: "cashier",
    password: "cashier123",
  },
  {
    id: "cashier2",
    name: "Sarah Cashier",
    email: "sarah@hypermart.com",
    role: "cashier",
    password: "cashier123",
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Groceries" },
  { id: "cat3", name: "Clothing" },
  { id: "cat4", name: "Home & Kitchen" },
  { id: "cat5", name: "Beauty & Personal Care" },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "prod1",
    name: "Smartphone X",
    description: "Latest smartphone with high-end features",
    category: "Electronics",
    price: 899.99,
    stock: 25,
    threshold: 10,
    image: "https://placehold.co/200x200?text=Smartphone",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod2",
    name: "Laptop Pro",
    description: "Professional laptop for work and gaming",
    category: "Electronics",
    price: 1299.99,
    stock: 15,
    threshold: 5,
    image: "https://placehold.co/200x200?text=Laptop",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod3",
    name: "Organic Bananas",
    description: "Fresh organic bananas per bunch",
    category: "Groceries",
    price: 2.99,
    stock: 150,
    threshold: 30,
    image: "https://placehold.co/200x200?text=Bananas",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod4",
    name: "Men's T-Shirt",
    description: "Cotton t-shirt for men, various sizes",
    category: "Clothing",
    price: 19.99,
    stock: 80,
    threshold: 20,
    image: "https://placehold.co/200x200?text=T-Shirt",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod5",
    name: "Coffee Maker",
    description: "Automatic coffee maker for home use",
    category: "Home & Kitchen",
    price: 79.99,
    stock: 30,
    threshold: 8,
    image: "https://placehold.co/200x200?text=Coffee+Maker",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod6",
    name: "Facial Cleanser",
    description: "Gentle facial cleanser for all skin types",
    category: "Beauty & Personal Care",
    price: 14.99,
    stock: 60,
    threshold: 15,
    image: "https://placehold.co/200x200?text=Cleanser",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod7",
    name: "Wireless Earbuds",
    description: "Bluetooth earbuds with noise cancellation",
    category: "Electronics",
    price: 129.99,
    stock: 40,
    threshold: 12,
    image: "https://placehold.co/200x200?text=Earbuds",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod8",
    name: "Milk",
    description: "Fresh whole milk, 1 gallon",
    category: "Groceries",
    price: 3.49,
    stock: 100,
    threshold: 25,
    image: "https://placehold.co/200x200?text=Milk",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod9",
    name: "Women's Jeans",
    description: "Denim jeans for women, various sizes",
    category: "Clothing",
    price: 49.99,
    stock: 4,
    threshold: 15,
    image: "https://placehold.co/200x200?text=Jeans",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
  {
    id: "prod10",
    name: "Blender",
    description: "High-speed blender for smoothies and more",
    category: "Home & Kitchen",
    price: 59.99,
    stock: 20,
    threshold: 7,
    image: "https://placehold.co/200x200?text=Blender",
    createdAt: getRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 1)),
    updatedAt: getRandomDate(new Date(2023, 6, 1), new Date()),
  },
];

// Generate mock stock alerts
export const mockStockAlerts: StockAlert[] = mockProducts
  .filter(product => product.stock <= product.threshold)
  .map(product => ({
    id: generateId(),
    productId: product.id,
    productName: product.name,
    currentStock: product.stock,
    threshold: product.threshold,
    status: product.stock < product.threshold * 0.5 ? "critical" : "warning"
  }));

// Generate mock sales
export const mockSales: Sale[] = Array.from({ length: 30 }, (_, i) => {
  const items = Array.from(
    { length: getRandomInt(1, 4) },
    () => {
      const product = mockProducts[getRandomInt(0, mockProducts.length - 1)];
      const quantity = getRandomInt(1, 5);
      return {
        id: generateId(),
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        total: product.price * quantity
      };
    }
  );

  const cashier = mockUsers.filter(user => user.role === "cashier")[getRandomInt(0, 1)];
  
  return {
    id: generateId(),
    items,
    totalAmount: items.reduce((sum, item) => sum + item.total, 0),
    cashierId: cashier.id,
    cashierName: cashier.name,
    timestamp: getRandomDate(new Date(2023, 5, 1), new Date())
  };
});

// Generate sales by category data for pie chart
export const salesByCategory = mockCategories.map(category => {
  const products = mockProducts.filter(product => product.category === category.name);
  const productIds = products.map(product => product.id);
  
  let totalSales = 0;
  mockSales.forEach(sale => {
    sale.items.forEach(item => {
      if (productIds.includes(item.productId)) {
        totalSales += item.total;
      }
    });
  });
  
  return {
    name: category.name,
    value: parseFloat(totalSales.toFixed(2))
  };
});

// Generate sales by product data for bar chart (top 5 products)
export const salesByProduct = mockProducts.map(product => {
  let totalQuantity = 0;
  mockSales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.productId === product.id) {
        totalQuantity += item.quantity;
      }
    });
  });
  
  return {
    name: product.name,
    value: totalQuantity
  };
}).sort((a, b) => b.value - a.value).slice(0, 5);

// Generate time series data for sales over time
export const salesOverTime = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  
  let totalSales = 0;
  mockSales.forEach(sale => {
    const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
    if (saleDate === dateStr) {
      totalSales += sale.totalAmount;
    }
  });
  
  return {
    date: dateStr,
    value: parseFloat(totalSales.toFixed(2))
  };
}).reverse();

// Helper function to get relative time from now
export function getRelativeTime(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
