"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function CheckoutPage() {
	const { cartItems, checkOut } = useCart();
	const { coins, setCoin } = useAuth();

	const subtotal = cartItems.reduce(
		(acc, item) => acc + (Number(item.price) || 0) * item.quantity,
		0,
	);
	const shipping = subtotal > 100 ? 0 : 10;
	const total = subtotal + shipping;

	const handlePayWithCoins = async () => {
		if (coins < total) {
			toast.error(
				"You do not have enough coins to complete this purchase.",
			);
			return;
		}

		const res = await checkOut(cartItems);
		if (res && res.success) {
			// refresh coin balance from server
			if (setCoin) await setCoin();
			toast.success("Payment successful. Coins deducted.");
		} else {
			toast.error(res.message || "Payment failed.");
		}
	};

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">
						Your cart is empty
					</h2>
					<Link
						href="/products"
						className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
					>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">
					Checkout
				</h1>

				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">
						Order Summary
					</h2>
					<div className="space-y-3 mb-4">
						{cartItems.map((item) => (
							<div key={item.id} className="flex justify-between">
								<div>
									<div className="font-medium">
										{item.name}
									</div>
									<div className="text-sm text-gray-500">
										Qty: {item.quantity}
									</div>
								</div>
								<div className="font-medium">
									Rs. {item.price * item.quantity}
								</div>
							</div>
						))}
					</div>

					<div className="border-t pt-4">
						<div className="flex justify-between text-gray-600 mb-2">
							<span>Subtotal</span>
							<span>Rs. {subtotal}</span>
						</div>
						<div className="flex justify-between text-gray-600 mb-2">
							<span>Shipping</span>
							<span>
								{shipping === 0 ? "Free" : `Rs. ${shipping}`}
							</span>
						</div>
						<div className="flex justify-between font-semibold text-lg">
							<span>Total</span>
							<span>Rs. {total}</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 bg-white rounded-lg shadow p-6">
						<h3 className="font-semibold mb-3">Payment</h3>
						<p className="text-sm text-gray-600 mb-4">
							You can pay with your coin balance. 1 Coin = 1
							Rupee.
						</p>
						<div className="flex items-center justify-between mb-4">
							<span className="text-gray-700">Your Coins</span>
							<span className="font-semibold">
								{coins} Coins (Rs. {coins})
							</span>
						</div>
						<button
							onClick={handlePayWithCoins}
							className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
						>
							Pay with Coins
						</button>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="font-semibold mb-3">Summary</h3>
						<div className="flex justify-between text-gray-600">
							<span>Amount Due</span>
							<span className="font-semibold">Rs. {total}</span>
						</div>
						<div className="mt-4 text-sm text-gray-500">
							If your coins are insufficient a message will be
							shown.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
