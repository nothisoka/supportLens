import ComplaintUploader from "@/components/complaints/ComplaintUploader";

export default function ComplaintsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              SupportLens
            </h1>
            <p className="text-xs text-slate-500">
              AI customer support intelligence
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Import complaints
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload your customer complaints to discover recurring issues.
          </p>
        </div>

        <ComplaintUploader />
      </div>
    </main>
  );
}
