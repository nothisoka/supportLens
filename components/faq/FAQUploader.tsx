"use client";

import { useState } from "react";
import Papa from "papaparse";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

type FAQUploaderProps = {
  onFAQsLoaded: (faqs: FAQ[]) => void;
};

export default function FAQUploader({
  onFAQsLoaded,
}: FAQUploaderProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [error, setError] = useState("");

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const rows = results.data;

        if (rows.length === 0) {
          setError("The FAQ CSV is empty.");
          return;
        }

        const requiredColumns = ["question", "answer"];
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

        const parsedFAQs: FAQ[] = rows
          .map((row, index) => ({
            id: String(index + 1),
            question: row.question?.trim() || "",
            answer: row.answer?.trim() || "",
          }))
          .filter(
            (faq) => faq.question.length > 0 && faq.answer.length > 0
          );

        if (parsedFAQs.length === 0) {
          setError("No valid FAQs were found.");
          return;
        }

        setFaqs(parsedFAQs);
        onFAQsLoaded(parsedFAQs);
      },

      error: () => {
        setError("Unable to read the FAQ CSV.");
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
        <h3 className="font-semibold">
          Upload company FAQs
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          CSV must contain question and answer columns.
        </p>

        <label className="mt-5 inline-flex cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Choose FAQ CSV

          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {faqs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-semibold">
              FAQ knowledge base
            </h3>

            <p className="text-sm text-slate-500">
              {faqs.length} FAQs loaded
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="px-6 py-4">
                <p className="font-medium">
                  {faq.question}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}