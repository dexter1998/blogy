import type { CheckDef } from "./types";

export const securityChecks: CheckDef[] = [
  {
    id: "https",
    title: "Served over HTTPS",
    category: "security",
    weight: 3,
    whyItMatters:
      "HTTPS is a baseline ranking signal and required for HTTP/2, service workers, and most modern browser features. HTTP-only sites get a 'Not Secure' label in Chrome.",
    howToFix: "Install a TLS certificate (Let's Encrypt is free) and 301-redirect all HTTP traffic to HTTPS.",
    run: (s) => {
      const https = s.intelligence?.signals.security.https;
      if (https == null) return null;
      if (https) return { status: "pass", summary: "Site is served over HTTPS.", evidence: [] };
      return { status: "fail", summary: "Site is served over plain HTTP.", evidence: [] };
    },
  },
  {
    id: "hsts",
    title: "HSTS header set",
    category: "security",
    weight: 1,
    whyItMatters: "HSTS forces browsers to use HTTPS even on the first connection — protecting against stripping attacks.",
    howToFix: "Add a Strict-Transport-Security header with at least 6 months max-age. Test before enabling preload.",
    run: (s) => {
      const sec = s.intelligence?.signals.security;
      if (!sec) return null;
      if (sec.hsts) return { status: "pass", summary: "HSTS header is set.", evidence: [] };
      return { status: "warn", summary: "No HSTS header.", evidence: [] };
    },
  },
  {
    id: "csp",
    title: "Content-Security-Policy",
    category: "security",
    weight: 0.5,
    whyItMatters: "CSP is the strongest defense against injected scripts (XSS). Missing CSP isn't a blocker but is a hardening gap.",
    howToFix: "Roll out a Content-Security-Policy in Report-Only mode first, then enforce once clean.",
    run: (s) => {
      const sec = s.intelligence?.signals.security;
      if (!sec) return null;
      if (sec.csp) return { status: "pass", summary: "CSP header is set.", evidence: [] };
      return { status: "info", summary: "No Content-Security-Policy header.", evidence: [] };
    },
  },
  {
    id: "x-frame-options",
    title: "X-Frame-Options / frame-ancestors set",
    category: "security",
    weight: 0.5,
    whyItMatters: "Prevents clickjacking by stopping other sites embedding yours in an iframe.",
    howToFix: "Add X-Frame-Options: DENY or use CSP frame-ancestors 'none'.",
    run: (s) => {
      const xfo = s.intelligence?.signals.security.xFrameOptions;
      if (!s.intelligence) return null;
      if (xfo) return { status: "pass", summary: `X-Frame-Options: ${xfo}.`, evidence: [{ label: "Header", value: xfo }] };
      return { status: "warn", summary: "No X-Frame-Options header.", evidence: [] };
    },
  },
  {
    id: "referrer-policy",
    title: "Referrer-Policy set",
    category: "security",
    weight: 0.3,
    whyItMatters: "Without an explicit Referrer-Policy, browsers leak the full URL (including query params) to third-party origins.",
    howToFix: "Add `Referrer-Policy: strict-origin-when-cross-origin` (or stricter).",
    run: (s) => {
      const rp = s.intelligence?.signals.security.referrerPolicy;
      if (!s.intelligence) return null;
      if (rp) return { status: "pass", summary: `Referrer-Policy: ${rp}.`, evidence: [{ label: "Header", value: rp }] };
      return { status: "info", summary: "No Referrer-Policy header.", evidence: [] };
    },
  },
  {
    id: "spf",
    title: "SPF record published",
    category: "security",
    weight: 0.5,
    whyItMatters: "SPF declares which servers can send email from your domain. Without it, spoofed mail is easier — and hurts deliverability.",
    howToFix: "Publish a TXT record `v=spf1 include:<provider> -all` for your sending provider.",
    run: (s) => {
      const net = s.intelligence?.signals.network;
      if (!net) return null;
      if (net.spf.present) return { status: "pass", summary: "SPF record is published.", evidence: [{ label: "Record", value: net.spf.records[0] ?? "" }] };
      return { status: "warn", summary: "No SPF record.", evidence: [] };
    },
  },
  {
    id: "dmarc",
    title: "DMARC record published",
    category: "security",
    weight: 0.5,
    whyItMatters: "DMARC + SPF + DKIM together prevent spoofing. Gmail and Yahoo now require DMARC for bulk senders.",
    howToFix: "Publish a TXT record at `_dmarc.<domain>` starting with `v=DMARC1; p=none; rua=mailto:…`, then move to p=quarantine after monitoring.",
    run: (s) => {
      const net = s.intelligence?.signals.network;
      if (!net) return null;
      if (net.dmarc.present) return { status: "pass", summary: "DMARC record is published.", evidence: [{ label: "Record", value: net.dmarc.records[0] ?? "" }] };
      return { status: "warn", summary: "No DMARC record.", evidence: [] };
    },
  },
  {
    id: "permissions-policy",
    title: "Permissions-Policy header",
    category: "security",
    weight: 0.2,
    whyItMatters: "Permissions-Policy gates browser features (camera, geolocation) for embedded contexts. Optional, but a defense-in-depth control.",
    howToFix: "Add a Permissions-Policy header denying features you don't use.",
    run: (s) => {
      const pp = s.intelligence?.signals.security.permissionsPolicy;
      if (!s.intelligence) return null;
      if (pp) return { status: "pass", summary: "Permissions-Policy is set.", evidence: [{ label: "Header", value: pp }] };
      return { status: "info", summary: "No Permissions-Policy header.", evidence: [] };
    },
  },
];
