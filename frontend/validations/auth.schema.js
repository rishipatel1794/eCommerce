import { z } from "zod";

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(3, "Name must be atleast 3 characters")
			.max(50, "Name cannot exceed 50 characters")
			.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
		email: z
			.string()
			.min(1, "Email is required")
			.email("Invalid Email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/[A-Z]/,
				"Password must contain at least one uppercase letter",
			)
			.regex(
				/[a-z]/,
				"Password must contain at least one lowercase letter",
			)
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^A-Za-z0-9]/,
				"Password must contain at least one special character",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Password do not match",
		patch: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Invalid Email address"),

	password: z.string(),
});
