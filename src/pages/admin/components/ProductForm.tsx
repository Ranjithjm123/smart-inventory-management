
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: Partial<Product>, editingProductId: string | null) => Promise<void>;
  isEditing: boolean;
  formData: Partial<Product>;
  setFormData: (data: Partial<Product>) => void;
  editingProductId: string | null;
  categories: { id: string; name: string }[];
  resetForm: () => void;
};

export function ProductForm({
  open,
  onOpenChange,
  onSubmit,
  isEditing,
  formData,
  setFormData,
  editingProductId,
  categories,
  resetForm,
}: Props) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit(formData, editingProductId);
            resetForm();
            onOpenChange(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the product details below."
                : "Fill in the product details to add to inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="threshold">
                  Threshold
                  <span
                    className="ml-1 inline-block text-xs text-muted-foreground"
                    title="Alert when stock reaches this level"
                  >
                    (Alert)
                  </span>
                </Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update Product" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
