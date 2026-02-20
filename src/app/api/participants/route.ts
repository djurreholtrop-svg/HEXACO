import { NextRequest, NextResponse } from "next/server";
import {
  createParticipant,
  getParticipantByToken,
  listParticipants,
} from "@/lib/db";

/**
 * GET /api/participants?token=xxx
 *
 * If `token` query param is provided, returns that participant's data and scores.
 * If no token is provided and a valid API key is sent, returns a list of all participants.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (token) {
    const data = await getParticipantByToken(token);
    if (!data) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  }

  // List all participants (requires API key)
  const apiKey = process.env.API_SECRET_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const participants = await listParticipants();
  return NextResponse.json(participants);
}

/**
 * POST /api/participants
 *
 * Creates a new participant and returns their unique token.
 *
 * Headers:
 *   X-API-Key: <API_SECRET_KEY>
 *
 * Body (JSON, optional):
 * {
 *   "label": "Participant 001"
 * }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.API_SECRET_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let label: string | undefined;
  try {
    const body = await request.json();
    if (typeof body.label === "string") {
      label = body.label;
    }
  } catch {
    // body is optional
  }

  const participant = await createParticipant(label);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  return NextResponse.json(
    {
      ...participant,
      dashboard_url: `${baseUrl}/dashboard?token=${participant.token}`,
    },
    { status: 201 }
  );
}
