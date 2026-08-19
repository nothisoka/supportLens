"use client";

import { useState } from "react";
import FAQUploader from "@/components/faq/FAQUploader";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

type Complaint = {
  id: string;
  name: string;
  email: string;
  message: string;
};

export default function ReplyPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [complaint, setComplaint] = useState<Complaint>({
    id: "1",
    name: "",
    email: "",
    message: "",
  });

  const [reply, setReply] = useState("");
  const [confidence, setConfidence] = useState("");
  const [usedFaqIds, setUsedFaqIds] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerateReply() {
    if (!complaint.name || !complaint.message) {
      setError("Please enter the customer's name and complaint.");
      return;
    }

    if (faqs.length === 0) {
      setError("Please upload your FAQ knowledge base first.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setReply("");

    try {
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaint,
          faqs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate reply."
        );
      }

      setReply(data.reply);
      setConfidence(data.confidence);
      setUsedFaqIds(data.usedFaqIds);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(reply);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
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
            AI Reply Generator
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Generate customer replies using your company's FAQ knowledge base.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            {/* Complaint */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold">
                  Customer complaint
                </h3>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="text-sm font-medium">
                    Customer name
                  </label>

                  <input
                    value={complaint.name}
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        name: e.target.value,
                      })
                    }
                    placeholder="John Smith"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    value={complaint.email}
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        email: e.target.value,
                      })
                    }
                    placeholder="john@example.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Complaint
                  </label>

                  <textarea
                    value={complaint.message}
                    onChange={(e) =>
                      setComplaint({
                        ...complaint,
                        message: e.target.value,
                      })
                    }
                    placeholder="My refund hasn't arrived yet..."
                    rows={6}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <FAQUploader onFAQsLoaded={setFaqs} />
            </section>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateReply}
              disabled={isGenerating}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating
                ? "Generating reply..."
                : "Generate AI reply"}
            </button>
          </div>

          {/* Right column */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold">
                AI suggested reply
              </h3>
            </div>

            <div className="p-6">
              {!reply && !isGenerating && (
                <div className="flex min-h-[400px] items-center justify-center text-center">
                  <div>
                    <p className="font-medium text-slate-600">
                      No reply generated yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Enter a complaint and upload FAQs to get started.
                    </p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                    <p className="mt-4 text-sm text-slate-500">
                      Gemini is generating a response...
                    </p>
                  </div>
                </div>
              )}

              {reply && !isGenerating && (
                <div>
                  <div className="rounded-lg bg-slate-50 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {reply}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        Confidence
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          confidence === "high"
                            ? "bg-green-100 text-green-700"
                            : confidence === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {confidence}
                      </span>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      Copy reply
                    </button>
                  </div>

                  {usedFaqIds.length > 0 && (
                    <div className="mt-5 border-t border-slate-200 pt-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        FAQ sources used
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {usedFaqIds.map((id) => (
                          <span
                            key={id}
                            className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
                          >
                            FAQ #{id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}