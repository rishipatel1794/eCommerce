import { useProducts } from "@/context/ProductContext";
import { productSchema } from "@/validations/product.schema";
import { Plus, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import UploadBulkProduct from "./UploadBulkProduct";

const AddProductForm = () => {
	const { addProduct } = useProducts();
	const [features, setFeatures] = useState([""]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [FormData, setFormData] = useState({
		name: "",
		price: "",
		category: "",
		external_image: "",
		image: "",
		description: "",
		rating: 5,
		stock: 0,
	});

	const addFeatureField = () => {
		setFeatures([...features, ""]);
	};

	const updateFeature = (index, value) => {
		const updatedFeatures = [...features];
		updatedFeatures[index] = value;
		setFeatures(updatedFeatures);
	};

	const removeFeatureField = (index) => {
		const updatedFeatures = features.filter((_, i) => i !== index);
		setFeatures(updatedFeatures);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			setFormData((prev) => ({
				...prev,
				image: file, // store actual File object
			}));
		}
	};

	const handleExternalImageChange = (e) => {
		setFormData((prev) => ({ ...prev, external_image: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// client-side: ensure not both file and external URL provided
		const result = productSchema.safeParse(FormData);
		if (!result.success) {
			toast.error(result.error.issues[0].message);
			return;
		}
		if (FormData.external_image && FormData.image instanceof File) {
			toast.error('Please provide either an external image URL or upload a file, not both.');
			return;
		}

		setIsSubmitting(true);

		const res = await addProduct({ ...FormData, features });
		if (res.success) {
			toast.success("Product added successfully!");
			setFormData({
				name: "",
				price: "",
				category: "",
				external_image: "",
				image: null,
				description: "",
				rating: 5,
				stock: 0,
			});
			setFeatures([""]);
		}
		setIsSubmitting(false);
	};
	return (
		<div className="bg-white rounded-lg shadow-sm p-6">
			<div className="flex items-center justify-between mb-6">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Add New Product
			</h2>
			<div className="mobile:hidden flex-1 flex justify-end">
				<UploadBulkProduct />
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
						>
							Product Name
						</label>
						<input
							type="text"
							id="name"
							required
							value={FormData.name}
							onChange={(e) =>
								setFormData({
									...FormData,
									name: e.target.value,
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Headphones"
						/>
					</div>

					<div>
						<label
							htmlFor="price"
							className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
						>
							Price (Rs. )
						</label>
						<input
							type="number"
							id="price"
							required
							min={0}
							value={FormData.price}
							onChange={(e) =>
								setFormData({
									...FormData,
									price: parseInt(e.target.value),
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="3000"
						/>
					</div>

					<div>
						<label
							htmlFor="category"
							className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
						>
							Category
						</label>
						<select
							id="category"
							required
							value={FormData.category}
							onChange={(e) =>
								setFormData({
									...FormData,
									category: e.target.value,
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">Select a category</option>
							<option value="Audio">Audio</option>
							<option value="Electronics">Electronics</option>
							<option value="Wearables">Wearables</option>
							<option value="Computers">Computers</option>
							<option value="Photography">Photography</option>
						</select>
					</div>

					<div>
						<label
							htmlFor="rating"
							className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
						>
							Rating
						</label>
						<select
							id="rating"
							required
							value={FormData.rating}
							onChange={(e) =>
								setFormData({
									...FormData,
									rating: parseInt(e.target.value),
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value={5}>5 Stars</option>
							<option value={4}>4 Stars</option>
							<option value={3}>3 Stars</option>
							<option value={2}>2 Stars</option>
							<option value={1}>1 Star</option>
						</select>
					</div>
					<div>
						<label
							htmlFor="stock"
							className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
						>
							Stock
						</label>
						<input
							type="number"
							id="stock"
							required
							min={0}
							value={FormData.stock}
							onChange={(e) =>
								setFormData({
									...FormData,
									stock: parseInt(e.target.value),
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="30"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="image"
						className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
					>
						Image URL
					</label>
					<div className="flex gap-">
						<input
							type="file"
							id="image"
							accept="image/*"
							onChange={handleImageChange}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="https://example.com/image.jpg"
						/>{" "}
					</div>
					<div className="mt-3">
						<label htmlFor="external_image" className="block text-sm font-medium text-gray-700 mb-2">
							External Image URL (optional)
						</label>
						<input
							type="url"
							id="external_image"
							value={FormData.external_image}
							onChange={handleExternalImageChange}
							placeholder="https://example.com/image.jpg"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Description *
						</label>
						<textarea
							id="description"
							required
							rows={4}
							value={FormData.description}
							onChange={(e) =>
								setFormData({
									...FormData,
									description: e.target.value,
								})
							}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Describe your product..."
						/>
					</div>

					{/* Features */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-700">
								Features
							</label>
							<button
								type="button"
								onClick={addFeatureField}
								className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
							>
								<Plus className="h-4 w-4" />
								<span>Add Feature</span>
							</button>
						</div>
						<div className="space-y-2">
							{features.map((feature, index) => (
								<div key={index} className="flex gap-2">
									<input
										type="text"
										value={feature}
										onChange={(e) =>
											updateFeature(index, e.target.value)
										}
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="e.g., Active Noise Cancellation"
									/>
									{features.length > 1 && (
										<button
											type="button"
											onClick={() =>
												removeFeatureField(index)
											}
											className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
										>
											<X className="h-5 w-5" />
										</button>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end space-x-4 pt-6 border-t">
						<button
							type="button"
							onClick={() => {
								setFormData({
									name: "",
									price: "",
									category: "",
									external_image: "",
									image: null,
									description: "",
									rating: 5,
									stock: 0,
								});
								setFeatures([""]);
							}}
							className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
						>
							Reset
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Adding Product..." : "Add Product"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AddProductForm;
