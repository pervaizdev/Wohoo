"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../text/sidebar.js"; 
import { useState } from "react"; 
import { FiMenu, FiX } from "react-icons/fi"; 

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <>
    
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)} 
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />} 
      </button>


      <aside
        className={`fixed top-0 left-0 w-64 min-h-screen p-4 sidebar-bg transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`} 
      >
        <div>
          <h2 className="text-xl font-bold mt-6">Wohoo</h2>
          <h2 className="text-md 
           sidebar-text">Founders Dashboard</h2>
          <h2 className="text-xl font-bold mt-8 sidebar-text">Dashboard</h2>

          <nav className="space-y-2 text-sm mt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-2 py-1 rounded-lg gap-2 transition ${
                  pathname === item.href
                    ? "bg-gray-700 text-white"
                    : "text-black hover:bg-gray-300"
                }`}
                onClick={() => setIsOpen(false)} 
              >
                <item.icon size={16} /> 
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

    
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)} // ✅ Close sidebar if overlay clicked
        ></div>
      )}
    </>
  );
}
