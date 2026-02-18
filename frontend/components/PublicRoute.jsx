"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/app/loading";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.is_admin) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading) return <Loading />;
  if (user) return <Loading />;

  return <>{children}</>;
}
