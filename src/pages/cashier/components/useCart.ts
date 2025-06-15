
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { useStoreData } from "@/hooks/use-store-data";
import { useAuth } from "@/lib/auth-context";
import { Product, SaleItem } from "@/types";

/**
 * Custom hook encapsulating all cart, payment, and sale logic for the POS page.
 */
export function useCart() {
  const { user } = useAuth();
  const { products, sales, updateProducts, addSale, fetchAllData } = useStoreData();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [receiptData, setReceiptData] = useState<{
    items: SaleItem[];
    total: number;
    payment: number;
    change: number;
    cashierName: string;
    timestamp: string;
  } | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      (searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || product.category === categoryFilter)
  );
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const cartWithInvalidProducts = cart.filter(
    (item) => !products.some((prod) => prod.id === item.productId)
  );
  const cartHasInvalidProducts = cartWithInvalidProducts.length > 0;

  // Cart Manipulation Logic
  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.productId === product.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const currentItem = updatedCart[existingItemIndex];
      if (currentItem.quantity >= product.stock) {
        toast({
          title: "Stock Limit Reached",
          description: `Only ${product.stock} units of ${product.name} are available.`,
          variant: "destructive",
        });
        return;
      }
      currentItem.quantity += 1;
      currentItem.total = currentItem.quantity * currentItem.price;
      setCart(updatedCart);
    } else {
      const newItem: SaleItem = {
        id: Math.random().toString(36).substring(2, 10),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
      };
      setCart([...cart, newItem]);
    }
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [cart]);

  const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number) => {
    const itemIndex = cart.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) return;

    const product = products.find(
      (p) => p.id === cart[itemIndex].productId
    );
    if (!product) return;

    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    if (newQuantity > product.stock) {
      toast({
        title: "Stock Limit",
        description: `Only ${product.stock} units of ${product.name} are available.`,
        variant: "destructive",
      });
      newQuantity = product.stock;
    }

    const updatedCart = [...cart];
    updatedCart[itemIndex] = {
      ...updatedCart[itemIndex],
      quantity: newQuantity,
      total: newQuantity * updatedCart[itemIndex].price,
    };
    setCart(updatedCart);
  }, [cart, products]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  }, [cart]);

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    if (window.confirm("Are you sure you want to clear the cart?")) {
      setCart([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    }
  }, [cart]);

  const handleCheckout = useCallback(() => {
    if (cartHasInvalidProducts) {
      toast({
        title: "Product Error",
        description: "Some items in your cart are no longer available in inventory. Please remove them before checkout.",
        variant: "destructive",
      });
      return;
    }
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }
    setIsCheckoutOpen(true);
  }, [cart, cartHasInvalidProducts]);

  // Sale/payment logic
  const handlePayment = useCallback(async () => {
    if (cartHasInvalidProducts) {
      toast({
        title: "Product Error",
        description: "Some items in your cart are no longer available in inventory. Please remove them before processing payment.",
        variant: "destructive",
      });
      setIsCheckoutOpen(false);
      return;
    }

    const payment = parseFloat(paymentAmount);

    if (isNaN(payment) || payment < cartTotal) {
      toast({
        title: "Invalid Payment",
        description: `Payment amount must be at least $${cartTotal.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }

    if (!user?.id || !user?.name) {
      toast({
        title: "Cashier Missing",
        description: "Cannot process sale: no cashier is signed in. Please log in.",
        variant: "destructive",
      });
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      toast({
        title: "Invalid Cashier ID",
        description: "The cashier's user ID is invalid. Please contact an admin.",
        variant: "destructive",
      });
      return;
    }

    const change = payment - cartTotal;

    try {
      const updatedProducts = [...products];
      cart.forEach((item) => {
        const productIndex = updatedProducts.findIndex(
          (p) => p.id === item.productId
        );
        if (productIndex >= 0) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            stock: updatedProducts[productIndex].stock - item.quantity,
          };
        }
      });
      await updateProducts(updatedProducts);

      const newSale = {
        items: [...cart],
        totalAmount: cartTotal,
        cashierId: user.id,
        cashierName: user.name,
        timestamp: new Date().toISOString(),
      };

      toast({
        title: "Processing Sale...",
        description: "Adding sale and sale items to the database. Please wait...",
      });
      const start = Date.now();
      await addSale(newSale);
      const elapsed = Date.now() - start;
      console.log("[handlePayment] addSale finished in ms:", elapsed);

      await fetchAllData();

      // Sale items check - must always have sale_items linked!
      const latestSale = sales.length > 0 ? sales[0] : null;
      if (latestSale) {
        console.log("[handlePayment] Last sale pulled from state:", latestSale);
        if (!latestSale.items || latestSale.items.length === 0) {
          console.warn("[handlePayment] WARNING: Last sale has NO items! The sale_items table may not have been updated correctly. Check Supabase.");
          toast({
            title: "Sale Items Not Recorded",
            description: "Sale record is missing items. Please check the database and browser console for errors.",
            variant: "destructive",
          });
        } else {
          console.log("[handlePayment] Sale items recorded successfully:", latestSale.items);
        }
      } else {
        console.warn("[handlePayment] WARNING: No latest sale found after sale!");
      }

      setReceiptData({
        items: [...cart],
        total: cartTotal,
        payment: payment,
        change: change,
        cashierName: user.name,
        timestamp: new Date().toISOString(),
      });
      setIsCheckoutOpen(false);
      setCart([]);
      setPaymentAmount("");
      toast({
        title: "Sale Completed",
        description: `Transaction for $${cartTotal.toFixed(2)} has been processed.`,
      });
      setIsReceiptOpen(true);
    } catch (error: any) {
      console.error("[handlePayment] Sale failed:", error, error?.message);
      toast({
        title: "Sale Failed",
        description: error?.message
          ? String(error.message)
          : "Could not complete the sale. See browser console for details.",
        variant: "destructive",
      });
    }
  }, [
    cart,
    cartHasInvalidProducts,
    cartTotal,
    paymentAmount,
    products,
    user?.id,
    user?.name,
    addSale,
    fetchAllData,
    sales,
    updateProducts
  ]);

  return {
    user,
    filteredProducts,
    categories,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    cart,
    setCart,
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
    products  // Pass so product list stays in sync
  };
}
