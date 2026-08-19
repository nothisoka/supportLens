"use client";

import { useState } from "react";
import Papa from "papaparse";
import FAQUploader from "@/components/faq/FAQUploader";

type Complaint = {
  id: string;
  name: string;
  email: string;
  message: string;
};

type Cluster = {
  name: string;
  summary: string;
  severity: "low" | "medium" | "high";
  complaintIds: string[];
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export default function ComplaintUploader() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCluster, setSelectedCluster] =
    useState<Cluster | null>(null);
  const [reply, setReply] = useState("");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  const [replyConfidence, setReplyConfidence] = useState<
    "low" | "medium" | "high" | null
  >(null);

  const [usedFaqIds, setUsedFaqIds] = useState<string[]>([]);

  function downloadSampleCSV() {
    const csv = `name,email,message
  John Doe,john@example.com,"My refund has not arrived yet."
  Jane Smith,jane@example.com,"I was charged twice for my order."
  Alex Brown,alex@example.com,"I cannot log into my account."
  `;
  
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
  
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-complaints.csv";
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    URL.revokeObjectURL(url);
  }


  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setClusters([]);

    Papa.parse<Complaint>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const rows = results.data as Record<string, string>[];

        if (rows.length === 0) {
          setError("The CSV file is empty.");
          return;
        }

        const requiredColumns = ["name", "email", "message"];
        const columns = Object.keys(rows[0]);

        const missingColumns = requiredColumns.filter(
          (column) => !columns.includes(column)
        );

        if (missingColumns.length > 0) {
          setError(
            `Missing required columns: ${missingColumns.join(", ")}`
          );
          return;
        }

        const parsedComplaints: Complaint[] = rows
          .map((row, index) => ({
            id: String(index + 1),
            name: row.name?.trim() || "Unknown",
            email: row.email?.trim() || "",
            message: row.message?.trim() || "",
          }))
          .filter((complaint) => complaint.message.length > 0);

        if (parsedComplaints.length === 0) {
          setError("No valid complaints were found in the CSV.");
          return;
        }

        setComplaints(parsedComplaints);
      },

      error: () => {
        setError("Unable to read the CSV file.");
      },
    });
  }

  async function handleAnalyze() {
    if (complaints.length === 0) {
      setError("Please upload complaints before analyzing.");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/complaints/cluster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze complaints."
        );
      }

      setClusters(data.clusters);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateClusterReply(cluster: Cluster) {
    if (faqs.length === 0) {
      setError("Please upload your FAQ knowledge base first.");
      return;
    }

    setError("");
    setSelectedCluster(cluster);
    setReply("");
    setIsGeneratingReply(true);

    try {
      const clusterComplaints = complaints.filter((complaint) =>
        cluster.complaintIds.includes(complaint.id)
      );

      const response = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cluster,
          complaints: clusterComplaints,
          faqs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate response."
        );
      }

      setReply(data.reply);
      setReplyConfidence(data.confidence);
      setUsedFaqIds(data.usedFaqIds);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate response."
      );
    } finally {
      setIsGeneratingReply(false);
    }
  }

  return (
    <div className="space-y-6">
      {complaints.length > 0 && (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        Complaints
      </p>

      <p className="mt-2 text-2xl font-bold">
        {complaints.length}
      </p>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        Clusters
      </p>

      <p className="mt-2 text-2xl font-bold">
        {clusters.length}
      </p>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        High severity
      </p>

      <p className="mt-2 text-2xl font-bold text-red-600">
        {clusters.filter(
          (cluster) => cluster.severity === "high"
        ).length}
      </p>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        FAQs loaded
      </p>

      <p className="mt-2 text-2xl font-bold">
        {faqs.length}
      </p>
    </div>
  </div>
)}
{complaints.length > 0 && (
  <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-900">
          Support intelligence workflow
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {clusters.length === 0
            ? "Analyze your complaints to identify recurring issues."
            : faqs.length === 0
              ? "Clusters identified. Upload your FAQ knowledge base to generate responses."
              : "Your complaint insights and response knowledge base are ready."}
        </p>
      </div>

      <div className="text-xs font-medium text-slate-500">
        {clusters.length === 0
          ? "Step 1 of 3"
          : faqs.length === 0
            ? "Step 2 of 3"
            : "Step 3 of 3"}
      </div>
    </div>
  </div>
)}

      {/* Upload */}
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold">
            Upload customer complaints
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Upload a CSV containing name, email, and message columns.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
  <label className="inline-flex cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
    Choose CSV file

    <input
      type="file"
      accept=".csv"
      onChange={handleFile}
      className="hidden"
    />
  </label>

  <button
    type="button"
    onClick={downloadSampleCSV}
    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
  >
    Download sample CSV
  </button>
</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Preview */}
      {complaints.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h3 className="font-semibold">
                Complaint preview
              </h3>

              <p className="text-sm text-slate-500">
                {complaints.length} complaints loaded
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing
                ? "Analyzing..."
                : "Analyze complaints"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-3 font-medium text-slate-600">
                    Email
                  </th>

                  <th className="px-6 py-3 font-medium text-slate-600">
                    Complaint
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {complaints.slice(0, 10).map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {complaint.name}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {complaint.email}
                    </td>

                    <td className="max-w-xl px-6 py-4 text-slate-600">
                      {complaint.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {complaints.length > 10 && (
            <div className="border-t border-slate-200 px-6 py-3 text-sm text-slate-500">
              Showing first 10 complaints.
            </div>
          )}
        </div>
      )}

      {/* AI Clusters */}
      {clusters.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="font-semibold">
              AI complaint clusters
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Recurring customer issues identified by AI.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {clusters.map((cluster) => (
              <div
                key={cluster.name}
                className="px-6 py-5"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">
                        {cluster.name}
                      </h4>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          cluster.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : cluster.severity === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {cluster.severity}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {cluster.summary}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {cluster.complaintIds.length} complaints
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerateClusterReply(cluster)}
                    disabled={isGeneratingReply}
                    className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGeneratingReply &&
                    selectedCluster?.name === cluster.name
                      ? "Generating..."
                      : "Generate response"}
                  </button>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900">
                    View complaints
                  </summary>

                  <div className="mt-3 space-y-2">
                    {complaints
                      .filter((complaint) =>
                        cluster.complaintIds.includes(complaint.id)
                      )
                      .map((complaint) => (
                        <div
                          key={complaint.id}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <p className="text-sm font-medium">
                            {complaint.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {complaint.message}
                          </p>
                        </div>
                      ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* FAQ Knowledge Base */}
      {clusters.length > 0 && (
        <FAQUploader onFAQsLoaded={setFaqs} />
      )}
      {selectedCluster && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  AI response template
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Generated for: {selectedCluster.name}
                </p>

                {replyConfidence && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      AI confidence:
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        replyConfidence === "high"
                          ? "bg-green-100 text-green-700"
                          : replyConfidence === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {replyConfidence}
                    </span>
                  </div>
                )}
              </div>

              {reply && (
                <button
                  onClick={() => navigator.clipboard.writeText(reply)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  Copy response
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isGeneratingReply ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                <p className="mt-3 text-sm text-slate-500">
                  Generating response with Gemini...
                </p>
              </div>
            ) : reply ? (
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-300 p-4 text-sm leading-6 outline-none focus:border-slate-500"
              />
            ) : (
              <p className="text-sm text-slate-500">
                Select "Generate response" on a cluster to create a response.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

