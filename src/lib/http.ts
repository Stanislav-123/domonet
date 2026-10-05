import { NextResponse } from "next/server";
import { countryFromHeaders, requestIp } from "./geo";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function clientIp(req: Request) {
  return requestIp(req.headers) || "0.0.0.0";
}

export function headerCountry(req: Request) {
  return countryFromHeaders(req.headers);
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
