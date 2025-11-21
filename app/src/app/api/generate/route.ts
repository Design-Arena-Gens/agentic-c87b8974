import { NextResponse } from "next/server";
import { generateScenario } from "@/lib/scenario";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt =
      typeof body?.prompt === "string" ? body.prompt : "scénario automatique";

    const scenario = generateScenario(prompt);

    return NextResponse.json({ scenario });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la génération du scénario.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
