"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black px-6">
      
      <div className="text-center">
        
        {/* 404 Number */}
        <h1 className="text-7xl md:text-9xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-6 text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn’t exist or has been moved.
          Let’s get you back on track.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
          >
            Go Home
          </Link>


        </div>
      </div>
    </div>
  );
}
