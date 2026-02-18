
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as cartService from "@/services/cart.service";
import { checkOutService } from "@/services/product.service";


const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user, role } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    // Load local cart on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Sync behavior on user/role changes
    useEffect(() => {
        const sync = async () => {
            // user logged out -> clear cart
            if (!user) {
                setCartItems([]);
                localStorage.removeItem("cart");
                return;
            }

            // admin user -> clear cart and block
            if (role === "admin") {
                setCartItems([]);
                localStorage.removeItem("cart");
                return;
            }

            try {
                // merge local cart into backend
                const local = JSON.parse(localStorage.getItem("cart") || "[]");
                for (const item of local) {
                    await cartService.addCartItem(item.id || item.product_id, item.quantity || 1);
                }

                // load backend cart
                const res = await cartService.getCart();
                if (res && res.items) {
                    const mapped = res.items.map(i => ({
                        id: i.product.id,
                        product_id: i.product.id,
                        quantity: i.quantity,
                        name: i.product.name,
                        price: i.product.price,
                        image_url: i.product.image_url || i.product.image,
                        backend_item_id: i.id,
                    }));
                    setCartItems(mapped);
                    localStorage.setItem("cart", JSON.stringify(mapped));
                }
            } catch (e) {
                console.error("Cart sync failed", e);
            }
        };

        sync();
    }, [user, role]);

    const addToCart = async (product, quantity = 1) => {
        // Prevent admins from using cart
        if (role === "admin") return;

        if (user) {
            try {
                // If quantity is negative, perform decrement via update/remove
                if (quantity < 0) {
                    const productId = product.id || product.product_id;
                    const serverCart = await cartService.getCart();
                    const serverItem = serverCart.items.find(i => i.product.id === productId);
                    if (serverItem) {
                        const backendId = serverItem.id;
                        const newQty = serverItem.quantity + quantity; // quantity is negative
                        if (newQty < 1) {
                            await cartService.removeCartItem(backendId);
                        } else {
                            await cartService.updateCartItem(backendId, newQty);
                        }
                    }
                } else {
                    await cartService.addCartItem(product.id || product.product_id, quantity);
                }

                const res = await cartService.getCart();
                const mapped = res.items.map(i => ({
                    id: i.product.id,
                    product_id: i.product.id,
                    quantity: i.quantity,
                    name: i.product.name,
                    price: i.product.price,
                    image_url: i.product.image_url || i.product.image,
                    backend_item_id: i.id,
                }));
                setCartItems(mapped);
                localStorage.setItem("cart", JSON.stringify(mapped));
            } catch (e) {
                console.error(e);
            }
            return;
        }

        // guest/local flow
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            let updatedItems;

            if (existingItem) {
                updatedItems = prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                updatedItems = [...prevItems, { ...product, quantity }];
            }

            updatedItems = updatedItems.filter((item) => item.quantity > 0);
            localStorage.setItem("cart", JSON.stringify(updatedItems));
            return updatedItems;
        });
    };

    const updateQuantity = async (productId, quantity, backendItemId = null) => {
        if (role === "admin") return;

        if (user && backendItemId) {
            await cartService.updateCartItem(backendItemId, quantity);
            const res = await cartService.getCart();
            const mapped = res.items.map(i => ({
                id: i.product.id,
                product_id: i.product.id,
                quantity: i.quantity,
                name: i.product.name,
                price: i.product.price,
                image_url: i.product.image_url || i.product.image,
                backend_item_id: i.id,
            }));
            setCartItems(mapped);
            localStorage.setItem("cart", JSON.stringify(mapped));
            return;
        }

        setCartItems((prev) => {
            const updated = prev.map((it) => it.id === productId ? { ...it, quantity } : it).filter(i => i.quantity > 0);
            localStorage.setItem("cart", JSON.stringify(updated));
            return updated;
        });
    };

    const removeFromCart = async (productId, backendItemId = null) => {
        if (role === "admin") return;

        if (user && backendItemId) {
            await cartService.removeCartItem(backendItemId);
            const res = await cartService.getCart();
            const mapped = res.items.map(i => ({
                id: i.product.id,
                product_id: i.product.id,
                quantity: i.quantity,
                name: i.product.name,
                price: i.product.price,
                image_url: i.product.image_url || i.product.image,
                backend_item_id: i.id,
            }));
            setCartItems(mapped);
            localStorage.setItem("cart", JSON.stringify(mapped));
            return;
        }

        setCartItems((prevItems) => {
            const updatedItems = prevItems.filter((item) => item.id !== productId);
            localStorage.setItem("cart", JSON.stringify(updatedItems));
            return updatedItems;
        });
    };

    const checkOut = async (items = []) => {
        if (role === 'admin') return { success: false, message: 'Admins cannot checkout' };
        if (!user) return { success: false, message: 'Authentication required' };

        try {
            const res = await checkOutService(items);
            if (res && res.order) {
                setCartItems([]);
                localStorage.removeItem('cart');
                return { success: true, order: res.order };
            }
            return { success: false, message: res.message || 'Checkout failed' };
        } catch (e) {
            return { success: false, message: e.response?.data?.message || e.message };
        }
    };



    return (
        <CartContext.Provider value={{ cartItems, setCartItems, addToCart, updateQuantity, removeFromCart, checkOut }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};