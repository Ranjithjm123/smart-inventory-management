
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartSummary } from "./components/CartSummary";
import { CheckoutDialog } from "./components/CheckoutDialog";
import { ReceiptDialog } from "./components/ReceiptDialog";
import { useCart } from "./components/useCart";

export default function CashierPos() {
  const {
    filteredProducts,
    categories,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    cart,
    cartTotal,
    cartHasInvalidProducts,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleClearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    paymentAmount,
    setPaymentAmount,
    handleCheckout,
    handlePayment,
    receiptData,
    setReceiptData,
    isReceiptOpen,
    setIsReceiptOpen,
    products,
  } = useCart();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">
            Create a new sales transaction
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductCatalog
              products={products}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onAddToCart={handleAddToCart}
            />
          </div>
          <div>
            <CartSummary
              cart={cart}
              products={products}
              cartTotal={cartTotal}
              cartHasInvalidProducts={cartHasInvalidProducts}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartTotal={cartTotal}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        onPayment={handlePayment}
      />
      <ReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        receiptData={receiptData}
      />
    </DashboardLayout>
  );
}
