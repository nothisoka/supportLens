import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReply } from "@/lib/ai/reply";

const requestSchema = z.object({
  cluster: z.object({
    name: z.string(),
    summary: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    complaintIds: z.array(z.string()),
  }),

  complaints: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      message: z.string(),
    })
  ),

  faqs: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid cluster, complaint, or FAQ data.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await generateReply(
      parsed.data.cluster,
      parsed.data.complaints,
      parsed.data.faqs
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reply generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate response.",
      },
      {
        status: 500,
      }
    );
  }
}