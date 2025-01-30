import React from "react";
import Sidebar from "@/components/ui/sidebar";
import { useRouter } from "next/router";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const noSidebarRoutes = ["/login", "/register"];

  const showSidebar = !noSidebarRoutes.includes(router.pathname);

  return (
    <div className="flex min-h-screen bg-white">
      {showSidebar && (
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      )}
      <div className="flex flex-col flex-grow">
        <main className="flex-grow">{children}</main>
      </div>
    </div>
  );
};

export default Layout;