import Link from "next/link";

export default function DashboardPage() {
  // (Optional) mock stats you can swap with real data
  const stats = [
    { label: "Revenue", value: "$12,340", sub: "+8% vs last week" },
    { label: "Orders", value: "318", sub: "+12 new today" },
    { label: "Customers", value: "1,942", sub: "+27 this week" },
    { label: "Conversion", value: "3.1%", sub: "steady" },
  ];

  const recent = [
    { id: "ORD-1042", customer: "Ayesha Khan", total: "$129.00", status: "Paid" },
    { id: "ORD-1041", customer: "Ali Raza", total: "$58.50", status: "Pending" },
    { id: "ORD-1040", customer: "Sara I.", total: "$246.20", status: "Paid" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview at a glance</p>
        </div>
        
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-gray-500">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Content grid */}
      <section className="mt-6  gap-6 ">
        {/* Recent activity / orders */}
        <div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Orders
            </h2>
           
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((r) => (
                  <tr key={r.id} className="text-gray-800">
                    <td className="py-2">{r.id}</td>
                    <td className="py-2">{r.customer}</td>
                    <td className="py-2">{r.total}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          r.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No recent orders.
              </p>
            )}
          </div>
        </div>
    </section>
    </main>
  );
}
