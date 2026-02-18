import api from "@/lib/api";

export const registerUser = async (data) => {
	const response = await api.post("/auth/register", data);
	return response.data;
};

export const loginUser = async (data) => {
	const response = await api.post("/auth/login", data);
	return response.data;
};

export const logoutUser = async () => {
	const response = await api.post("/logout");
	return response.data;
};

export const getProfile = async () => {
	const response = await api.get("/profile");
	return response.data;
};

export const getCoin = async () => {
	console.log("called")
	const response = await api.get("/wallet");
	return response.data;
};

export const getTotalProducts = async () => {
	const response = await api.get("/total-products");
	return response.data;
};

export const getTotalSales = async () => {
	const response = await api.get("/total-sales");
	return response.data;
};

export const getCustomers = async () => {
	const response = await api.get("/customers");
	return response.data;
};
