
import { Product, SaleItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";

type ProductCatalogProps = {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  onAddToCart: (product: Product) => void;
};

export function ProductCatalog({ products, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, onAddToCart }: ProductCatalogProps) {
  // Filter products based on search term and category
  const filteredProducts = products.filter(
    (product) =>
      (searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || product.category === categoryFilter)
  );
  // Unique categories
  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
              Add products to the current transaction
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative">
              <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex justify-between">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="text-sm font-medium">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto pt-2">
                  <div className="text-xs">
                    {product.stock <= 0 ? (
                      <span className="text-destructive">Out of Stock</span>
                    ) : product.stock <= product.threshold ? (
                      <span className="text-warning">Low Stock: {product.stock}</span>
                    ) : (
                      <span>In Stock: {product.stock}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <Icons.add className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center py-8 text-muted-foreground">
              <p>No products found. Try a different search term or category.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
