import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { searchStocks, placeOrder } from "@/lib/api";
import { useRealTimePrice } from "@/hooks/use-real-time-price";
import { queryClient } from "@/lib/queryClient";
import { ArrowUp, ArrowDown, ShoppingCart } from "lucide-react";

const orderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  exchange: z.enum(["NSE", "BSE"]),
  orderType: z.enum(["BUY", "SELL"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  limitPrice: z.number().min(0.01, "Limit price must be greater than 0"),
  takeProfitType: z.enum(["PERCENTAGE", "ABSOLUTE"]).nullish(),
  takeProfitValue: z.number().nullish(),
  stopLossType: z.enum(["PERCENTAGE", "ABSOLUTE"]).nullish(),
  stopLossValue: z.number().nullish(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function TradingPanel() {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedExchange, setSelectedExchange] = useState<"NSE" | "BSE">("NSE");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      symbol: "",
      exchange: "NSE",
      orderType: "BUY",
      quantity: 1,
      limitPrice: 0,
      takeProfitType: "PERCENTAGE",
      takeProfitValue: 0,
      stopLossType: "PERCENTAGE",
      stopLossValue: 0,
    },
  });

  // Search stocks query
  const { data: searchResults } = useQuery({
    queryKey: ["/api/stocks/search", searchQuery],
    queryFn: () => searchStocks(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Real-time price for selected stock
  const { data: priceData, isLoading: priceLoading } = useRealTimePrice(
    selectedSymbol,
    selectedExchange,
    !!selectedSymbol
  );

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    placeOrderMutation.mutate(data);
  };

  const handleStockSelect = (symbol: string, exchange: string) => {
    setSelectedSymbol(symbol);
    setSelectedExchange(exchange as "NSE" | "BSE");
    form.setValue("symbol", symbol);
    form.setValue("exchange", exchange as "NSE" | "BSE");
    setSearchQuery("");
    
    // Set limit price to current price if available
    if (priceData) {
      form.setValue("limitPrice", priceData.currentPrice);
    }
  };

  const estimatedCost = form.watch("quantity") * form.watch("limitPrice");

  return (
    <div className="space-y-6">
      {/* Stock Selection and Live Price */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Stock Selection & Live Price
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exchange">Exchange</Label>
              <Select value={selectedExchange} onValueChange={(value: "NSE" | "BSE") => setSelectedExchange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NSE">NSE</SelectItem>
                  <SelectItem value="BSE">BSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                placeholder="Search stocks (e.g., RELIANCE, TCS)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((stock: any) => (
                    <div
                      key={`${stock.symbol}-${stock.exchange}`}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleStockSelect(stock.symbol, stock.exchange)}
                    >
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-600">{stock.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Price Display */}
          {selectedSymbol && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedSymbol}</h3>
                  <p className="text-sm text-gray-600">
                    {searchResults?.find((s: any) => s.symbol === selectedSymbol)?.name}
                  </p>
                </div>
                <div className="text-right">
                  {priceLoading ? (
                    <div className="text-2xl font-bold">Loading...</div>
                  ) : priceData ? (
                    <>
                      <div className="text-2xl font-bold">₹{priceData.currentPrice.toFixed(2)}</div>
                      <div className="flex items-center text-sm">
                        {priceData.change >= 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={priceData.change >= 0 ? "text-green-500" : "text-red-500"}>
                          {priceData.change >= 0 ? "+" : ""}
                          {priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">No data</div>
                  )}
                </div>
              </div>
              {priceData && (
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Open:</span>
                    <span className="ml-2 font-medium">₹{priceData.dayOpen.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">High:</span>
                    <span className="ml-2 font-medium">₹{priceData.dayHigh.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Low:</span>
                    <span className="ml-2 font-medium">₹{priceData.dayLow.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Placement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BUY">Buy</SelectItem>
                          <SelectItem value="SELL">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="limitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Order Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Trigger price for order execution"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Take Profit</Label>
                  <div className="flex">
                    <FormField
                      control={form.control}
                      name="takeProfitType"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value || "PERCENTAGE"}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">%</SelectItem>
                            <SelectItem value="ABSOLUTE">₹</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="takeProfitValue"
                      render={({ field }) => (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="flex-1 ml-1"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Stop Loss</Label>
                  <div className="flex">
                    <FormField
                      control={form.control}
                      name="stopLossType"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value || "PERCENTAGE"}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">%</SelectItem>
                            <SelectItem value="ABSOLUTE">₹</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stopLossValue"
                      render={({ field }) => (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="flex-1 ml-1"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {estimatedCost > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-mono font-semibold">₹{estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={placeOrderMutation.isPending || !selectedSymbol}
              >
                {placeOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
