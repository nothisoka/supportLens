import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const clusterSchema = z.object({
  clusters: z.array(
    z.object({
      name: z.string(),
      summary: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      complaintIds: z.array(z.string()),
    })
  ),
});

export type ComplaintCluster = z.infer<typeof clusterSchema>;

type Complaint = {
  id: string;
  name: string;
  email: string;
  message: string;
};

export async function clusterComplaints(
  complaints: Complaint[]
): Promise<ComplaintCluster> {
  const complaintText = complaints
    .map(
      (complaint) =>
        `ID: ${complaint.id}
Customer: ${complaint.name}
Complaint: ${complaint.message}`
    )
    .join("\n\n");

  const prompt = `
You are a customer support analytics system.

Analyze these customer complaints and group them into meaningful recurring issues.

Rules:
- Group complaints describing the same underlying problem.
- Avoid unnecessary clusters.
- Every complaint must belong to exactly one cluster.
- Give each cluster a concise name.
- Summarize the underlying customer problem.
- Assign severity:
  - low = minor inconvenience
  - medium = meaningful customer impact
  - high = serious failure, financial issue, safety concern, or major service disruption
- Use the complaint IDs exactly as provided.

Complaints:

${complaintText}
`;

  console.log(
    "Gemini API key loaded:",
   Boolean(process.env.GEMINI_API_KEY)
  );


  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clusters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                },
                summary: {
                  type: Type.STRING,
                },
                severity: {
                  type: Type.STRING,
                  enum: ["low", "medium", "high"],
                },
                complaintIds: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: [
                "name",
                "summary",
                "severity",
                "complaintIds",
              ],
            },
          },
        },
        required: ["clusters"],
      },
    },
  });

  const output = response.text;

  if (!output) {
    throw new Error("Gemini returned an empty response.");
  }

  return clusterSchema.parse(JSON.parse(output));
}