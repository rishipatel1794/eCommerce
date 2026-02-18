import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";  

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-gray-300 bottom-0">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div>
						<h3 className="text-white font-semibold mb-4">
							About ShopHub
						</h3>
						<p className="text-sm">
							Your one-stop destination for quality products at
							amazing prices.
						</p>
					</div>
					<div>
						<h3 className="text-white font-semibold mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/products"
									className="hover:text-white transition"
								>
									Shop Now
								</Link>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white transition"
								>
									About Us
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white transition"
								>
									Contact
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-white font-semibold mb-4">
							Customer Service
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<a
									href="#"
									className="hover:text-white transition"
								>
									Shipping Info
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white transition"
								>
									Returns
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white transition"
								>
									FAQ
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-white font-semibold mb-4">
							Follow Us
						</h3>
						<div className="flex space-x-4">
							<a href="#" className="hover:text-white transition">
								<Facebook className="h-5 w-5" />
							</a>
							<a href="#" className="hover:text-white transition">
								<Twitter className="h-5 w-5" />
							</a>
							<a href="#" className="hover:text-white transition">
								<Instagram className="h-5 w-5" />
							</a>
							<a href="#" className="hover:text-white transition">
								<Mail className="h-5 w-5" />
							</a>
						</div>
					</div>
				</div>
				<div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
					<p>&copy; 2026 ShopHub. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
