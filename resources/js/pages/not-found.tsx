import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import React from "react";

// import { Header } from "@/components/header";


export default function NotFound() {
  return (
    <>
      {/* <Header /> */}
      
      <div className="h-screen bg-[#F59E0B] flex flex-col items-center justify-center text-white">
        {/* min-h-[calc(100vh-121px)] */}
        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PawPrint size={90} />
        </motion.div>

        {/* 404 */}
        <motion.h1
          className="text-7xl font-bold mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.p
          className="mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Looks like this page wandered off 🐾
        </motion.p>

        {/* Button */}
        <motion.a
          href="/"
          className="mt-6 px-6 py-2 bg-white text-orange-500 rounded-full font-semibold shadow-md"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Home
        </motion.a>

      </div>
    </>
  );
};
