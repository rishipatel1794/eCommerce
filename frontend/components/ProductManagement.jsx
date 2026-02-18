"use client";
import { useProducts } from "@/context/ProductContext";
import { Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import UpdateModal from "./UpdateModal";
import DeleteConfirmation from "./DeleteConfirmation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const ProductManagement = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const {
		products,
		updateProductContext,
		loadMoreProducts,
		hasMore,
		deleteProductContext,
		displayProductsBasedOnUser,
		loading,
	} = useProducts();
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const { role } = useAuth();
	const [userFilter, setUserFilter] = useState("");

	useEffect(() => {
		// Fetch products when component mounts
		displayProductsBasedOnUser();
	}, []);

	const filteredProducts = products.filter(
		(product) =>
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.category.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// incremental rendering to reduce DOM load
	const PAGE_SIZE = 30;
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const sentinelRef = useRef(null);

	// reset visible count when search or filters change
	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [searchQuery]);

	const displayedProducts = filteredProducts.slice(0, visibleCount);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						// if there are more loaded items to show, increase visible count
						if (visibleCount < filteredProducts.length) {
							setVisibleCount((prev) =>
								Math.min(
									prev + PAGE_SIZE,
									filteredProducts.length,
								),
							);
						} else if (hasMore) {
							// otherwise request next page from server
							await loadMoreProducts();
						}
					}
				});
			},
			{ root: null, rootMargin: "200px", threshold: 0.1 },
		);
		obs.observe(sentinelRef.current);
		return () => obs.disconnect();
	}, [filteredProducts.length, visibleCount, hasMore]);

	const handleEdit = (id) => {
		// Implement edit functionality here
		const product = products.find((p) => p.id === id);
		setSelectedProduct(product);
		setModalOpen(true);
		console.log("Edit product with ID:", id);
	};

	const updateEdit = async (id, data) => {
		console.log("data", data);
		const res = await updateProductContext(id, data);
		console.log("Updated product with ID:", id, res);
		return res;
	};

	const handleDelete = async (id) => {
		// Implement delete functionality here
		const product = products.find((p) => p.id === id);
		setSelectedProduct(product);
		setDeleteConfirmationOpen(true);
		// const res = await deleteProductContext(id);
		// console.log("Deleted product with ID:", id);
		// return res;
	};

	return (
		<div className="bg-white rounded-lg shadow-sm">
			{modalOpen && (
				<UpdateModal
					isOpen={modalOpen}
					onClose={() => {
						setModalOpen(false);
						setSelectedProduct(null);
					}}
					item={selectedProduct}
					onUpdate={updateEdit}
				/>
			)}

			<DeleteConfirmation
				isOpen={deleteConfirmationOpen}
				onClose={() => setDeleteConfirmationOpen(false)}
				itemName={selectedProduct ? selectedProduct.name : ""}
				isDeleting={loading}
				onConfirm={async () => {
					if (selectedProduct && role === "admin") {
						await deleteProductContext(selectedProduct.id);
						setDeleteConfirmationOpen(false);
						setSelectedProduct(null);
						toast.success("Product deleted successfully!");
					}
				}}
			/>
			<div className="p-6 border-b border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold text-gray-900">
						Product Management
					</h2>
					<span className="text-sm text-gray-600">
						{filteredProducts.length}{" "}
						{filteredProducts.length === 1 ? "product" : "products"}
					</span>
				</div>
				<div className="flex items-center space-x-4">
				<input
					type="text"
					placeholder="Search Products..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Product
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Price
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Rating
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{displayedProducts.map((product) => (
							<tr key={product.id} className="hover:bg-gray-50">
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<img
											src={
												product.image_url ||
												product.image
											}
											alt={product.name}
											className="h-12 w-12 object-cover"
										/>
										<div className="ml-4">
											<div className="font-medium text-gray-900">
												{product.name}
											</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
										{product.category}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									Rs. {product.price}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{product.rating} ★
								</td>
								<td className="px-6 py-6 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											product.stock
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{product.stock ? product.stock : 0}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div className="flex items-center justify-start space-x-2">
										<Link
											href={`/product/${product.id}`}
											className="text-indigo-600 hover:index-indigo-900 p-1 cursor-pointer"
											title="View"
										>
											<Eye className="h-5 w-5" />
										</Link>
										<button
											onClick={() =>
												handleEdit(product.id)
											}
											className="text-gray-600 hover:index-gray-900 p-1 cursor-pointer"
											title="View"
										>
											<Edit className="h-5 w-5" />
										</button>
										{role === "admin" && (
											<button
												onClick={() =>
													handleDelete(product.id)
												}
												className="text-red-600 hover:index-red-900 p-1 cursor-pointer"
												title="View"
											>
												<Trash2 className="h-5 w-5" />
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div ref={sentinelRef} />

			{visibleCount < filteredProducts.length && (
				<div className="text-center py-4">
					<p className="text-gray-500">Loading more products...</p>
				</div>
			)}
			{filteredProducts.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">No products found.</p>
				</div>
			)}
		</div>
	);
};

export default ProductManagement;
