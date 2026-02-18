"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart, Star, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function Product() {
	const { id } = useParams();
	const { products } = useProducts();
	const [quantity, setQuantity] = useState(1);
	const { addToCart } = useCart();
	const { role } = useAuth();
	const product = products.find((p) => p.id === parseInt(id || "0"));

	if (!product) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">
						Product not found
					</h2>
					<Link
						href="/products"
						className="text-indigo-600 hover:text-indigo-700"
					>
						Back to products
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Link
					href="/products"
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
				>
					<ArrowLeft className="h-5 w-5 mr-2" />
					Back to products
				</Link>

				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					<div className="grid md:grid-cols-2 gap-8 p-8">
						{/* Product Image */}
						<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
							<img
								src={product.image_url || product.image}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
						</div>

						{/* Product Info */}
						<div>
							<p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
								{product.category}
							</p>
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								{product.name}
							</h1>

							<div className="flex items-center mb-4">
								<div className="flex items-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-5 w-5 ${
												i < product.rating
													? "text-yellow-400 fill-yellow-400"
													: "text-gray-300"
											}`}
										/>
									))}
								</div>
								<span className="ml-2 text-gray-600">
									({product.rating} stars)
								</span>
							</div>

							<p className="text-3xl font-bold text-gray-900 mb-6">
								Rs. {product.price}
							</p>

							<p className="text-gray-700 mb-6">
								{product.description}
							</p>

							<div className="mb-6">
								<h3 className="font-semibold mb-3">
									Key Features:
								</h3>
								<ul className="space-y-2">
									{product.features.map((feature, index) => (
										<li
											key={index}
											className="flex items-start"
										>
											<span className="text-indigo-600 mr-2">
												✓
											</span>
											<span className="text-gray-700">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</div>

							<div className="mb-6">
								<label className="block text-sm font-medium mb-2">
									Quantity
								</label>
								<div className="flex items-center space-x-4">
									<button
										onClick={() =>
											setQuantity(
												Math.max(1, quantity - 1),
											)
										}
										className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										-
									</button>
									<span className="text-xl font-semibold">
										{quantity}
									</span>
									<button
										onClick={() =>
											setQuantity(quantity + 1)
										}
										className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										+
									</button>
								</div>
							</div>

													<button
														onClick={() => {
															if (role === "admin") {
																toast.error("Admins cannot use cart");
																return;
															}
															addToCart(product, quantity);
															toast.success("Product added to cart!");
														}}
														className={`w-full bg-indigo-600 text-white py-4 rounded-lg ${role === 'admin' ? 'opacity-50 cursor-not-allowed hover:bg-indigo-600' : 'hover:bg-indigo-700'} transition flex items-center justify-center space-x-2 mb-4 cursor-pointer`}
														disabled={role === 'admin'}
													>
														<ShoppingCart className="h-5 w-5" />
														<span>Add to Cart</span>
													</button>

							<div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
								<div className="flex items-start space-x-3">
									<Truck className="h-6 w-6 text-indigo-600 shrink-0" />
									<div>
										<p className="font-medium">
											Free Shipping
										</p>
										<p className="text-sm text-gray-600">
											On orders over $50
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<RotateCcw className="h-6 w-6 text-indigo-600 shrink-0" />
									<div>
										<p className="font-medium">
											Easy Returns
										</p>
										<p className="text-sm text-gray-600">
											30-day return policy
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
