"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import Wallet from "./Wallet";

const Navbar = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { token, role, logout, coins } = useAuth();
	const { displayProducts } = useProducts();
	const [confirmLogout, setConfirmLogout] = useState(false);
	const { cartItems } = useCart();

	useEffect(() => {
		// Fetch products when component mounts
		const fetchProducts = async () => {
			const products = await displayProducts();
		};
		fetchProducts();

		if(role === "admin") {
			toast.info("Welcome Admin! You can manage your products in the Admin section.");
		}

	}, []);

	const handleLogout = async () => {
		const res = await logout();
		if (res.success) {
			toast.success("Logged out successfully!");
		} else {
			toast.error("Failed to logout. Please try again.");
		}
		setConfirmLogout(false);
	};

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			{confirmLogout && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6">
						<p className="text-lg font-semibold mb-4">
							Are you sure you want to logout?
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setConfirmLogout(false)}
								className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
							>
								Cancel
							</button>
							<button
								onClick={handleLogout}
								className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			)}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Link href="/" className="flex items-center space-x-2">
						<ShoppingCart className="h-8 w-8 text-indigo-600" />
						<span className="text-xl font-semibold text-gray-900">
							ShopHub
						</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-8">
						<Link
							href="/"
							className="text-gray-700 hover:text-indigo-600 transition"
						>
							Home
						</Link>
						<Link
							href="/products"
							className="text-gray-700 hover:text-indigo-600 transition"
						>
							Products
						</Link>
						{token && (
						<Link
							href="/admin"
							className="text-gray-700 hover:text-indigo-600 transition"
						>
							Admin
						</Link>
						)}

						{token && role !== "admin" && (
							<>
								<Link
									href="/orders"
									className="text-gray-700 hover:text-indigo-600 transition"
								>
									Orders
								</Link>

								<Link
									href="/history"
									className="text-gray-700 hover:text-indigo-600 transition"
								>
									History
								</Link>
								<Wallet />
							</>
						)}
						{role !== "admin" && (
							<Link
								href="/cart"
								className="text-gray-700 hover:text-indigo-600 transition relative"
							>
								<ShoppingCart className="h-5 w-5" />
								<span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
									{cartItems.length}
								</span>
							</Link>
						)}
						<div className="flex items-center space-x-4">
							{token ? (
								<div className="flex items-center space-x-2">
									<button
										onClick={() => setConfirmLogout(true)}
										className="text-gray-700 hover:text-indigo-600 transition flex items-center space-x-1"
									>
										<LogOut className="h-5 w-5" />
										<span>Logout</span>
									</button>
								</div>
							) : (
								<div className="flex items-center space-x-4">
									<Link
										href="/login"
										className="text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition space-x-2"
									>
										Login
									</Link>
									<Link
										href="/signup"
										className="text-white bg-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
									>
										Sign Up
									</Link>
								</div>
							)}
						</div>
					</nav>

					<button
						className="md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6 text-gray-700" />
						) : (
							<Menu className="h-6 w-6 text-gray-700" />
						)}
					</button>
				</div>

				{mobileMenuOpen && (
					<nav className="md:hidden pb-4 space-y-2">
						<Link
							href="/"
							className="block text-gray-700 hover:text-indigo-600 py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link
							href="/products"
							className="block text-gray-700 hover:text-indigo-600 py-2"
							onClick={() => setMobileMenuOpen(false)}
						>
							Products
						</Link>
						{role !== "admin" && (
							<>
								<Link
									href="/orders"
									className="block text-gray-700 hover:text-indigo-600 py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									Orders
								</Link>
								<Link
									href="/history"
									className="block text-gray-700 hover:text-indigo-600 py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									History
								</Link>

								<Link
									href="/cart"
									className="block text-gray-700 hover:text-indigo-600 py-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									Cart
								</Link>
								<Wallet />
							</>
						)}
						{token ? (
							<div className="flex items-center space-x-2">
								<button
									onClick={handleLogout}
									className="text-gray-700 hover:text-indigo-600 transition flex items-center space-x-1"
								>
									<LogOut className="h-5 w-5" />
									<span>Logout</span>
								</button>
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<Link
									href="/login"
									className="text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition space-x-2"
									onClick={() => setMobileMenuOpen(false)}
								>
									Login
								</Link>
								<Link
									href="/signup"
									className="text-white bg-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign Up
								</Link>
							</div>
						)}
					</nav>
				)}
			</div>
		</header>
	);
};

export default Navbar;
