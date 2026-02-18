import api from "@/lib/api";

export const getCart = async () => {
    const res = await api.get('/cart');
    return res.data;
}

export const addCartItem = async (product_id, quantity = 1) => {
    const res = await api.post('/cart', { product_id, quantity });
    return res.data;
}

export const updateCartItem = async (itemId, quantity) => {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    return res.data;
}

export const removeCartItem = async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    return res.data;
}

