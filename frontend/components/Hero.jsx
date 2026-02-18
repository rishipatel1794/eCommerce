import Link from "next/link";
import { ArrowRight, Truck, Shield, HeadphonesIcon } from "lucide-react";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { useProducts } from "@/context/ProductContext";


const Home = () => {
	const [featuredProducts,setFeaturedProducts] = useState([]);
	const {products} = useProducts();

	useEffect(() => {
		featuredProducts.length === 0 && setFeaturedProducts(products.slice(0,4));
	},[products])

	return (
		<div>
			{/* Hero Section */}
			<section className="relative bg-linear-to-r from-indigo-600 to-purple-600 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<h1 className="text-5xl font-bold mb-6">
								Discover Amazing Products
							</h1>
							<p className="text-xl mb-8 text-indigo-100">
								Shop the latest trends and exclusive deals on
								premium products
							</p>
							<Link
								href="/products"
								className="inline-flex items-center bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition space-x-2"
							>
								<span>Shop Now</span>
								<ArrowRight className="h-5 w-5" />
							</Link>
						</div>
						<div className="hidden md:block">
							<img
								src="https://images.unsplash.com/photo-1658297063569-162817482fb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG9ubGluZSUyMGVjb21tZXJjZXxlbnwxfHx8fDE3NzA2Mjc0NjB8MA&ixlib=rb-4.1.0&q=80&w=1080"
								alt="Shopping"
								className="rounded-lg shadow-2xl"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Truck className="h-8 w-8 text-indigo-600" />
							</div>
							<h3 className="mb-2">Free Shipping</h3>
							<p className="text-gray-600">On orders over $50</p>
						</div>
						<div className="text-center">
							<div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<Shield className="h-8 w-8 text-indigo-600" />
							</div>
							<h3 className="mb-2">Secure Payment</h3>
							<p className="text-gray-600">
								100% secure transactions
							</p>
						</div>
						<div className="text-center">
							<div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<HeadphonesIcon className="h-8 w-8 text-indigo-600" />
							</div>
							<h3 className="mb-2">24/7 Support</h3>
							<p className="text-gray-600">
								Dedicated customer service
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Products */}
			<section className="py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Featured Products
						</h2>
						<p className="text-gray-600">
							Check out our most popular items
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{featuredProducts.map((product) => (
							<ProductCard key={product.id} {...product} />
						))}
					</div>
					<div className="text-center mt-12">
						<Link
							href="/products"
							className="inline-flex items-center text-indigo-600 hover:text-indigo-700 space-x-2"
						>
							<span>View All Products</span>
							<ArrowRight className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gray-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Join Our Newsletter
					</h2>
					<p className="text-gray-300 mb-8">
						Subscribe to get special offers, free giveaways, and
						updates
					</p>
					<div className="max-w-md mx-auto flex gap-2">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-300"
						/>
						<button className="bg-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
							Subscribe
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
