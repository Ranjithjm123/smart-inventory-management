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
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SaleItem } from "@/types";
import { useStoreData } from "@/hooks/use-store-data";

export default function CashierHistory() {
  const { user } = useAuth();
  const { sales } = useStoreData();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [selectedSale, setSelectedSale] = useState<{
    id: string;
    cashierName: string;
    timestamp: string;
    items: SaleItem[];
    totalAmount: number;
  } | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Identify if admin
  const isAdmin = user?.role === "admin";

  // Filter sales
  const filteredSales = sales
    .filter((sale) =>
      isAdmin
        ? true // admin can see all sales
        : sale.cashierId === user?.id // cashier only sees own
    )
    .filter((sale) => {
      const searchMatch =
        searchTerm === "" ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate total sales amount
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Calculate today's sales from filtered sales
  const todaysSales = sales.filter(
    (sale) =>
      (isAdmin ? true : sale.cashierId === user?.id) &&
      new Date(sale.timestamp).toDateString() === new Date().toDateString()
  );
  const todaysSalesAmount = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const handleViewReceipt = (sale: typeof selectedSale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
          <p className="text-muted-foreground">
            View your past sales transactions
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
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <Icons.calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${todaysSalesAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {todaysSales.length} transactions today
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Showing {filteredSales.length} transactions
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
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(sale)}
                        >
                          <Icons.eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
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
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Sale Receipt</DialogTitle>
            <DialogDescription>
              Transaction details
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="font-semibold">HyperMart</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedSale.timestamp), "PPpp")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Transaction ID: {selectedSale.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cashier: {selectedSale.cashierName}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                {selectedSale.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${selectedSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Thank you for shopping at HyperMart!
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
