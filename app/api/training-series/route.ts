import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTrainingSeries, getTrainingSeries } from "@/lib/db";

const CreateSeriesSchema = z.object({
  sourceName: z.string().min(1),
  chapter: z.string().optional(),
  mode: z.enum(["CHAPTER", "FULL_BOOK", "FAILED_ONLY", "CUSTOM"]).optional(),
  includeIntroduction: z.boolean().optional(),
  limit: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  try {
    const series = await getTrainingSeries(status);
    return NextResponse.json(series);
  } catch (err) {
    console.error("[training-series GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSeriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const series = await createTrainingSeries(parsed.data);
    return NextResponse.json(series, { status: 201 });
  } catch (err) {
    console.error("[training-series POST]", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
