
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function CashierCount() {
  const [cashierCount, setCashierCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchCashierCount() {
      setLoading(true);
      const { count, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "cashier");
      if (!error) {
        setCashierCount(count ?? 0);
      }
      setLoading(false);
    }
    fetchCashierCount();
  }, []);

  return (
    <Button
      variant="link"
      className="p-0 h-auto min-h-0 text-xs text-blue-500 hover:underline"
      onClick={() => navigate("/admin/cashiers")}
      tabIndex={0}
      type="button"
      disabled={loading}
    >
      {loading
        ? "Cashiers: ..."
        : `Cashiers: ${cashierCount}`}
    </Button>
  );
}
