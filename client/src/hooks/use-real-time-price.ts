import { useQuery } from "@tanstack/react-query";
import { fetchStockPrice } from "@/lib/api";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export function useRealTimePrice(symbol: string, exchange: string, enabled = true) {
  const query = useQuery({
    queryKey: ["/api/stocks", symbol, exchange, "price"],
    queryFn: () => fetchStockPrice(symbol, exchange),
    enabled: enabled && !!symbol && !!exchange,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // Always consider stale for real-time updates
  });

  useEffect(() => {
    if (!enabled || !symbol || !exchange) return;

    // Set up real-time price updates
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks", symbol, exchange, "price"]
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol, exchange, enabled]);

  return query;
}

export function useRealTimePrices(stocks: Array<{ symbol: string; exchange: string }>) {
  useEffect(() => {
    if (!stocks.length) return;

    const interval = setInterval(() => {
      stocks.forEach(({ symbol, exchange }) => {
        queryClient.invalidateQueries({
          queryKey: ["/api/stocks", symbol, exchange, "price"]
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [stocks]);
}
