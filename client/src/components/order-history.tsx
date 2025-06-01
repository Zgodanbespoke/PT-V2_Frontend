import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchOrders } from "@/lib/api";
import { History } from "lucide-react";

export default function OrderHistory() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Time</th>
                <th className="text-left py-2 font-medium">Symbol</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-left py-2 font-medium">Qty</th>
                <th className="text-left py-2 font-medium">Price</th>
                <th className="text-left py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 font-medium">{order.symbol}</td>
                    <td className="py-3">
                      <Badge variant={order.orderType === "BUY" ? "default" : "destructive"} className="text-xs">
                        {order.orderType}
                      </Badge>
                    </td>
                    <td className="py-3">{order.quantity}</td>
                    <td className="py-3 font-mono">
                      ₹{order.executedPrice ? parseFloat(order.executedPrice).toFixed(2) : parseFloat(order.limitPrice).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={
                          order.status === "EXECUTED" ? "default" : 
                          order.status === "CANCELLED" ? "destructive" : 
                          "secondary"
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
