import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStoreData } from "@/hooks/use-store-data";
import { Icons } from "@/components/icons";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { ProductForm } from "./components/ProductForm";
import { ProductTable } from "./components/ProductTable";

// Mock categories (can be replaced with Supabase categories if needed)
const mockCategories = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Clothing" },
  { id: "cat3", name: "Groceries" },
  { id: "cat4", name: "Home & Kitchen" },
  { id: "cat5", name: "Beauty & Personal Care" },
];

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { products, addProduct, updateProduct, fetchAllData } = useStoreData();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    threshold: 0,
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (["price", "stock", "threshold"].includes(name)) {
      parsedValue = value === "" ? 0 : parseFloat(value);
    }
    
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      stock: 0,
      threshold: 0,
    });
    setEditingProductId(null);
  };

  const handleSubmit = async (formData: Partial<Product>, editingProductId: string | null) => {
    if (editingProductId) {
      await updateProduct(editingProductId, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        threshold: formData.threshold,
      });
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      await addProduct({
        name: formData.name || "",
        description: formData.description || "",
        category: formData.category || "",
        price: formData.price || 0,
        stock: formData.stock || 0,
        threshold: formData.threshold || 0,
        image: "",
      });
      toast({
        title: "Product Added",
        description: `${formData.name} has been added to inventory.`,
      });
    }
    await fetchAllData();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      threshold: product.threshold,
    });
    setEditingProductId(product.id);
    setIsAddProductOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((product) => product.id !== productId);
      await fetchAllData();
      toast({
        title: "Product Deleted",
        description: "The product has been removed from inventory.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your products and inventory levels
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setIsAddProductOpen(true)}>
            <Icons.add className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <ProductForm
            open={isAddProductOpen}
            onOpenChange={setIsAddProductOpen}
            onSubmit={handleSubmit}
            isEditing={!!editingProductId}
            formData={formData}
            setFormData={setFormData}
            editingProductId={editingProductId}
            categories={mockCategories}
            resetForm={resetForm}
          />
        </div>
        
        <ProductTable
          products={products}
          filteredProducts={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
