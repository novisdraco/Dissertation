import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  return new Response("WebSocket endpoint - use ws://localhost:8080 for real-time connection", {
    status: 200,
  })
}
