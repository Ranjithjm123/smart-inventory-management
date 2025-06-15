
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useAddCashierDialog() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isAdding, setIsAdding] = useState(false);

  const onChange = (field: "name" | "email" | "password", value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const reset = () => setForm({ name: "", email: "", password: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const { error } = await supabase.from("users").insert([
        {
          name: form.name,
          email: form.email,
          role: "cashier",
          password: form.password,
        },
      ]);
      if (error) throw error;
      toast({
        title: "Cashier Added",
        description: `${form.name} has been added as a cashier.`,
      });
      setShow(false);
      reset();
    } catch (error: any) {
      toast({
        title: "Error Adding Cashier",
        description: error.message || "Failed to add cashier",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return {
    show,
    setShow,
    form,
    onChange,
    handleAdd,
    isAdding,
    reset,
  };
}
