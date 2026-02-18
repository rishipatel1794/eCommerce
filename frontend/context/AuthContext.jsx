"use client";

import Loading from "@/app/loading";
import {
	loginUser,
	logoutUser,
	registerUser,
	getProfile,
	getCoin,
} from "@/services/auth.service";
import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [coins, setCoins] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");

		if (storedToken) {
			setToken(storedToken);
			// Set default authorization header with token
			// 🔥 verify token + fetch real user
			getProfile()
				.then((res) => {
					setUser(res.user);
				})
				.catch(() => {
					localStorage.removeItem("token");
					setToken(null);
				})
				.finally(() => {
					setLoading(false);
				});
			if (user && !user.is_admin) {
				getCoin(user.role)
					.then((res) => {
						setCoins(res.wallet_balance);
					})
					.catch(() => {
						setCoins(0);
					});
			}
		} else {
			setLoading(false);
		}
	}, []);

	const signup = async (name, email, password, confirmPassword) => {
		const res = await registerUser({
			name,
			email,
			password,
			password_confirmation: confirmPassword,
		});

		setUser(res.user);
		setToken(res.access_token);
		localStorage.setItem("token", res.access_token);

		return res;
	};

	const login = async (email, password) => {
		const res = await loginUser({ email, password });

		setUser(res.user);
		setToken(res.access_token);
		localStorage.setItem("token", res.access_token);

		return res;
	};

	const logout = async () => {
		const res = await logoutUser();

		setUser(null);
		setToken(null);
		localStorage.removeItem("token");
		// clear cart on logout
		localStorage.removeItem("cart");
		setCoins(0);
		return res;
	};

	const role = user?.is_admin ? "admin" : "user";

	const setCoin = async () => {
		console.log("setcalled")
		if (!user) return <Loading />;
		if (role === "admin") return;
		const res = await getCoin();
		setCoins(res.wallet_balance);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				signup,
				login,
				logout,
				loading,
				role,
				coins,
				setCoin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
