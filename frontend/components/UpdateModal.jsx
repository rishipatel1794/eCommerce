"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const UpdateModal = ({ isOpen, onClose, item, onUpdate }) => {
	const [formData, setFormData] = useState(item || {});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [localError, setLocalError] = useState("");

	useEffect(() => {
		setFormData(item || { image: null, external_image: '' });
		setErrorMessage("");
	}, [item]);


	const handleImageChange = (e) => {
		const file = e.target.files && e.target.files[0];
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
		// client-side: prevent both external URL and file
		if (formData.external_image && formData.image instanceof File) {
			setLocalError('Please provide either an external image URL or upload a file, not both.');
			return;
		}

		setLocalError("");
		setIsSubmitting(true);
		setErrorMessage("");
		try {
			const res = await onUpdate(item.id, formData);
			if (res.success) {
				onClose();
			} else {
				setErrorMessage(res.message || "Failed to update product");
			}
		} catch (error) {
			setErrorMessage(error.message || "An error occurred while updating");
		}
		setIsSubmitting(false);
    };

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 transition-transform top-0 duration-300 opacity-100 visible"
			style={{ backdropFilter: "blur(10px)" }}
		>
			<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform scale-100">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-900">
						Update Product
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{errorMessage && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							{errorMessage}
						</div>
					)}

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
								value={formData.name || ""}
								onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Enter product name"
							/>
						</div>

						<div>
							<label
								htmlFor="price"
								className="block text-sm font-medium text-gray-700 mb-2 after:content-['_*'] after:text-red-500"
							>
								Price (Rs.)
							</label>
							<input
								type="number"
								id="price"
								required
								min={0}
								value={formData.price || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										price: parseInt(e.target.value || 0),
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
								value={formData.category}
								onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
								value={formData.rating || 5}
								onChange={(e) =>
									setFormData({
										...formData,
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
								value={formData.stock || 0}
								onChange={(e) =>
									setFormData({
										...formData,
										stock: parseInt(e.target.value || 0),
									})
								}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="30"
							/>
						</div>

						<div>
							<label
								htmlFor="image"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Image
							</label>
							<input
								type="file"
								id="image"
								accept="image/*"
								onChange={handleImageChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
							{formData.image &&
								typeof formData.image === "string" && (
									<img
										src={
											formData.image_url || formData.image
										}
										alt="Current product image"
										className="mt-2 w-20 h-20 object-cover rounded-lg border"
									/>
								)}
						{/* External image URL input */}
						<div className="mt-3">
							<label htmlFor="external_image" className="block text-sm font-medium text-gray-700 mb-2">
								External Image URL (optional)
							</label>
							<input
								type="url"
								id="external_image"
								value={formData.external_image || ''}
								onChange={handleExternalImageChange}
								placeholder="https://example.com/image.jpg"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						</div>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Description
						</label>
						<textarea
							id="description"
							rows={4}
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Describe your product..."
						/>
					</div>

					<div className="flex justify-end space-x-4 pt-6 border-t">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? "Updating..." : "Update Product"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UpdateModal;
