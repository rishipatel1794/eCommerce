import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const ProductCard = ({ id, name, price, image_url, image, rating, category }) => {
	const { addToCart } = useCart();
	const { role } = useAuth();

	return (
		<Link href={`/product/${id}`} className="group">
			<div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
				<div className="aspect-square overflow-hidden bg-gray-100">
					<img
						src={image_url || image}
						alt={name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</div>
				<div className="p-4">
					<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
						{category}
					</p>
					<h3 className="text-gray-900 mb-2">{name}</h3>
					<div className="flex items-center mb-2">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								className={`h-4 w-4 ${
									i < rating
										? "text-yellow-400 fill-yellow-400"
										: "text-gray-300"
								}`}
							/>
						))}
						<span className="ml-2 text-sm text-gray-600">
							({rating})
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xl font-semibold text-gray-900">
							Rs. {price}
						</span>
						<button
							className={`bg-indigo-600 text-white p-2 rounded-lg transition ${
								role === "admin" ? "opacity-50 cursor-not-allowed hover:bg-indigo-600" : "hover:bg-indigo-700"
							}`}
							onClick={(e) => {
								e.preventDefault();
								if (role === "admin") {
									toast.error("Admins cannot use cart");
									return;
								}
								addToCart({ id, name, price, image_url, image }, 1);
								toast.success(`${name} added to cart!`);
							}}
							disabled={role === "admin"}
						>
							<ShoppingCart className="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ProductCard;
