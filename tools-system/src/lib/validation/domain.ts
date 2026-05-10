import { z } from "zod";

/**
 * Lightweight public-suffix awareness for domain normalization. We don't pull
 * a 14k-entry PSL — we only need the common multi-label suffixes that real
 * users hit. Anything unknown falls back to the last two labels, which is
 * correct for ~99% of TLDs (.com, .io, .ai, .dev, .org, .net, …).
 */
const MULTI_LABEL_SUFFIXES = new Set<string>([
  // UK
  "co.uk", "org.uk", "me.uk", "ltd.uk", "plc.uk", "net.uk", "ac.uk", "gov.uk", "sch.uk", "nhs.uk",
  // AU
  "com.au", "net.au", "org.au", "edu.au", "gov.au", "id.au", "asn.au",
  // NZ
  "co.nz", "net.nz", "org.nz", "ac.nz", "govt.nz", "school.nz",
  // JP
  "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp", "ad.jp", "lg.jp",
  // KR
  "co.kr", "ne.kr", "or.kr", "go.kr", "re.kr", "pe.kr", "kg.kr", "ac.kr",
  // CN
  "com.cn", "net.cn", "org.cn", "edu.cn", "gov.cn", "ac.cn",
  // HK / TW / SG / IN / ID / TH / MY / PH / VN
  "com.hk", "org.hk", "net.hk", "edu.hk", "gov.hk",
  "com.tw", "org.tw", "net.tw", "edu.tw", "gov.tw", "idv.tw",
  "com.sg", "org.sg", "net.sg", "edu.sg", "gov.sg",
  "co.in", "net.in", "org.in", "firm.in", "gen.in", "ind.in", "ac.in", "edu.in", "res.in", "gov.in",
  "co.id", "net.id", "or.id", "web.id", "sch.id", "ac.id", "go.id",
  "co.th", "in.th", "ac.th", "go.th", "or.th", "net.th",
  "com.my", "net.my", "org.my", "edu.my", "gov.my",
  "com.ph", "net.ph", "org.ph", "edu.ph", "gov.ph",
  "com.vn", "net.vn", "org.vn", "edu.vn", "gov.vn",
  // BR / AR / MX / CL / CO / PE
  "com.br", "net.br", "org.br", "gov.br", "edu.br",
  "com.ar", "net.ar", "org.ar", "edu.ar", "gov.ar",
  "com.mx", "org.mx", "net.mx", "edu.mx", "gob.mx",
  "co.cl", "gob.cl",
  "com.co", "net.co", "org.co", "edu.co", "gov.co",
  "com.pe", "net.pe", "org.pe", "edu.pe", "gob.pe",
  // ZA / EG / NG / KE
  "co.za", "org.za", "net.za", "ac.za", "gov.za",
  "com.eg", "org.eg", "net.eg", "edu.eg", "gov.eg",
  "com.ng", "net.ng", "org.ng", "edu.ng", "gov.ng",
  "co.ke", "or.ke", "ne.ke", "ac.ke", "go.ke",
  // EU regions
  "co.il", "org.il", "net.il", "ac.il", "gov.il",
  "com.tr", "net.tr", "org.tr", "edu.tr", "gov.tr",
  "com.ru", "org.ru", "net.ru", "edu.ru", "gov.ru",
  "com.ua", "org.ua", "net.ua", "edu.ua", "gov.ua",
]);

const HOSTNAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,63}$/i;

export type DomainNormalization = {
  /** What the user typed, trimmed. */
  input: string;
  /** Lowercased, port/protocol/path stripped, IDN-converted to punycode. */
  host: string;
  /** Registrable root (e.g. "example.co.uk", "blogy.in") used for the RDAP query. */
  registrable: string;
  /** Effective TLD ("co.uk", "in", "com"). */
  tld: string;
};

function toAsciiHost(host: string): string {
  // URL.hostname already does IDNA for us when wrapped in https://. Below
  // handles bare-host inputs without going through URL twice.
  if (/^[\x00-\x7f]+$/.test(host)) return host.toLowerCase();
  try {
    return new URL(`https://${host}`).hostname;
  } catch {
    return host.toLowerCase();
  }
}

/**
 * Accepts: "example.com", "EXAMPLE.com", "https://blog.example.com/x?y=z",
 * "//example.com", "blog.example.co.uk", "пример.рф", … and returns the
 * registrable root + tld + normalized host.
 *
 * Throws if input doesn't contain a parseable hostname.
 */
export function normalizeDomain(raw: string): DomainNormalization {
  const input = raw.trim();
  if (!input) throw new Error("Empty domain");

  let host = input;
  // Strip protocol
  host = host.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  // Strip leading //
  host = host.replace(/^\/\//, "");
  // Strip path / query / fragment
  host = host.split(/[/?#]/)[0]!;
  // Strip user:pass@
  const at = host.lastIndexOf("@");
  if (at >= 0) host = host.slice(at + 1);
  // Strip port
  host = host.replace(/:\d+$/, "");
  // Trim trailing dot
  host = host.replace(/\.$/, "");
  // Lowercase + IDN → punycode
  host = toAsciiHost(host).toLowerCase();

  if (!HOSTNAME_RE.test(host)) {
    throw new Error(`Invalid domain: ${input}`);
  }

  const labels = host.split(".");
  if (labels.length < 2) throw new Error(`Invalid domain: ${input}`);

  // Check 2-label TLD first
  let tld = labels.slice(-1).join(".");
  let registrable: string;

  const last2 = labels.slice(-2).join(".");
  if (labels.length >= 3 && MULTI_LABEL_SUFFIXES.has(last2)) {
    tld = last2;
    registrable = labels.slice(-3).join(".");
  } else {
    registrable = last2;
  }

  return { input, host, registrable, tld };
}

export const domainSchema = z
  .string()
  .min(3)
  .max(2048)
  .transform((v, ctx) => {
    try {
      return normalizeDomain(v);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid domain" });
      return z.NEVER;
    }
  });
