
import { SaleItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type ReceiptDialogProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  receiptData: {
    items: SaleItem[];
    total: number;
    payment: number;
    change: number;
    cashierName: string;
    timestamp: string;
  } | null;
};

export function ReceiptDialog({ open, onOpenChange, receiptData }: ReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sale Receipt</DialogTitle>
          <DialogDescription>
            Transaction completed successfully.
          </DialogDescription>
        </DialogHeader>
        {receiptData && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="font-semibold">HyperMart</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(receiptData.timestamp).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Cashier: {receiptData.cashierName}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              {receiptData.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${receiptData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment</span>
                <span>${(receiptData.total + receiptData.change).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Change</span>
                <span>${receiptData.change.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Thank you for shopping at HyperMart!
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
