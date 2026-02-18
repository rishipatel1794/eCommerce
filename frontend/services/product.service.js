import api from "@/lib/api";

function toFormData(obj) {
	const formData = new FormData();
	Object.keys(obj).forEach((key) => {
		const value = obj[key];
		// skip undefined, null, and empty-string values so we don't send empty image fields
		if (value === undefined || value === null || value === "") return;

		// don't send existing image path strings as the `image` file field on update
		if (key === 'image' && typeof value === 'string') return;
		if (Array.isArray(value)) {
			value.forEach((v) => formData.append(`${key}[]`, v));
			return;
		}
		if (value instanceof File) {
			formData.append(key, value);
			return;
		}
		formData.append(key, value);
	});
	return formData;
}

export const createProduct = async (data) => {
	const payload = data instanceof FormData ? data : toFormData(data);
	const response = await api.post("/products", payload);
	return response.data;
};

export const fetchProducts = async (page = 1, per_page = 30) => {
	const response = await api.get(`/products?page=${page}&per_page=${per_page}`);
	return response.data;
};

export const deleteProduct = async (id) => {
	const response = await api.delete(`/product/${id}`);
	return response.data;
};

export const updateProduct = async (id, data) => {
    const payload = data instanceof FormData ? data : toFormData(data);
    const response = await api.put(`/product/${id}`, payload);
    return response.data;
};

export const uploadBulkProducts = async (products) => {
	const payload = products instanceof FormData ? products : toFormData({ file: products });
	const response = await api.post("/products/bulk-upload", payload);
	console.log(response.data);
	return response.data;
};

export const checkOutService = async (cartItems) => {
	const response = await api.post("/checkout", { items: cartItems });
	return response.data;
	// console.log(cartItems)
};

export const getUserProducts = async () => {
	const response = await api.get(`/user/products`);
	return response.data;
	
};