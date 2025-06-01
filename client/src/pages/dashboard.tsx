import { useQuery } from "@tanstack/react-query";
import TradingPanel from "@/components/trading-panel";
import PortfolioSummary from "@/components/portfolio-summary";
import ActiveOrders from "@/components/active-orders";
import OrderHistory from "@/components/order-history";
import { fetchPortfolio } from "@/lib/api";
import { TrendingUp, DollarSign, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: portfolio } = useQuery({
    queryKey: ["/api/portfolio"],
    queryFn: fetchPortfolio,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold">PaperTrade Pro</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                  Dashboard
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Portfolio
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Orders
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Balance: ₹{portfolio ? portfolio.availableCash.toLocaleString() : "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Market Open</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Trading Dashboard</h2>
          <p className="text-gray-600">Manage your paper trading portfolio and place orders</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Trading Panel */}
          <div className="xl:col-span-2">
            <TradingPanel />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-6">
            <PortfolioSummary />
            <ActiveOrders />
            <OrderHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
