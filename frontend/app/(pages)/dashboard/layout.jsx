import Sidebar from "../../components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white text-black">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

