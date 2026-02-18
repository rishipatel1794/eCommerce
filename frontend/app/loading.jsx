export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black">
			<div className="text-center">
				{/* Animated Spinner */}
				<div className="relative w-16 h-16 mx-auto">
					<div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900"></div>
					<div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
				</div>

				{/* Loading Text */}
				<h2 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">
					Loading...
				</h2>

				<p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
					Preparing something awesome for you ✨
				</p>
			</div>
		</div>
	);
}
