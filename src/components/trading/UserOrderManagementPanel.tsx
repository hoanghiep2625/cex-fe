"use client";

interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  price: string | number;
  quantity: string | number;
  filled: string | number;
  qty: string | number;
  filled_qty: string | number;
  remaining_qty: string | number;
  status: string;
  created_at: string;
  type?: string;
}

import { useState, useMemo } from "react";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import TabUnderline from "@/components/ui/TabUnderline";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import DateFilters from "@/components/layouts/DateFilters";
import {
  usePendingOrdersByUser,
  useAllOrdersByUser,
} from "@/hooks/useWebSocket";
import { formatPrice, formatQty } from "@/lib/formatters";

export default function UserOrderManagementPanel({ pair }: { pair: string }) {
  const [hideOtherPairs, setHideOtherPairs] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [optimisticallyRemovedOrders, setOptimisticallyRemovedOrders] =
    useState<Set<string>>(new Set());

  const symbolCode = hideOtherPairs ? pair.replace("_", "") : undefined;

  const { orders: wsPendingOrders } = usePendingOrdersByUser(symbolCode);

  // WebSocket: Tab "Lịch sử lệnh" - all orders (no status filter)
  // Create hook without statuses filter to get all orders
  const { orders: wsAllOrders } = useAllOrdersByUser(symbolCode);

  const { data: initialPendingOrders, isLoading: ordersLoading } = useQuery<
    Order[]
  >({
    queryKey: ["pendingOrders", symbolCode],
    queryFn: () => {
      const params: { statuses: string; symbol?: string } = {
        statuses: "NEW,PARTIALLY_FILLED",
      };
      if (symbolCode) params.symbol = symbolCode;
      return axiosInstance
        .get("/orders", { params })
        .then((r) => r.data?.data || []);
    },
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });

  const { data: initialAllOrders, isLoading: allOrdersLoading } = useQuery<
    Order[]
  >({
    queryKey: ["allOrders", symbolCode],
    queryFn: () => {
      const params: { symbol?: string } = {};
      if (symbolCode) params.symbol = symbolCode;
      return axiosInstance
        .get("/orders", { params })
        .then((r) => r.data?.data || []);
    },
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });

  const { data: initialTrades, isLoading: tradesLoading } = useQuery<
    Array<{
      id: string;
      symbol: string;
      price: string;
      quantity: string;
      quote_quantity: string;
      taker_side: string;
      takerSide?: string;
      liquidity?: string;
      created_at: string;
      time?: string;
      maker_fee?: string;
      taker_fee?: string;
    }>
  >({
    queryKey: ["myTrades", symbolCode],
    queryFn: () =>
      axiosInstance
        .get("/trades/my-trades")
        .then((r) => r.data?.data || r.data || []),
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
  });

  const pendingOrders = useMemo(() => {
    const ws = wsPendingOrders as Order[] | null;
    const source =
      Array.isArray(ws) && ws.length > 0
        ? ws
        : Array.isArray(initialPendingOrders)
        ? initialPendingOrders
        : [];
    return source.filter((order) => !optimisticallyRemovedOrders.has(order.id));
  }, [wsPendingOrders, initialPendingOrders, optimisticallyRemovedOrders]);

  const allOrders = useMemo(() => {
    const ws = wsAllOrders as Order[] | null;
    const source =
      Array.isArray(ws) && ws.length > 0
        ? ws
        : Array.isArray(initialAllOrders)
        ? initialAllOrders
        : [];
    return source.filter((order) => !optimisticallyRemovedOrders.has(order.id));
  }, [wsAllOrders, initialAllOrders, optimisticallyRemovedOrders]);

  const cancelOrder = useMutation({
    mutationFn: (orderId: string) =>
      axiosInstance.put(`/orders/${orderId}/cancel`),

    onMutate: async (orderId) => {
      setOptimisticallyRemovedOrders((prev) => new Set(prev).add(orderId));
      return { orderId };
    },

    onSuccess: (data, orderId) => {
      toast.success("Huỷ lệnh thành công");
      setTimeout(() => {
        setOptimisticallyRemovedOrders((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }, 1000);
    },

    onError: (error, orderId) => {
      // Rollback optimistic update nếu có lỗi
      setOptimisticallyRemovedOrders((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      toast.error("Huỷ lệnh thất bại");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-blue-500";
      case "PARTIALLY_FILLED":
        return "text-yellow-500";
      case "FILLED":
        return "text-green-500";
      case "CANCELED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Mới";
      case "PARTIALLY_FILLED":
        return "Khớp một phần";
      case "FILLED":
        return "Đã khớp";
      case "CANCELED":
        return "Đã huỷ";
      default:
        return status;
    }
  };
  const tabs = [
    { id: "orders", label: "Giao dịch đang chờ khớp lệnh" },
    { id: "history", label: "Lịch sử lệnh" },
    { id: "trades", label: "Lịch sử giao dịch" },
  ];

  return (
    <div className="dark:bg-[#181A20] bg-white relative rounded-[10px] min-h-[400px] mb-[30px] m-1">
      {authLoading ? (
        <div></div>
      ) : (
        <div>
          <div className="relative flex justify-between items-center p-4 pb-0 dark:border-b dark:border-gray-700 border-b border-gray-200">
            <ul className="dark:text-gray-400 text-gray-600 text-xs font-semibold flex gap-4">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <TabUnderline
                    className="text-xs font-semibold pb-3"
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </TabUnderline>
                </li>
              ))}
            </ul>
            <div className="absolute dark:text-white text-black text-xs flex gap-2 right-4 top-[15px]">
              <CustomCheckbox
                checked={hideOtherPairs}
                onChange={setHideOtherPairs}
                label="Ẩn các cặp tỉ giá khác"
              />
            </div>
          </div>
          <div className="dark:text-white text-black dark:bg-[#181A20] bg-white p-4 pt-2 min-h-[300px]">
            {activeTab === "orders" && (
              <div>
                {!isAuthenticated ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    <Link href="/login" className="text-yellow-500">
                      Đăng nhập
                    </Link>{" "}
                    hoặc{" "}
                    <Link href="/register" className="text-yellow-500">
                      Đăng ký
                    </Link>{" "}
                    để giao dịch.
                  </div>
                ) : ordersLoading ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    Đang tải...
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    Không có lệnh đang chờ khớp
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="dark:border-b dark:border-gray-700 border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                            Ngày giờ
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                            Cặp
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                            Loại
                          </th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                            Bên
                          </th>
                          <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                            Giá
                          </th>
                          <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                            Số lượng
                          </th>
                          <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                            Đã khớp
                          </th>
                          <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                            Còn lại
                          </th>
                          <th className="text-center py-2 px-2 text-gray-500 font-semibold">
                            Trạng thái
                          </th>
                          <th className="text-center py-2 px-2 text-gray-500 font-semibold">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="dark:border-b dark:border-gray-700 border-b border-gray-100 hover:dark:bg-gray-900 hover:bg-gray-50"
                          >
                            <td className="py-2 px-2">
                              {new Date(order.created_at).toLocaleString(
                                "vi-VN"
                              )}
                            </td>
                            <td className="py-2 px-2 font-semibold">
                              {order.symbol}
                            </td>
                            <td className="py-2 px-2">{order.type}</td>
                            <td
                              className={`py-2 px-2 font-semibold ${
                                order.side === "BUY"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {order.side === "BUY" ? "Mua" : "Bán"}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {formatPrice(order.price)}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {formatQty(order.qty)}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {formatQty(order.filled_qty)}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {formatQty(order.remaining_qty)}
                            </td>
                            <td
                              className={`py-2 px-2 text-center font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => cancelOrder.mutate(order.id)}
                                disabled={
                                  cancelOrder.isPending &&
                                  cancelOrder.variables === order.id
                                }
                                className={`inline-flex items-center justify-center p-1 rounded hover:dark:bg-gray-800 hover:bg-gray-100 transition ${
                                  cancelOrder.isPending &&
                                  cancelOrder.variables === order.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer text-red-500"
                                }`}
                                title="Huỷ lệnh"
                              >
                                {cancelOrder.isPending &&
                                cancelOrder.variables === order.id
                                  ? "Đang huỷ..."
                                  : "Huỷ lệnh"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-xs text-gray-500 mt-4 px-2 my-6">
                      Tổng: {pendingOrders.length} lệnh đang chờ
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "history" && (
              <div>
                {!isAuthenticated ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    <Link href="/login" className="text-yellow-500">
                      Đăng nhập
                    </Link>{" "}
                    hoặc{" "}
                    <Link href="/register" className="text-yellow-500">
                      Đăng ký
                    </Link>{" "}
                    để giao dịch.
                  </div>
                ) : allOrdersLoading ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    Đang tải...
                  </div>
                ) : (
                  <div>
                    <DateFilters />

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="dark:border-b dark:border-gray-700 border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Ngày giờ
                            </th>
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Cặp
                            </th>
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Loại
                            </th>
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Bên
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Giá
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Số lượng
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Đã khớp
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Còn lại
                            </th>
                            <th className="text-center py-2 px-2 text-gray-500 font-semibold">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="dark:border-b dark:border-gray-700 border-b border-gray-100 hover:dark:bg-gray-900 hover:bg-gray-50"
                            >
                              <td className="py-2 px-2">
                                {new Date(order.created_at).toLocaleString(
                                  "vi-VN"
                                )}
                              </td>
                              <td className="py-2 px-2 font-semibold">
                                {order.symbol}
                              </td>
                              <td className="py-2 px-2">{order.type}</td>
                              <td
                                className={`py-2 px-2 font-semibold ${
                                  order.side === "BUY"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {order.side === "BUY" ? "Mua" : "Bán"}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {formatPrice(order.price)}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {formatQty(order.qty)}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {formatQty(order.filled_qty)}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {formatQty(order.remaining_qty)}
                              </td>
                              <td
                                className={`py-2 px-2 text-center font-semibold ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(order.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {allOrders.length === 0 && (
                        <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                          Không có lệnh nào
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "trades" && (
              <div>
                {!isAuthenticated ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    <Link href="/login" className="text-yellow-500">
                      Đăng nhập
                    </Link>{" "}
                    hoặc{" "}
                    <Link href="/register" className="text-yellow-500">
                      Đăng ký
                    </Link>{" "}
                    để giao dịch.
                  </div>
                ) : tradesLoading ? (
                  <div className="text-center text-gray-500 mt-10 text-xs font-semibold">
                    Đang tải...
                  </div>
                ) : (
                  <div>
                    <DateFilters />

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="dark:border-b dark:border-gray-700 border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Ngày giờ
                            </th>
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Cặp
                            </th>
                            <th className="text-left py-2 px-2 text-gray-500 font-semibold">
                              Bên
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Giá
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Số lượng
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Tổng giá trị
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Loại flow
                            </th>
                            <th className="text-right py-2 px-2 text-gray-500 font-semibold">
                              Phí (%)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(initialTrades) &&
                          initialTrades.length > 0 ? (
                            initialTrades
                              .filter((trade) =>
                                hideOtherPairs
                                  ? trade.symbol === pair.replace("_", "")
                                  : true
                              )
                              .map((trade) => (
                                <tr
                                  key={trade.id}
                                  className="dark:border-b dark:border-gray-700 border-b border-gray-100 hover:dark:bg-gray-900 hover:bg-gray-50"
                                >
                                  <td className="py-2 px-2">
                                    {new Date(
                                      trade.created_at ||
                                        trade.time ||
                                        Date.now()
                                    ).toLocaleString("vi-VN")}
                                  </td>
                                  <td className="py-2 px-2 font-semibold">
                                    {trade.symbol}
                                  </td>
                                  <td
                                    className={`py-2 px-2 font-semibold ${
                                      trade.takerSide === "BUY"
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {trade.takerSide === "BUY" ? "Mua" : "Bán"}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {formatPrice(trade.price)}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {formatQty(trade.quantity)}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {formatPrice(trade.quote_quantity)}
                                  </td>
                                  <td className="py-2 px-2 text-right text-xs">
                                    <span
                                      className={
                                        trade.liquidity === "TAKER"
                                          ? "text-orange-500"
                                          : "text-blue-500"
                                      }
                                    >
                                      {trade.liquidity}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {trade.takerSide === "BUY"
                                      ? parseFloat(
                                          trade.taker_fee || "0"
                                        ).toFixed(4)
                                      : parseFloat(
                                          trade.maker_fee || "0"
                                        ).toFixed(4)}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-10 text-center">
                                <div className="text-center text-gray-500 text-xs font-semibold">
                                  Không có giao dịch nào
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {Array.isArray(initialTrades) &&
                        initialTrades.length > 0 && (
                          <div className="text-xs text-gray-500 mt-4 px-2 my-6">
                            Tổng: {initialTrades.length} giao dịch
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
