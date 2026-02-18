import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Papa from "papaparse";
import { toast } from "react-toastify";
import { useProducts } from "@/context/ProductContext";

const REQUIRED_FIELDS = [
	"name",
	"description",
	"price",
	"stock",
	"features",
	"category",
	"rating",
	"image",
];

const UploadBulkProduct = () => {
	const [previewData, setPreviewData] = useState(null);
	const { uploadBulkProductsContext } = useProducts();
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);

	const handleFile = (file) => {
		setPreviewData(null);
		setFile(file);

		if (!file) {
			toast.error("Please select a file.");
			return;
		}
		if (file.type !== "text/csv") {
			toast.error("Please upload a valid CSV file.");
			return;
		}
		if (file.size > 50 * 1024 * 1024) {
			toast.error("File size should be less than 50MB.");
			return;
		}

		Papa.parse(file, {
			header: true,
			preview: 10,
			skipEmptyLines: true,
			complete: (results) => {
				const headers = results.meta.fields || [];
				const missingFields = REQUIRED_FIELDS.filter(
					(field) => !headers.includes(field),
				);
				if (missingFields.length > 0) {
					toast.error(
						`Missing required fields: ${missingFields.join(", ")}`,
					);
					return;
				}
				setPreviewData(results.data);
			},
			error: (error) => {
				toast.error(`Error parsing CSV: ${error.message}`);
			},
		});
	};

	const handleUpload = async (e) => {
		e.preventDefault();
		if (!file) {
			toast.error("Please select a file to upload.");
			return;
		}
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await uploadBulkProductsContext(formData);
			toast.success(
				`products uploaded successfully!`,
			);
			setPreviewData(null);
			setFile(null);
		} catch (error) {
			toast.error(`Upload failed: ${error.message}`);
		} finally {
			setUploading(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600">
				Upload Bulk Product
			</DialogTrigger>
			<DialogContent className="w-full! max-w-7xl!">
				<DialogHeader>
					<DialogTitle>Upload Bulk Product</DialogTitle>
					<DialogDescription>
						Please upload a CSV file containing the product details.
					</DialogDescription>
				</DialogHeader>
				{/* Add your file upload form here */}
				<form
					action=""
					method="post"
					encType="multipart/form-data"
					className="flex flex-col items-start"
					onSubmit={handleUpload}
				>
					<input
						type="file"
						accept=".csv"
						className="mt-4"
						onChange={(e) => handleFile(e.target.files[0])}
						required
					/>
					{previewData && (
						<div className="mt-4 w-full">
							<h3 className="text-lg font-semibold mb-2">
								Preview:
							</h3>
							<div className="overflow-x-auto overflow-y-auto max-h-64 border border-gray-200 rounded-md">
								<table className="min-w-full bg-white border border-gray-200">
									<thead>
										<tr>
											{Object.keys(previewData[0]).map(
												(key) => (
													<th
														key={key}
														className="px-4 py-2 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700"
													>
														{key}
													</th>
												),
											)}
										</tr>
									</thead>
									<tbody>
										{previewData.map((row, index) => (
											<tr
												key={index}
												className="hover:bg-gray-50"
											>
												{Object.values(row).map(
													(value, idx) => (
														<td
															key={idx}
															className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700"
														>
															{value}
														</td>
													),
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
					<button
						type="submit"
						disabled={uploading}
						className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 cursor-pointer disabled:bg-gray-400 hover:disabled:bg-gray-400 hover:bg-green-600"
					>
						{uploading ? "Uploading..." : "Upload"}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default UploadBulkProduct;
