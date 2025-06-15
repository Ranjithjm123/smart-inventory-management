
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAddCashierDialog } from "./useAddCashier";

interface AddCashierDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddCashierDialog({ open, setOpen }: AddCashierDialogProps) {
  const {
    form,
    onChange,
    handleAdd,
    isAdding,
    reset,
  } = useAddCashierDialog();

  // Need to sync dialog's open state for proper control
  React.useEffect(() => {
    if (!open) reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Cashier</DialogTitle>
          <DialogDescription>
            Enter the details to create a new cashier account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">Full Name</Label>
            <Input
              id="add-name"
              value={form.name}
              onChange={e => onChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={form.email}
              onChange={e => onChange("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password">Password</Label>
            <Input
              id="add-password"
              type="password"
              value={form.password}
              onChange={e => onChange("password", e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isAdding} className="w-full">
              {isAdding ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Cashier"
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full" disabled={isAdding}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
