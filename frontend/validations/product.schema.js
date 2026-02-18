import { z } from "zod";

export const productSchema = z.object({
	name: z
		.string()
		.min(3, "Product name must be at least 3 characters")
		.max(100, "Product name cannot exceed 100 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description cannot exceed 1000 characters"),
	price: z
		.number({ invalid_type_error: "Price must be a number" })
		.positive("Price must be a positive number"),
	category: z
		.string()
		.min(3, "Category must be at least 3 characters")
		.max(50, "Category cannot exceed 50 characters"),
	stock: z
		.number({ invalid_type_error: "Stock must be a number" })
		.int("Stock must be an integer")
		.nonnegative("Stock cannot be negative"),
	
});
