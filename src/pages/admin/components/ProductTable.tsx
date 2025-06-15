
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Product } from "@/types";

type Props = {
  products: Product[];
  filteredProducts: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
};

export function ProductTable({
  products,
  filteredProducts,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Inventory</CardTitle>
        <CardDescription>
          Showing {filteredProducts.length} of {products.length} products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      {product.name}
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock} units
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock <= product.threshold * 0.5 ? (
                      <Badge variant="destructive">Critical</Badge>
                    ) : product.stock <= product.threshold ? (
                      <Badge variant="outline" className="border-warning text-warning">
                        Low
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-success text-success">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Icons.edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product.id)}
                      >
                        <Icons.trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No products found. Try a different search or add a new product.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
