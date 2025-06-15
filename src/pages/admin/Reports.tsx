
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStoreData } from "@/hooks/use-store-data";
import type { Product, Sale, SaleItem } from "@/types";

// Utility functions for analytics
function calculateSalesByProduct(sales: Sale[], products: Product[]) {
  // Returns array: { id, name, value, category, price }
  const salesMap: {
    [productId: string]: { id: string; name: string; value: number }
  } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!salesMap[item.productId]) {
        salesMap[item.productId] = {
          id: item.productId,
          name: item.productName,
          value: 0
        };
      }
      salesMap[item.productId].value += item.quantity;
    });
  });
  return Object.values(salesMap).map(productSales => {
    const info = products.find(p => p.id === productSales.id);
    return {
      ...productSales,
      category: info?.category ?? "",
      price: info?.price ?? 0
    };
  });
}

function calculateSalesByCategory(sales: Sale[], products: Product[]) {
  // Returns [{ name, value }]
  const categoryMap: { [category: string]: number } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product?.category || "Unknown";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += item.total;
    });
  });
  return Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));
}

export default function AdminReports() {
  const [reportType, setReportType] = useState("inventory");
  const { products, sales, stockAlerts, isLoading } = useStoreData();

  // Compute report analytics with useMemo for performance
  const salesByProduct = useMemo(() => calculateSalesByProduct(sales, products), [sales, products]);
  const salesByCategory = useMemo(() => calculateSalesByCategory(sales, products), [sales, products]);

  // Top sellers calculation
  const topSellingProducts = [...salesByProduct].sort((a, b) => b.value - a.value).slice(0, 10);

  // Lowest selling products
  const lowestSellingProducts = [...salesByProduct].sort((a, b) => a.value - b.value).slice(0, 10);

  // Profit by product (simplified)
  const productsWithProfit = useMemo(() => {
    return products.map(product => {
      const salesData = salesByProduct.find(item => item.id === product.id);
      const quantitySold = salesData ? salesData.value : 0;
      const assumedCostPrice = product.price * 0.6; // simple margin assumption
      const profit = (product.price - assumedCostPrice) * quantitySold;
      const profitMargin = product.price > 0 ? ((product.price - assumedCostPrice) / product.price) * 100 : 0;
      return {
        ...product,
        quantitySold,
        profit,
        profitMargin
      };
    });
  }, [products, salesByProduct]);

  // Most profitable products
  const mostProfitableProducts = [...productsWithProfit].sort((a, b) => b.profit - a.profit).slice(0, 10);

  // Low stock report
  const lowStockProducts = useMemo(() => (
    products.filter(product => product.stock <= product.threshold)
      .sort((a, b) => (a.stock / a.threshold) - (b.stock / b.threshold))
  ), [products]);

  // Out of stock products
  const outOfStockProducts = useMemo(() => (
    products.filter(product => product.stock === 0)
  ), [products]);

  // Defensive render for slow load
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
          Loading reports...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view detailed reports for your inventory
          </p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Generate Report</h2>
              <p className="text-sm text-muted-foreground">Select a report type to view or export</p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="md:w-[250px]">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Status</SelectItem>
                  <SelectItem value="top-sellers">Top Selling Products</SelectItem>
                  <SelectItem value="low-sellers">Lowest Selling Products</SelectItem>
                  <SelectItem value="profitable">Most Profitable Products</SelectItem>
                  <SelectItem value="low-stock">Low Stock Alert</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" disabled>
                <Icons.fileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>

        {reportType === "inventory" && (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status Report</CardTitle>
              <CardDescription>Overall view of your current inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icons.package className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Total Products</h3>
                  </div>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                
                <div className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-warning/10 p-2">
                      <Icons.alertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <h3 className="font-semibold">Low Stock</h3>
                  </div>
                  <p className="text-3xl font-bold">{lowStockProducts.length}</p>
                </div>
                
                <div className="flex flex-col gap-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-destructive/10 p-2">
                      <Icons.x className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="font-semibold">Out of Stock</h3>
                  </div>
                  <p className="text-3xl font-bold">{outOfStockProducts.length}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">In Stock Value</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByCategory.map((category) => {
                      const categoryProducts = products.filter(
                        (product) => product.category === category.name
                      );
                      const totalValue = categoryProducts.reduce(
                        (sum, product) => sum + product.price * product.stock,
                        0
                      );
                      const avgPrice = categoryProducts.length
                        ? categoryProducts.reduce((sum, product) => sum + product.price, 0) / categoryProducts.length
                        : 0;
                      
                      return (
                        <TableRow key={category.name}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-right">{categoryProducts.length}</TableCell>
                          <TableCell className="text-right">${totalValue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${avgPrice.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "top-sellers" && (
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with the highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingProducts.length > 0 ? (
                    topSellingProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.value}</TableCell>
                        <TableCell className="text-right">
                          ${(Number(product.price) * product.value).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "low-sellers" && (
          <Card>
            <CardHeader>
              <CardTitle>Lowest Selling Products</CardTitle>
              <CardDescription>Products with the lowest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowestSellingProducts.length > 0 ? (
                    lowestSellingProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.value}</TableCell>
                        <TableCell className="text-right">
                          ${(Number(product.price) * product.value).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "profitable" && (
          <Card>
            <CardHeader>
              <CardTitle>Most Profitable Products</CardTitle>
              <CardDescription>Products with the highest profit margins</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Sell Price</TableHead>
                    <TableHead className="text-right">Profit Margin</TableHead>
                    <TableHead className="text-right">Total Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostProfitableProducts.length > 0 ? (
                    mostProfitableProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.profitMargin.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">${product.profit.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No sales data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "low-stock" && (
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Report</CardTitle>
              <CardDescription>Products that need to be restocked</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Action Needed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell className="text-right">{product.threshold}</TableCell>
                        <TableCell className="text-right">
                          {product.stock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : product.stock <= product.threshold * 0.5 ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : (
                            <Badge variant="outline" className="border-warning text-warning">
                              Low
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.stock === 0 ? "Order immediately" : "Restock soon"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No low stock products found. Your inventory is healthy!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
