import { useEffect } from "react";
import { useRouter } from "next/router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Jika tidak ada token dan bukan halaman login atau register, redirect ke halaman login
    if (!token && router.pathname !== "/login" && router.pathname !== "/register") {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedRoute;
