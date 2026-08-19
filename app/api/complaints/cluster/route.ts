import { NextResponse } from "next/server";
import { z } from "zod";
import { clusterComplaints } from "@/lib/ai/cluster";

const complaintSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string(),
});

const requestSchema = z.object({
  complaints: z.array(complaintSchema).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid complaint data.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await clusterComplaints(parsed.data.complaints);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Clustering error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze complaints.",
      },
      {
        status: 500,
      }
    );
  }
}