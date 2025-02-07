import HomePage  from "@/components/sections/home";
import ProtectedRoute from "@/lib/ProtectedRoute";
import React from "react";

const Home = () => {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
};

export default Home;

