import { apiRequest } from "./queryClient";

export async function fetchStocks() {
  const response = await apiRequest("GET", "/api/stocks");
  return response.json();
}

export async function searchStocks(query: string) {
  const response = await apiRequest("GET", `/api/stocks/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

export async function fetchStockPrice(symbol: string, exchange: string) {
  const response = await apiRequest("GET", `/api/stocks/${symbol}/${exchange}/price`);
  return response.json();
}

export async function placeOrder(orderData: any) {
  const response = await apiRequest("POST", "/api/orders", orderData);
  return response.json();
}

export async function fetchOrders() {
  const response = await apiRequest("GET", "/api/orders");
  return response.json();
}

export async function fetchActiveOrders() {
  const response = await apiRequest("GET", "/api/orders/active");
  return response.json();
}

export async function cancelOrder(orderId: number) {
  const response = await apiRequest("DELETE", `/api/orders/${orderId}`);
  return response.json();
}

export async function fetchPositions() {
  const response = await apiRequest("GET", "/api/positions");
  return response.json();
}

export async function fetchPortfolio() {
  const response = await apiRequest("GET", "/api/portfolio");
  return response.json();
}

export async function fetchTrades() {
  const response = await apiRequest("GET", "/api/trades");
  return response.json();
}
