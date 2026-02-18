"use client";

import { Lock, Mail, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/validations/auth.schema";
import { toast } from "react-toastify";
import PublicRoute from "@/components/PublicRoute";

const page = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { signup } = useAuth();
	const router = useRouter();

	const handleSignUp = async (e) => {
		e.preventDefault();
		const result = registerSchema.safeParse({
			name,
			email,
			password,
			confirmPassword,
		});

		if (!result.success) {
			toast.error(result.error.issues[0].message);
			return;
		}

		setIsLoading(true);
		try {
			const res = await signup(name, email, password, confirmPassword);
			if (res.success) {
				toast.success("Account created successfully!");
				router.push("/");
			}
			if (res.status === 401) {
				toast.error(res.message);
			}
		} catch (error) {
			toast.error("Failed to create account. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PublicRoute>
			<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full">
					<div className="text-center mb-8">
						<Link
							href="/"
							className="inline-flex items-center space-x-2 mb-6"
						>
							<ShoppingCart className="h-10 w-10 text-indigo-600" />
							<span className="text-2xl font-bold text-gray-900">
								ShopHub
							</span>
						</Link>
						<h2 className="text-3xl font-bold text-gray-900">
							Create Your Account
						</h2>
						<p className="mt-2 text-gray-600">
							Start shopping with us today
						</p>
					</div>

					<div className="bg-white py-8 px-6 shadow-sm rounded-lg">
						<form className="space-y-6" onSubmit={handleSignUp}>
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Full Name
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="text"
										id="name"
										name="name"
										autoComplete="name"
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder="John Doe"
										className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Email Address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="email"
										id="email"
										name="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										autoComplete="email"
										placeholder="you@example.com"
										className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="password"
										id="password"
										name="password"
										autoComplete="new-password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										placeholder="••••••••"
										className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="confirm-password"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Confirm Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="password"
										id="confirm-password"
										name="confirm-password"
										autoComplete="new-password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										placeholder="••••••••"
										className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										required
									/>
								</div>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="terms"
									name="terms"
									className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									required
								/>
								<label
									htmlFor="terms"
									className="ml-2 block text-sm text-gray-700"
								>
									I agree to the{" "}
									<Link
										href="#"
										className="text-indigo-600 hover:text-indigo-600"
									>
										Terms and Conditions
									</Link>
								</label>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading
									? "Creating account..."
									: "Create account"}
							</button>
						</form>

						<p className="mt-6 text-sm text-gray-600 text-center">
							Already have an Account?{" "}
							<Link
								href={"/login"}
								className="text-indigo-600 hover:text-indigo-700 font-medium"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</PublicRoute>
	);
};

export default page;
