import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { useStoreData } from "@/hooks/use-store-data";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import React from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { products, sales, stockAlerts, fetchAllData } = useStoreData();

  // Always reload data on mount or remount to reflect full persistent DB state
  React.useEffect(() => { fetchAllData(); }, []);

  const isAdmin = user?.role === "admin";

  // --- Filter sales by cashier user for cashiers, leave unfiltered for admin ---
  const filteredSales = React.useMemo(() => {
    if (isAdmin) return sales;
    if (!user?.id) return [];
    return sales.filter((sale) => sale.cashierId === user.id);
  }, [isAdmin, user?.id, sales]);

  // Calculate real-time analytics from filtered sales
  const analytics = React.useMemo(() => {
    const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProducts = products.length;
    const totalSalesCount = filteredSales.length;
    const lowStockCount = stockAlerts.length;
    const avgSaleValue = totalSalesCount > 0 ? totalSalesAmount / totalSalesCount : 0;

    // Build quick lookup from productId to category
    const productIdToCategory = products.reduce((acc, product) => {
      acc[product.id] = product.category;
      return acc;
    }, {} as Record<string, string>);

    // Build revenue by category using sale items (from filtered sales)
    const categorySalesMap: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const category = productIdToCategory[item.productId] || "Unknown";
        if (!categorySalesMap[category]) categorySalesMap[category] = 0;
        categorySalesMap[category] += item.total;
      });
    });
    const salesByCategory = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));

    // Calculate sales over time from filtered sales
    const salesOverTime = filteredSales.reduce((acc: any[], sale) => {
      const date = new Date(sale.timestamp).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.value += sale.totalAmount;
      } else {
        acc.push({ date, value: sale.totalAmount });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSalesAmount,
      totalProducts,
      totalSalesCount,
      lowStockCount,
      avgSaleValue,
      salesByCategory,
      salesOverTime
    };
  }, [filteredSales, products, stockAlerts]);

  // Chart colors
  const pieColors = ["#9b87f5", "#7E69AB", "#6E59A5", "#F97316", "#0EA5E9"];

  // Log analytics.salesByCategory for debugging
  console.log("Sales by Category analytics:", analytics.salesByCategory);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your Smart Inventory Management system.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalSalesAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {analytics.totalSalesCount} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Icons.package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                In your inventory
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Icons.alertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                Products below threshold
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sale Value</CardTitle>
              <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.avgSaleValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isAdmin && analytics.salesOverTime.length > 0 && (
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Daily sales from actual transactions</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ChartContainer className="aspect-[4/2]" config={{}}>
                  <LineChart
                    data={analytics.salesOverTime}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="text-xs text-muted-foreground">
                                {new Date(payload[0].payload.date).toLocaleDateString(undefined, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                              <div className="text-sm font-bold">${payload[0].value}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#9b87f5"
                      strokeWidth={2}
                      dot={{ strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue distribution from actual sales</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.salesByCategory.length > 0 ? (
                  <ChartContainer className="aspect-square" config={{}}>
                    <PieChart>
                      <Pie
                        data={analytics.salesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const v = payload[0].value;
                            const formattedValue =
                              typeof v === "number"
                                ? `$${v.toFixed(2)}`
                                : `$${Number(v).toFixed(2)}`;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-xs font-bold">{payload[0].name}</div>
                                <div className="text-sm">{formattedValue}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <p>
                      {products.length === 0 || sales.length === 0
                        ? "Waiting for sales or product data..."
                        : "No category sales available in database."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card className={isAdmin ? "lg:col-span-2" : "md:col-span-2"}>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.length > 0 ? (
                  stockAlerts.slice(0, 6).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-1 ${alert.status === "critical" ? "bg-destructive/20" : "bg-warning/20"}`}>
                          <Icons.alertTriangle className={`h-5 w-5 ${alert.status === "critical" ? "text-destructive" : "text-warning"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{alert.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {alert.currentStock} / Threshold: {alert.threshold}
                          </p>
                        </div>
                      </div>
                      <Badge variant={alert.status === "critical" ? "destructive" : "outline"} className="ml-auto">
                        {alert.status === "critical" ? "Critical" : "Warning"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <p>No low stock items to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {!isAdmin && (
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for cashiers</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <a href="/cashier/pos" className="flex items-center gap-2 rounded-md border border-input bg-background p-3 hover:bg-accent hover:text-accent-foreground">
                  <Icons.cart className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">New Sale</p>
                    <p className="text-xs text-muted-foreground">Create a new sales transaction</p>
                  </div>
                </a>
                <a href="/cashier/history" className="flex items-center gap-2 rounded-md border border-input bg-background p-3 hover:bg-accent hover:text-accent-foreground">
                  <Icons.history className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">View History</p>
                    <p className="text-xs text-muted-foreground">See your recent sales history</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
