import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { register } from "@/api/api";
import RegisterComponent from "@/components/sections/register";

const Register = () => {
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     router.push("/login");
  //   }
  // }, [router]);

  const handleRegister = async (data: { email: string; password: string; name: string }) => {
    try {
      console.log("Sending register data:", data);
      const response = await register(data);
      console.log("Register response:", response);
      localStorage.setItem("token", response.data.token);
      router.push("/login");
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <RegisterComponent onRegister={handleRegister} />
      </div>
    </div>
  )
};

export default Register;

