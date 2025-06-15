
import { SaleItem, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Icons } from "@/components/icons";

type CartSummaryProps = {
  cart: SaleItem[];
  products: Product[];
  cartTotal: number;
  cartHasInvalidProducts: boolean;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
};

export function CartSummary({
  cart,
  products,
  cartTotal,
  cartHasInvalidProducts,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
}: CartSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Current Transaction</CardTitle>
        <CardDescription>
          Items: {cart.length} | Total: ${cartTotal.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cartHasInvalidProducts && (
          <div className="mb-2 rounded border border-destructive bg-destructive/10 p-2 text-destructive text-xs">
            One or more items are no longer available in inventory. Please remove them from your cart!
          </div>
        )}
        {cart.length > 0 ? (
          <div className="space-y-4">
            {cart.map((item) => {
              const foundProduct = products.find((p) => p.id === item.productId);
              return (
                <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex justify-between">
                    <h3 className="font-medium">
                      {item.productName}
                      {!foundProduct && (
                        <span className="ml-2 font-semibold text-destructive text-xs">(Removed)</span>
                      )}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemoveFromCart(item.id)}
                    >
                      <Icons.trash className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={!foundProduct}
                      >
                        <Icons.minus className="h-3 w-3" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={!foundProduct}
                      >
                        <Icons.add className="h-3 w-3" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm">${item.price.toFixed(2)} ea</div>
                      <div className="font-medium">${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Icons.cart className="mb-2 h-10 w-10" />
            <p>Your cart is empty</p>
            <p className="text-xs">Add products from the catalog</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full justify-between font-semibold">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </Button>
          <Button
            className="flex-1"
            onClick={onCheckout}
            disabled={cart.length === 0 || cartHasInvalidProducts}
          >
            Checkout
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
