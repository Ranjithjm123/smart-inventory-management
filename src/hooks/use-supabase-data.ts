import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Sale, StockAlert, User } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface SupabaseStoreState {
  products: Product[];
  sales: Sale[];
  stockAlerts: StockAlert[];
  users: User[];
  isLoading: boolean;
  updateProducts: (products: Product[]) => Promise<void>;
  updateSales: (sales: Sale[]) => Promise<void>;
  updateStockAlerts: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
}

export const useSupabaseData = (): SupabaseStoreState => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (productsError) throw productsError;
      
      // Transform Supabase data to match our types
      const transformedProducts: Product[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: Number(product.price),
        stock: product.stock,
        threshold: product.threshold,
        image: product.image || '',
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
      
      setProducts(transformedProducts);

      // Fetch sales with sale items
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .order('timestamp', { ascending: false });
      
      if (salesError) throw salesError;
      
      // Transform sales data
      const transformedSales: Sale[] = (salesData || []).map(sale => ({
        id: sale.id,
        items: (sale.sale_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total)
        })),
        totalAmount: Number(sale.total_amount),
        cashierId: sale.cashier_id,
        cashierName: sale.cashier_name,
        timestamp: sale.timestamp
      }));
      
      setSales(transformedSales);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (usersError) throw usersError;
      
      const transformedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'admin' | 'cashier',
        password: user.password
      }));
      
      setUsers(transformedUsers);

      // Calculate stock alerts from products
      await calculateStockAlerts(transformedProducts);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load data from database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new product
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          threshold: productData.threshold,
          image: productData.image
        }])
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category,
        price: Number(data.price),
        stock: data.stock,
        threshold: data.threshold,
        image: data.image || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setProducts(prev => [...prev, newProduct]);
      await calculateStockAlerts([...products, newProduct]);

      toast({
        title: "Product Added",
        description: `${productData.name} has been added to inventory.`,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error Adding Product",
        description: "Failed to add product to database.",
        variant: "destructive",
      });
    }
  };

  // Update a product
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          price: updates.price,
          stock: updates.stock,
          threshold: updates.threshold,
          image: updates.image,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category,
        price: Number(data.price),
        stock: data.stock,
        threshold: data.threshold,
        image: data.image || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      const updatedProducts = products.map(p => p.id === productId ? updatedProduct : p);
      setProducts(updatedProducts);
      await calculateStockAlerts(updatedProducts);

    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error Updating Product",
        description: "Failed to update product in database.",
        variant: "destructive",
      });
    }
  };

  // Add a new sale and update inventory
  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      // First, insert the sale in DB
      const { data: saleResult, error: saleError } = await supabase
        .from('sales')
        .insert([{
          total_amount: saleData.totalAmount,
          cashier_id: saleData.cashierId,
          cashier_name: saleData.cashierName,
          timestamp: saleData.timestamp
        }])
        .select()
        .single();

      if (saleError || !saleResult?.id) throw saleError || new Error("No sale ID returned");

      // Insert sale items for the new sale (sales.s-id, matching saleData.items).
      if (saleData.items.length === 0) throw new Error("Cannot record a sale with no items!");

      const saleItemsToInsert = saleData.items.map(item => ({
        sale_id: saleResult.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }));

      console.log("[addSale] Attempting to insert sale items:", saleItemsToInsert);

      const { error: itemsError, data: itemsData } = await supabase
        .from('sale_items')
        .insert(saleItemsToInsert);

      if (itemsError) {
        console.error("[addSale] Error inserting into sale_items:", itemsError, saleItemsToInsert);
        throw itemsError;
      } else {
        console.log("[addSale] Successfully inserted sale_items:", itemsData);
      }

      // Now update product stock
      for (const item of saleData.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }

      // Always sync all data after a completed sale
      await fetchAllData();

      toast({
        title: "Sale Completed",
        description: `Sale of $${saleData.totalAmount.toFixed(2)} processed successfully.`,
      });

    } catch (error) {
      console.error('Error processing sale/addSale:', error);
      toast({
        title: "Error Processing Sale",
        description: error?.message || "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate and update stock alerts
  const calculateStockAlerts = async (currentProducts: Product[]) => {
    const newStockAlerts: StockAlert[] = currentProducts
      .filter(product => product.stock <= product.threshold)
      .map(product => ({
        id: `alert-${product.id}`,
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold: product.threshold,
        status: product.stock <= product.threshold * 0.5 ? "critical" : "warning"
      }));
    
    setStockAlerts(newStockAlerts);
    
    // Update stock alerts in database
    try {
      // Clear existing alerts
      await supabase.from('stock_alerts').delete().neq('id', '');
      
      // Insert new alerts
      if (newStockAlerts.length > 0) {
        const alertsToInsert = newStockAlerts.map(alert => ({
          id: alert.id,
          product_id: alert.productId,
          product_name: alert.productName,
          current_stock: alert.currentStock,
          threshold: alert.threshold,
          status: alert.status
        }));
        
        await supabase.from('stock_alerts').insert(alertsToInsert);
      }
    } catch (error) {
      console.error('Error updating stock alerts:', error);
    }
  };

  // Updated updateProducts: performs in-place updates, not destructive table reset!
  const updateProducts = async (updatedProducts: Product[]) => {
    try {
      // Instead of delete/insert, do an UPDATE for each product
      for (const product of updatedProducts) {
        // Only update fields that change, but all fields are present in this workflow
        const { error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            threshold: product.threshold,
            image: product.image,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);
        if (error) throw error;
      }
      // Refresh state after updates
      await fetchAllData();
      await calculateStockAlerts(updatedProducts);
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error Updating Products",
        description: "Failed to update products in database.",
        variant: "destructive",
      });
    }
  };

  const updateSales = async (updatedSales: Sale[]) => {
    try {
      // ADDED: Prevent non-admin/legacy accidental wipes
      if (updatedSales.length === 0) {
        throw new Error("[updateSales] Refusing to clear all sales. Use this only for admin-level batch resets.");
      }
      // DELETE all sales safely (for uuid columns)
      const { error: deleteError } = await supabase.from('sales').delete().not('id', 'is', null);
      if (deleteError) throw deleteError;

      // Next, delete all sale_items associated with the sales
      const { error: deleteItemsError } = await supabase.from('sale_items').delete().not('id', 'is', null);
      if (deleteItemsError) throw deleteItemsError;

      // Now, re-insert the sales
      const { error: insertError } = await supabase.from('sales').insert(updatedSales.map(sale => ({
        id: sale.id,
        total_amount: sale.totalAmount,
        cashier_id: sale.cashierId,
        cashier_name: sale.cashierName,
        timestamp: sale.timestamp
      })));
      if (insertError) throw insertError;

      // Finally, re-insert the sale_items
      for (const sale of updatedSales) {
        const { error: insertItemsError } = await supabase.from('sale_items').insert(sale.items.map(item => ({
          id: item.id,
          sale_id: sale.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })));
        if (insertItemsError) throw insertItemsError;
      }

      // re-fetch to get real IDs
      await fetchAllData();

    } catch (error) {
      console.error('Error updating sales:', error);
      toast({
        title: "Error Updating Sales",
        description: "Failed to update sales in database.",
        variant: "destructive",
      });
    }
  };

  const updateStockAlerts = async () => {
    await calculateStockAlerts(products);
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    products,
    sales,
    stockAlerts,
    users,
    isLoading,
    updateProducts,
    updateSales,
    updateStockAlerts,
    fetchAllData,
    addProduct,
    updateProduct,
    addSale
  };
};
