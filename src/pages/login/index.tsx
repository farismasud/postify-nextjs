// src/pages/login/index.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { login } from "@/api/api";
import LoginComponent from "@/components/sections/login";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      console.log("Sending login data:", data);
      const response = await login(data);
      console.log("Login response:", response);
      localStorage.setItem("token", response.data.token);
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginComponent onLogin={handleLogin} />
      </div>
    </div>
  )
};

export default Login;