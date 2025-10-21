// utils/navItems.js

import { LuChartColumnIncreasing, LuFileText, LuShield } from "react-icons/lu";
import { MdOutlineShowChart } from "react-icons/md";
import { FiDollarSign, FiUsers } from "react-icons/fi";
import { TbActivityHeartbeat } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { FaTrophy } from "react-icons/fa";

// This is JSON-like config but with icons as React nodes
export const navItems = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: LuChartColumnIncreasing,
  },
  {
    name: "Trending",
    href: "/dashboard/trending-product",
    icon: MdOutlineShowChart,
  },
    {
    name: "Most Sales",
    href: "/dashboard/most-sales",
    icon: FaTrophy,
  },
  {
    name: "Product",
    href: "/dashboard/product",
    icon: FiDollarSign,
  },
  
  // {
  //   name: "Content and Marketing",
  //   href: "/dashboard/content",
  //   icon: LuFileText,
  // },
  //   {
  //   name: "Add user",
  //   href: "/dashboard/adduser",
  //   icon: FiUsers,
  // },
  // {
  //   name: "User Management",
  //   href: "/dashboard/users",
  //   icon: FiUsers,
  // },
 
  // {
  //   name: "Settings",
  //   href: "/dashboard/settings",
  //   icon: IoSettingsOutline,
  // },
];
