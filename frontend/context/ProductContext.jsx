"use client";
import { createProduct, deleteProduct, fetchProducts, getUserProducts, updateProduct as updateProductService } from "@/services/product.service";
import { createContext, useContext, useState } from "react";
import { uploadBulkProducts as uploadBulkProductsService } from "@/services/product.service";

const ProductContext = createContext(undefined);

// const initialProducts = [
// 	{
// 		id: 1,
// 		name: "Premium Wireless Headphones",
// 		price: 299,
// 		image: "https://images.unsplash.com/photo-1757946718516-fddeb8d3ed9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBoZWFkcGhvbmVzJTIwcHJvZHVjdHxlbnwxfHx8fDE3NzA1Njg3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 5,
// 		category: "Audio",
// 		description:
// 			"Experience premium sound quality with our latest wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort.",
// 		features: [
// 			"Active Noise Cancellation",
// 			"30-hour battery life",
// 			"Premium comfort design",
// 			"Bluetooth 5.0",
// 			"Premium sound quality",
// 		],
// 		inStock: true,
// 	},
// 	{
// 		id: 2,
// 		name: "Luxury Smartwatch",
// 		price: 599,
// 		image: "https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaCUyMHByb2R1Y3R8ZW58MXx8fHwxNzcwNjExODAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 4,
// 		category: "Wearables",
// 		description:
// 			"Stay connected with style. This luxury smartwatch combines elegance with cutting-edge technology.",
// 		features: [
// 			"Heart rate monitoring",
// 			"GPS tracking",
// 			"Water resistant",
// 			"7-day battery life",
// 			"Premium materials",
// 		],
// 		inStock: true,
// 	},
// 	{
// 		id: 3,
// 		name: "Portable Bluetooth Speaker",
// 		price: 149,
// 		image: "https://images.unsplash.com/photo-1542193810-9007c21cd37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMHNwZWFrZXIlMjBwcm9kdWN0fGVufDF8fHx8MTc3MDUzNjUwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 5,
// 		category: "Audio",
// 		description:
// 			"Take your music anywhere with this powerful portable speaker. Waterproof design and incredible battery life.",
// 		features: [
// 			"360-degree sound",
// 			"Waterproof (IPX7)",
// 			"20-hour battery",
// 			"Compact design",
// 			"Deep bass",
// 		],
// 		inStock: true,
// 	},
// 	{
// 		id: 4,
// 		name: "Latest Smartphone",
// 		price: 999,
// 		image: "https://images.unsplash.com/photo-1732998360037-4857039d77a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwZGV2aWNlfGVufDF8fHx8MTc3MDYxMzUwOXww&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 5,
// 		category: "Electronics",
// 		description:
// 			"The latest flagship smartphone with cutting-edge technology and stunning display.",
// 		features: [
// 			'6.7" OLED display',
// 			"Triple camera system",
// 			"5G connectivity",
// 			"All-day battery",
// 			"Premium build quality",
// 		],
// 		inStock: true,
// 	},
// 	{
// 		id: 5,
// 		name: "Professional Laptop",
// 		price: 1299,
// 		image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NzA2MDU2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 5,
// 		category: "Computers",
// 		description:
// 			"Powerful performance for professionals. High-end specs in a sleek design.",
// 		features: [
// 			"Intel i7 processor",
// 			"16GB RAM",
// 			"512GB SSD",
// 			'15.6" 4K display',
// 			"All-day battery",
// 		],
// 		inStock: true,
// 	},
// 	{
// 		id: 6,
// 		name: "Digital Camera",
// 		price: 899,
// 		image: "https://images.unsplash.com/photo-1764557359097-f15dd0c0a17b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeSUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzA1MTk2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
// 		rating: 4,
// 		category: "Photography",
// 		description:
// 			"Capture stunning photos with professional-grade camera equipment.",
// 		features: [
// 			"24MP sensor",
// 			"4K video",
// 			"Image stabilization",
// 			"Wi-Fi connectivity",
// 			"Compact design",
// 		],
// 		inStock: true,
// 	},
// ];

export function ProductProvider({ children }) {
	const [products, setProducts] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const addProduct = async (product) => {
		const res = await createProduct(product);
		setProducts([...products, res.product]);
		return res;
	};

	const displayProducts = async (page = 1, perPage = 30) => {
		const res = await fetchProducts(page, perPage);
		if (page === 1) {
			setProducts(res.products || []);
		} else {
			setProducts((prev) => [...prev, ...(res.products || [])]);
		}
		setCurrentPage(res.meta?.current_page ?? page);
		setHasMore((res.meta?.current_page ?? page) < (res.meta?.last_page ?? page));
		return res;
	};

	const loadMoreProducts = async (perPage = 30) => {
		if (!hasMore) return null;
		const nextPage = currentPage + 1;
		return await displayProducts(nextPage, perPage);
	};

	const updateProductContext = async (id, data) => {
		console.log(data)
		const res = await updateProductService(id, data);
		setProducts(products.map(p => p.id === id ? res.product : p));
		return res;
	};

	const deleteProductContext = async (id) => {
		const res = await deleteProduct(id);
		setProducts(products.filter(p => p.id !== id));
		return res;
	}

	const uploadBulkProductsContext = async (products) => {
		const res = await uploadBulkProductsService(products);
		setProducts(response.data)
		return res;
	};

	const displayProductsBasedOnUser = async (page = 1, perPage = 30) => {
		const res = await getUserProducts(page, perPage);
		if (page === 1) {
			
			setProducts(res.products.data || []);
		}
		else {
			setProducts((prev) => [...prev, ...(res.products.data || [])]);
		}
		setCurrentPage(res.meta?.current_page ?? page);
		setHasMore((res.meta?.current_page ?? page) < (res.meta?.last_page ?? page));
		return res;
	}

	return (
		<ProductContext.Provider value={{ products, addProduct, updateProductContext, deleteProductContext, displayProducts, loadMoreProducts, uploadBulkProductsContext, hasMore, displayProductsBasedOnUser }} >
			{children}
		</ProductContext.Provider>
	)
}

export function useProducts() {
	const context = useContext(ProductContext);
	if(context === undefined) {
		throw new Error('useProducts must be used within a ProductProvider');
	}

	return context;
}
