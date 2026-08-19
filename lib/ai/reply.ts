import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const replySchema = z.object({
  reply: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  usedFaqIds: z.array(z.string()),
});

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

export async function generateReply(
  cluster: Cluster,
  complaints: Complaint[],
  faqs: FAQ[]
) {
  const complaintText = complaints
    .map(
      (complaint) =>
        `Customer: ${complaint.name}
Complaint: ${complaint.message}`
    )
    .join("\n\n");

  const faqText = faqs
    .map(
      (faq) =>
        `FAQ ID: ${faq.id}
Question: ${faq.question}
Answer: ${faq.answer}`
    )
    .join("\n\n");

  const prompt = `
You are a professional customer support manager.

You need to create a reusable email response template for a recurring customer complaint.

CLUSTER:

Name: ${cluster.name}
Summary: ${cluster.summary}
Severity: ${cluster.severity}

CUSTOMER COMPLAINTS IN THIS CLUSTER:

${complaintText}

FAQ KNOWLEDGE BASE:

${faqText}

IMPORTANT RULES:

- Use ONLY information contained in the FAQ knowledge base.
- Never invent policies, refund timelines, guarantees, discounts, compensation, or other facts.
- The response must address the common issue represented by this cluster.
- Create a reusable response template that can be adapted for individual customers.
- Use [Customer Name] instead of a specific customer's name.
- If the FAQs do not contain enough information to answer the issue, clearly say that the support team needs to review the case.
- Be empathetic and professional.
- Do not mention that you are an AI.
- Keep the response concise.
- Do not include a subject line.
- Do not refer to individual customers by name.
- Only list FAQ IDs that actually influenced the response.

Return JSON matching the requested schema.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          reply: {
            type: Type.STRING,
          },

          confidence: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },

          usedFaqIds: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },

        required: [
          "reply",
          "confidence",
          "usedFaqIds",
        ],
      },
    },
  });

  const output = response.text;

  if (!output) {
    throw new Error("Gemini returned an empty response.");
  }

  return replySchema.parse(JSON.parse(output));
}