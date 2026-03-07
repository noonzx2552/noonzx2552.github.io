export const config = {
  runtime: "edge",
};

type VisitPayload = {
  visitorId?: string;
  path?: string;
  referrer?: string;
  locale?: string;
  userAgent?: string;
  screen?: {
    width?: number;
    height?: number;
  };
  network?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } | null;
};

function getHeader(request: Request, name: string) {
  return request.headers.get(name) || "unknown";
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: VisitPayload = {};

  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  const visitLog = {
    time: new Date().toISOString(),
    ip,
    visitorId: payload.visitorId || "unknown",
    path: payload.path || "/",
    referrer: payload.referrer || "direct",
    locale: payload.locale || "unknown",
    userAgent: payload.userAgent || getHeader(request, "user-agent"),
    country: getHeader(request, "x-vercel-ip-country"),
    region: getHeader(request, "x-vercel-ip-country-region"),
    city: getHeader(request, "x-vercel-ip-city"),
    timezone: getHeader(request, "x-vercel-ip-timezone"),
    latitude: getHeader(request, "x-vercel-ip-latitude"),
    longitude: getHeader(request, "x-vercel-ip-longitude"),
    source: getHeader(request, "x-forwarded-host"),
    network: payload.network || null,
    screen: payload.screen || null,
  };

  console.log("[visit-log]", JSON.stringify(visitLog));

  return new Response(
    JSON.stringify({
      ok: true,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    }
  );
}
