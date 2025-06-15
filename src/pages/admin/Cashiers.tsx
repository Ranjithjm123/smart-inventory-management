import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/components/ui/use-toast";

type Cashier = { id: string; name: string; email: string; };
type CashierWithSales = Cashier & { totalSales: number; saleCount: number; };

export default function CashiersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cashiers, setCashiers] = React.useState<CashierWithSales[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCashiers() {
      setLoading(true);
      const { data: users, error } = await supabase
        .from("users")
        .select("id,name,email,role")
        .eq("role", "cashier");
      if (error) {
        toast({
          title: "Error",
          description: "Could not fetch cashiers",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("id,cashier_id,total_amount");
      if (salesError) {
        toast({
          title: "Error",
          description: "Could not fetch sales",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const salesByCashier = users.map((cashier: any) => {
        const theirSales = sales.filter((sale: any) => sale.cashier_id === cashier.id);
        const totalSales = theirSales.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0);
        return {
          id: cashier.id,
          name: cashier.name,
          email: cashier.email,
          saleCount: theirSales.length,
          totalSales,
        };
      });

      setCashiers(salesByCashier);
      setLoading(false);
    }
    fetchCashiers();
  }, []);

  if (user?.role !== "admin") {
    return (
      <Card className="max-w-xl mx-auto mt-12 p-6 text-center text-destructive">
        You do not have permission to view this page.
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Cashiers & Sales</h1>
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
      <Card className="p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right"># Sales</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashiers.map(cashier => (
                <TableRow
                  key={cashier.id}
                  className="cursor-pointer hover:bg-accent/70 transition"
                  onClick={() => navigate(`/admin/cashiers/${cashier.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <TableCell className="font-medium">{cashier.name}</TableCell>
                  <TableCell>{cashier.email}</TableCell>
                  <TableCell className="text-right">{cashier.saleCount}</TableCell>
                  <TableCell className="text-right">${cashier.totalSales.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
