import type { IntelligenceContext } from "../core/engine";
import { firstHeader } from "../core/fingerprint";
import type { SecuritySignals } from "../types";

export function extractSecurity(ctx: IntelligenceContext): SecuritySignals {
  const https = ctx.finalUrl.startsWith("https://");
  const hsts = !!firstHeader(ctx, "strict-transport-security");
  const csp = !!firstHeader(ctx, "content-security-policy");
  const xfo = firstHeader(ctx, "x-frame-options");
  const xcto = firstHeader(ctx, "x-content-type-options");
  const ref = firstHeader(ctx, "referrer-policy");
  const perm = firstHeader(ctx, "permissions-policy");

  // CDN detection from server / cf-ray / x-amz / etc.
  const server = (firstHeader(ctx, "server") ?? "").toLowerCase();
  const cfRay = firstHeader(ctx, "cf-ray");
  const fastlyId = firstHeader(ctx, "x-fastly-request-id");
  const akamai = firstHeader(ctx, "x-akamai-transformed");
  const amazon = firstHeader(ctx, "x-amz-cf-id");
  let cdnDetected: string | null = null;
  if (cfRay || /cloudflare/.test(server)) cdnDetected = "Cloudflare";
  else if (fastlyId || /fastly/.test(server)) cdnDetected = "Fastly";
  else if (akamai || /akamai/.test(server)) cdnDetected = "Akamai";
  else if (amazon || /cloudfront/.test(server)) cdnDetected = "AWS CloudFront";
  else if (/bunnycdn/.test(server)) cdnDetected = "Bunny CDN";

  return {
    https,
    hsts,
    csp,
    xFrameOptions: xfo,
    xContentTypeOptions: xcto,
    referrerPolicy: ref,
    permissionsPolicy: perm,
    cdnDetected,
  };
}
