"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import Loading from "../loading";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const res = await api.get("/orders");
        setOrders(res.data.orders || res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || e.message || "Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your orders</h2>
          <Link href="/login" className="text-indigo-600">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {loadingOrders && <div>Loading orders...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loadingOrders && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-700">You have no orders yet.</p>
            <Link href="/products" className="mt-4 inline-block text-indigo-600">Start shopping</Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{order.id}</div>
                  <div className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">Rs. {order.total}</div>
                  <div className="text-sm text-gray-600">{order.status}</div>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t pt-3 grid grid-cols-1 gap-2">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm text-gray-700">
                      <div>{it.product?.name || it.product_name || `Product #${it.product_id}`}</div>
                      <div>{it.quantity} × Rs. {it.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}