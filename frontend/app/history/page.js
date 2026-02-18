"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Loading from "../loading";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function HistoryPage() {
	const [orders, setOrders] = useState([]);
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchOrderHistory();
	}, []);

	const fetchOrderHistory = async () => {
		try {
			const res = await api.get("/history");
			setOrders(res.data.histories || res.data || []);
		} catch (e) {
			toast.error(
				e.response?.data?.message ||
					e.message ||
					"Failed to load order history",
			);
		} finally {
			setLoading(false);
		}
	};

	const downloadInvoice = async (orderId) => {
		try {
			const response = await api.get(`/orders/${orderId}/invoice`, {
				responseType: "blob",
			});
			const blob = response.data;
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `invoice_${orderId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
		} catch (e) {
			toast.error(
				e.response?.data?.message ||
					e.message ||
					"Failed to download invoice",
			);
		}
	};

	if (loading) return <Loading />;

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-4">
						Please log in to view your orders
					</h2>
					<Link href="/login" className="text-indigo-600">
						Go to login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 min-h-screen bg-gray-50 m-5">
			<h1 className="text-3xl font-bold mb-6">Order History</h1>

			{orders.length === 0 ? (
				<p className="text-gray-600">No histories found.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full border-collapse border border-gray-300">
						<thead className="bg-gray-200">
							<tr>
								<th className="border p-3 text-left">
									Order ID
								</th>
								<th className="border p-3 text-left">Date</th>
								<th className="border p-3 text-left">Total</th>
								<th className="border p-3 text-left">Status</th>
								<th className="border p-3 text-left">Action</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((history) => (
								<tr
									key={history.id}
									className="hover:bg-gray-100"
								>
									<td className="border p-3">
										{history.order?.id ?? history.order_id}
									</td>
									<td className="border p-3">
										{new Date(
											history.created_at,
										).toLocaleDateString()}
									</td>
									<td className="border p-3">
										Rs. {history.order?.total}
									</td>
									<td className="border p-3">
										{history.status}
									</td>
									<td className="border p-3">
										<button
											onClick={() =>
												downloadInvoice(
													history.order?.id ??
														history.order_id,
												)
											}
											className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
										>
											Download Invoice
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
