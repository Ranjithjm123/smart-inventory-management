
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  cartTotal: number;
  paymentAmount: string;
  setPaymentAmount: (v: string) => void;
  onPayment: () => void;
};

export function CheckoutDialog({
  open,
  onOpenChange,
  cartTotal,
  paymentAmount,
  setPaymentAmount,
  onPayment,
}: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>
            Enter payment amount to complete the transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="payment">Payment Amount</Label>
            <Input
              id="payment"
              type="number"
              min={cartTotal}
              step="0.01"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
          {parseFloat(paymentAmount) >= cartTotal && (
            <div className="flex justify-between text-sm">
              <span>Change:</span>
              <span>${(parseFloat(paymentAmount) - cartTotal).toFixed(2)}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onPayment}
            disabled={parseFloat(paymentAmount) < cartTotal}
          >
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
