import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useStoreData } from "@/hooks/use-store-data";
import { Icons } from "@/components/icons";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSales() {
  const { sales, products, isLoading } = useStoreData();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("all");

  // Filter sales based on search term and time range
  const filteredSales = sales.filter((sale) => {
    const searchMatch =
      searchTerm === "" ||
      sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (timeRange === "all") return searchMatch;
    
    const saleDate = new Date(sale.timestamp);
    const now = new Date();
    
    if (timeRange === "today") {
      return searchMatch && saleDate.toDateString() === now.toDateString();
    } else if (timeRange === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return searchMatch && saleDate >= weekAgo;
    } else if (timeRange === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return searchMatch && saleDate >= monthAgo;
    }
    
    return searchMatch;
  });

  // Calculate total sales amount
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Generate sales by category from actual sales data
  const productIdToCategory = products.reduce((acc, product) => {
    acc[product.id] = product.category;
    return acc;
  }, {} as Record<string, string>);
  const categorySalesMap: Record<string, number> = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const category = productIdToCategory[item.productId] || "Unknown";
      if (!categorySalesMap[category]) categorySalesMap[category] = 0;
      categorySalesMap[category] += item.total;
    });
  });
  const salesByCategory = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));

  // Generate sales by product from actual sales data
  const salesByProduct = products.map(product => {
    const quantity = sales.reduce((sum, sale) => {
      const saleItems = sale.items.filter(item => item.productId === product.id);
      return sum + saleItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    return { name: product.name, value: quantity };
  }).filter(item => item.value > 0).slice(0, 10); // Top 10 products
  
  // Bar chart colors
  const barColors = ["#9b87f5", "#7E69AB", "#6E59A5"];
  
  // Pie chart colors
  const pieColors = ["#9b87f5", "#7E69AB", "#6E59A5", "#F97316", "#0EA5E9"];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Icons.spinner className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2 text-muted-foreground">Loading sales data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analysis</h1>
          <p className="text-muted-foreground">
            View and analyze your sales data
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalesAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredSales.length} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
              <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${filteredSales.length ? (totalSalesAmount / filteredSales.length).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Icons.tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {salesByCategory.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                By sales volume
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="charts">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>By quantity sold</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <ChartContainer className="aspect-[4/3]" config={{}}>
                    <BarChart
                      data={salesByProduct}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-sm font-bold">{payload[0].payload.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Quantity sold: {payload[0].value}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="aspect-[4/3]" config={{}}>
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const value = Number(payload[0].value);
                            const totalCategorySales = salesByCategory.reduce((sum, cat) => sum + cat.value, 0);
                            const percentage = totalCategorySales > 0 ? ((value / totalCategorySales) * 100).toFixed(1) : "0";
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-sm font-bold">{payload[0].name}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${value.toFixed(2)} ({percentage}%)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Sales Transactions</CardTitle>
                    <CardDescription>
                      Showing {filteredSales.length} of {sales.length} transactions
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <div className="relative">
                      <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search transactions..."
                        className="pl-8 md:w-[200px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="md:w-[150px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Cashier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>
                            {format(new Date(sale.timestamp), "PPP p")}
                          </TableCell>
                          <TableCell>{sale.cashierName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {sale.items.slice(0, 2).map((item) => (
                                <div key={item.id} className="text-xs">
                                  {item.quantity}x {item.productName}
                                </div>
                              ))}
                              {sale.items.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{sale.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${sale.totalAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No transactions found. Try a different search or time period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
