import type { AdminDashboardTopProduct } from '@/features/admin/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

type AdminTopProductsCardProps = {
  products: AdminDashboardTopProduct[];
};

export function AdminTopProductsCard({ products }: AdminTopProductsCardProps) {
  return (
    <Card className="border-border/70 bg-card/35 h-full">
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>
          Best revenue contributors in this period.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(product.unitPrice, {
                        maximumFractionDigits: 0,
                      })}{' '}
                      average unit
                    </p>
                  </TableCell>
                  <TableCell className="capitalize">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.unitsSold}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(product.revenue, {
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
