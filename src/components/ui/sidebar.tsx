import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { House, CircleUser, LogOut, Compass, PlusCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ImageUploadPost from "@/components/sections/post"; // Pastikan path sudah sesuai

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleCreatePost = () => {
    setShowCreatePost((prev) => !prev);
  };

  return (
    <aside className="w-[4.5rem] min-h-full bg-black text-white flex flex-col justify-between">
      <div className="p-4">
        logo
      </div>
      <div className="p-4 flex flex-col gap-8">
        <nav>
          <ul className="flex flex-col gap-8">
            <li>
              <Link href="/">
                <button className="flex items-center gap-2">
                  <House size={30} strokeWidth="2" />
                </button>
              </Link>
            </li>
            <li>
              <Link href="/explore">
                <button className="flex items-center gap-2">
                  <Compass size={30} strokeWidth="2" />
                </button>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <button className="flex items-center gap-2">
                  <CircleUser size={30} strokeWidth="2" />
                </button>
              </Link>
            </li>
            <li>
              <button
                onClick={toggleCreatePost}
                className="flex items-center gap-2">
                <PlusCircle size={30} strokeWidth="2" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white rounded-md p-4 relative">
              <button
                onClick={toggleCreatePost}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition">  ✖
              </button>
              <ImageUploadPost />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2">
          <LogOut size={20} strokeWidth="2" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

