const stats = [
  {
    label: "Total complaints",
    value: "1,248",
    change: "+12.5%",
  },
  {
    label: "Issue clusters",
    value: "18",
    change: "+3",
  },
  {
    label: "FAQ coverage",
    value: "82%",
    change: "+6.2%",
  },
  {
    label: "Needs escalation",
    value: "94",
    change: "-8.4%",
  },
];

const clusters = [
  {
    name: "Refund delays",
    count: 287,
    percentage: 23,
    severity: "Medium",
  },
  {
    name: "Shipping issues",
    count: 241,
    percentage: 19,
    severity: "High",
  },
  {
    name: "Damaged products",
    count: 183,
    percentage: 15,
    severity: "High",
  },
  {
    name: "Account problems",
    count: 96,
    percentage: 8,
    severity: "Low",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">SupportLens</h1>
            <p className="text-xs text-slate-500">
              AI customer support intelligence
            </p>
          </div>

          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Upload complaints
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Support overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Understand customer issues and generate better responses.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>

              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold">{stat.value}</p>

                <span className="text-xs font-medium text-emerald-600">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Clusters */}
          <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="font-semibold">Top customer issues</h3>
              <p className="mt-1 text-sm text-slate-500">
                AI-generated complaint clusters
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {clusters.map((cluster) => (
                <div
                  key={cluster.name}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{cluster.name}</p>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {cluster.severity}
                      </span>
                    </div>

                    <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${cluster.percentage * 4}%` }}
                      />
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="font-semibold">{cluster.count}</p>
                    <p className="text-xs text-slate-500">complaints</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ gaps */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="font-semibold">FAQ gaps</h3>
              <p className="mt-1 text-sm text-slate-500">
                Topics your FAQ doesn't cover
              </p>
            </div>

            <div className="space-y-5 p-6">
              {[
                ["Duplicate charges", 42],
                ["Change delivery address", 31],
                ["Subscription renewal", 18],
              ].map(([topic, count]) => (
                <div
                  key={topic}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm">{topic}</span>
                  </div>

                  <span className="text-sm font-medium text-slate-500">
                    {count}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-6">
              <button className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                View all gaps
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}