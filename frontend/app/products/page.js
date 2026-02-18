"use client";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { Search, SlidersHorizontal } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const categories = [
		"All",
		"Audio",
		"Electronics",
		"Wearables",
		"Computers",
		"Photography",
	];

const page = () => {
	const { products, displayProducts, loadMoreProducts, hasMore } = useProducts();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const filteredProducts = products.filter((product) => {
		const matchCategory =
			selectedCategory === "All" || product.category === selectedCategory;
		const matchSearch =
			searchQuery === "" ||
			product.name.toLowerCase().includes(searchQuery.toLowerCase());

		return matchCategory && matchSearch;
	});

	// incremental rendering to reduce DOM load
	const PAGE_SIZE = 30;
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const sentinelRef = useRef(null);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [searchQuery, selectedCategory]);

	// load first page on mount
	useEffect(() => {
		displayProducts(1, PAGE_SIZE);
	}, []);

	const displayedProducts = filteredProducts.slice(0, visibleCount);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						if (visibleCount < filteredProducts.length) {
							setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));
						} else if (hasMore) {
							await loadMoreProducts(PAGE_SIZE);
						}
					}
				});
			},
			{ root: null, rootMargin: "200px", threshold: 0.1 },
		);
		obs.observe(sentinelRef.current);
		return () => obs.disconnect();
	}, [filteredProducts.length, visibleCount, hasMore]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8 lg:py-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">
						All Products
					</h1>

					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
							<input
								type="text"
								placeholder="Search Products..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
							<SlidersHorizontal className="h-5 w-5" />
							<span>Filters</span>
						</button>
					</div>

					{/* Categories */}
					<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`px-4 py-2 rounded-lg transition ${
									selectedCategory === category
										? "bg-indigo-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{category}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Product Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="mb-4 text-gray-600">
					Showing {filteredProducts.length} products
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{displayedProducts.map((product) => (
						<ProductCard key={product.id} {...product} />
					))}
				</div>
				<div ref={sentinelRef} />
				{hasMore && (
					<div className="text-center py-12">
						<p className="text-gray-500">Loading more products...</p>
					</div>
				)}
				{filteredProducts.length === 0 && !hasMore && (
					<div className="text-center py-12">
						<p className="text-gray-500">
							No Products Found Matching Your Criterias.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default page;
