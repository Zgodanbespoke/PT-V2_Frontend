import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPortfolio } from "@/lib/api";
import { TrendingUp, TrendingDown, DollarSign, Briefcase } from "lucide-react";

export default function PortfolioSummary() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: fetchPortfolio,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Failed to load portfolio</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Portfolio Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold">₹{portfolio.totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              portfolio.totalPnL >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              {portfolio.totalPnL >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              ₹{Math.abs(portfolio.totalPnL).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total P&L</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Available Cash: ₹{portfolio.availableCash.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Holdings</h4>
          {portfolio.positions.length === 0 ? (
            <p className="text-gray-500 text-sm">No positions yet</p>
          ) : (
            portfolio.positions.map((position: any) => (
              <div key={`${position.symbol}-${position.exchange}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">{position.symbol}</div>
                  <div className="text-sm text-gray-600">{position.quantity} shares</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{position.currentValue.toLocaleString()}</div>
                  <div className={`text-sm ${
                    position.unrealizedPnL >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {position.unrealizedPnL >= 0 ? "+" : ""}₹{position.unrealizedPnL.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
