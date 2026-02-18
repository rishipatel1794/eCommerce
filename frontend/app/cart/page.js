"use client";
import Link  from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";


const cart = () => {
	const { cartItems, removeFromCart, addToCart } = useCart();
	const { role } = useAuth();

	const subtotal = cartItems.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0,
	);
	const shipping = subtotal > 100 ? 0 : 10;
	const total = subtotal + shipping;


	if (role === 'admin') {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">Cart not available for admins</h2>
					<p className="text-gray-600 mb-8">Please use a regular user account to manage a cart.</p>
				</div>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Your cart is empty
					</h2>
					<p className="text-gray-600 mb-8">
						Start shopping to add items to your cart
					</p>
					<Link
						href="/products"
						className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition"
					>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Shopping Cart
				</h1>

				<div className="grid lg:grid-cols-3 gap-8 mt-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 ">
						<div className="bg-white rounded-lg shadow-sm overflow-hidden">
							{cartItems.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-4 p-6 border-b last:border-b-0"
								>
									<img
										src={item.image || item.image_url}
										alt={item.name}
										className="w-24 h-24 object-cover rounded-lg"
									/>
									<div className="flex-1">
										<h3 className="font-semibold text-gray-900 mb-1">
											{item.name}
										</h3>
										<p className="text-gray-600">
											Rs. {item.price}
										</p>
									</div>
									<div className="flex items-center gap-4">
										<div className="flex items-center space-x-2">
											<button className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50" onClick={() => {
												addToCart(item, -1);
											}}>
												-
											</button>
											<span className="w-12 text-center">
												{item.quantity}
											</span>
											<button className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50" onClick={() => {
												addToCart(item, 1);
											}}>
												+
											</button>
										</div>
										<button className="text-red-600 hover:text-red-700 cursor-pointer" onClick={() => {
											removeFromCart(item.id);
										}}>
											<Trash2 className="h-5 w-5" />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
							<h2 className="text-xl font-bold mb-6">
								Order Summary
							</h2>
							<div className="space-y-3 mb-6">
								<div className="flex justify-between text-gray-600">
									<span>Subtotal</span>
									<span>Rs. {subtotal}</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>Shipping</span>
									<span>
										{shipping === 0
											? "Free"
											: `Rs. ${shipping}`}
									</span>
								</div>
								<div className="border-t pt-3 flex justify-between font-semibold text-lg">
									<span>Total</span>
									<span>Rs. {total}</span>
								</div>
							</div>
							<Link href="/checkout" className="w-full block bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition mb-4 text-center">
								Proceed to Checkout
							</Link>
							<Link
								href="/products"
								className="w-full block text-center bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
							>
								Continue Shopping
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default cart;
