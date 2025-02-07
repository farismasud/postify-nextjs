import { useEffect } from "react";
import { useRouter } from "next/router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Jika tidak ada token, redirect ke halaman login
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedRoute;