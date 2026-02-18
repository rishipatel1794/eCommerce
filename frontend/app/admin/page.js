"use client";
import AddProductForm from "@/components/AddProductForm";
import OverviewTab from "@/components/OverviewTab";
import ProductManagement from "@/components/ProductManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, Package, Plus } from "lucide-react";
import React, {  useState } from "react";

const page = () => {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<ProtectedRoute adminOnly={true}>
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Admin Dashboard
						</h1>
						<p className="text-gray-600">
							Manage your store products and settings
						</p>
					</div>

					{/* Navigation Tabs */}
					<div className="bg-white rounded-lg shadow-sm mb-8">
						<div className="border-b border-gray-200">
							<nav className="flex -mb-px overflow-x-auto">
								<button
									onClick={() => setActiveTab("overview")}
									className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
										activeTab === "overview"
											? "border-indigo-600 text-indigo-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									<LayoutDashboard className="h-5 w-5" />
									<span>Overview</span>
								</button>
								<button
									onClick={() => setActiveTab("products")}
									className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
										activeTab === "products"
											? "border-indigo-600 text-indigo-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									<Package className="h-5 w-5" />
									<span>Products</span>
								</button>
								<button
									onClick={() => setActiveTab("add-product")}
									className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
										activeTab === "add-product"
											? "border-indigo-600 text-indigo-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									<Plus className="h-5 w-5" />
									<span>Add Product</span>
								</button>
							</nav>
						</div>
					</div>

					{/* Tab Content */}
					<div>
						{activeTab === "overview" && <OverviewTab />}
						{activeTab === "products" && <ProductManagement />}
						{activeTab === "add-product" && (
							<AddProductForm
								onSuccess={() => setActiveTab("products")}
							/>
						)}
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default page;
