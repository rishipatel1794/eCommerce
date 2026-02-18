"use client";
import React from "react";
import Hero from "@/components/Hero";
import ProtectedRoute from "@/components/ProtectedRoute";

const page = () => {
	return (
    <ProtectedRoute>
		<div>
			<Hero />
		</div>
    </ProtectedRoute>
	);
};

export default page;
