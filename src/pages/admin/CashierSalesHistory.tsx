import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Chart imports (already available in the project)
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Sale = {
  id: string;
  total_amount: number;
  timestamp: string;
};

export default function CashierSalesHistory() {
  const { cashierId } = useParams<{ cashierId: string }>();
  const navigate = useNavigate();

  const [sales, setSales] = React.useState<Sale[]>([]);
  const [cashier, setCashier] = React.useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Compute daily sales for this cashier (array of { date, value })
  const salesOverTime = React.useMemo(() => {
    const byDay: Record<string, number> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
      byDay[date] = (byDay[date] || 0) + Number(sale.total_amount);
    });
    // Sort dates ascending
    return Object.entries(byDay)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch cashier info
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("name,email")
        .eq("id", cashierId)
        .maybeSingle();

      if (userError || !user) {
        toast({
          title: "Error",
          description: "Could not fetch cashier info.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setCashier(user);

      // Fetch that cashier's sales
      const { data: cashierSales, error: salesError } = await supabase
        .from("sales")
        .select("id,total_amount,timestamp")
        .eq("cashier_id", cashierId)
        .order("timestamp", { ascending: false });

      if (salesError) {
        toast({
          title: "Error",
          description: "Could not fetch sales.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setSales(cashierSales || []);
      setLoading(false);
    }
    fetchData();
  }, [cashierId]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="p-6 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/cashiers")}
          className="mb-4"
        >
          &larr; Back
        </Button>
        <h2 className="text-xl font-semibold mb-2">Sales History</h2>
        {cashier && (
          <div className="mb-4">
            <div className="font-medium">{cashier.name}</div>
            <div className="text-sm text-muted-foreground">{cashier.email}</div>
          </div>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-muted-foreground">No sales found for this cashier.</div>
        ) : (
          <>
            {/* Chart: Sales Overview */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Sales Overview</h3>
              <Card className="p-4">
                {salesOverTime.length > 0 ? (
                  <ChartContainer className="aspect-[4/2]" config={{}}>
                    <LineChart
                      data={salesOverTime}
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
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="text-xs text-muted-foreground">
                                  {new Date(payload[0].payload.date).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
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
                        stroke="#7E69AB"
                        strokeWidth={2}
                        dot={{ strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <p>No daily sales data available for this cashier.</p>
                  </div>
                )}
              </Card>
            </div>
            {/* Sales Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono">{sale.id}</TableCell>
                    <TableCell>{new Date(sale.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${Number(sale.total_amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>
    </div>
  );
}
