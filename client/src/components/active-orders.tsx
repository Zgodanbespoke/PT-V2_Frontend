import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchActiveOrders, cancelOrder } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, X } from "lucide-react";

export default function ActiveOrders() {
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders/active"],
    queryFn: fetchActiveOrders,
    refetchInterval: 5000,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Cancel",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Orders ({orders?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!orders || orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No active orders</p>
          ) : (
            orders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{order.symbol}</span>
                    <Badge variant={order.orderType === "BUY" ? "default" : "destructive"}>
                      {order.orderType}
                    </Badge>
                  </div>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Qty:</span>
                    <span className="ml-1 font-medium">{order.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Limit:</span>
                    <span className="ml-1 font-medium">₹{parseFloat(order.limitPrice).toFixed(2)}</span>
                  </div>
                  {order.takeProfitValue && (
                    <div>
                      <span className="text-gray-600">TP:</span>
                      <span className="ml-1 font-medium">
                        {order.takeProfitType === "PERCENTAGE" ? `${order.takeProfitValue}%` : `₹${order.takeProfitValue}`}
                      </span>
                    </div>
                  )}
                  {order.stopLossValue && (
                    <div>
                      <span className="text-gray-600">SL:</span>
                      <span className="ml-1 font-medium">
                        {order.stopLossType === "PERCENTAGE" ? `${order.stopLossValue}%` : `₹${order.stopLossValue}`}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => cancelOrderMutation.mutate(order.id)}
                  disabled={cancelOrderMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel Order
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
