/**
 * RDAP (Registration Data Access Protocol) — modern JSON replacement for
 * port-43 WHOIS. We:
 *   1. consult the IANA bootstrap registry to find the authoritative RDAP
 *      base URL for the TLD (rfc7484);
 *   2. query that endpoint directly;
 *   3. fall back to https://rdap.org/domain/{name} (a community redirector)
 *      if bootstrap is unavailable or the registry endpoint fails;
 *   4. parse the JSON into our normalized RdapRecord, including events,
 *      nameservers, statuses, DNSSEC, registrar entity (with abuse contact
 *      via the sub-entity vCard), and raw payload.
 *
 * No regex parsing of plain WHOIS text — only structured RDAP responses.
 */

import { fetchJson, timed } from "@/providers/_shared/cached-fetch";
import { rdapBaseUrlsForTld } from "./bootstrap";
import type { RdapRecord } from "./types";

const RDAP_ORG_FALLBACK = "https://rdap.org/domain";
const FETCH_TIMEOUT_MS = 7000;

// ─── RDAP response shapes (only what we read) ───────────────────────────────

type RdapEvent = { eventAction: string; eventDate: string };
type RdapVcardField = [string, Record<string, unknown>, string, ...unknown[]];
type RdapVcardArray = ["vcard", RdapVcardField[]];
type RdapEntity = {
  handle?: string;
  roles?: string[];
  vcardArray?: RdapVcardArray;
  publicIds?: Array<{ type?: string; identifier?: string }>;
  entities?: RdapEntity[];
};
type RdapNameserver = { ldhName?: string; unicodeName?: string };
type RdapSecureDNS = { delegationSigned?: boolean; dsData?: unknown[] };
type RdapResp = {
  ldhName?: string;
  unicodeName?: string;
  handle?: string;
  events?: RdapEvent[];
  entities?: RdapEntity[];
  nameservers?: RdapNameserver[];
  status?: string[];
  secureDNS?: RdapSecureDNS;
  port43?: string;
  notices?: unknown;
  errorCode?: number;
};

// ─── vCard helpers ──────────────────────────────────────────────────────────

function vcardField(
  vcard: RdapVcardArray | undefined,
  field: string,
): RdapVcardField | null {
  if (!vcard || !Array.isArray(vcard) || vcard.length < 2) return null;
  const items = vcard[1];
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (Array.isArray(item) && item[0] === field) return item as RdapVcardField;
  }
  return null;
}

function vcardValue(
  vcard: RdapVcardArray | undefined,
  field: string,
): string | null {
  const f = vcardField(vcard, field);
  if (!f) return null;
  const v = f[3];
  if (typeof v === "string") return v.trim() || null;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0]!.trim() || null;
  return null;
}

// ─── Field extractors ───────────────────────────────────────────────────────

function eventDate(events: RdapEvent[] | undefined, action: string): string | null {
  if (!events) return null;
  const e = events.find((x) => x.eventAction === action);
  if (!e) return null;
  const d = new Date(e.eventDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function findRegistrarEntity(entities: RdapEntity[] | undefined): RdapEntity | null {
  if (!entities) return null;
  return entities.find((e) => e.roles?.includes("registrar")) ?? null;
}

function ianaIdFromRegistrar(reg: RdapEntity | null): string | null {
  if (!reg?.publicIds) return null;
  for (const id of reg.publicIds) {
    if (id.type?.toLowerCase().includes("iana") && id.identifier) {
      return id.identifier;
    }
  }
  return null;
}

function abuseContactFromRegistrar(reg: RdapEntity | null): {
  email: string | null;
  phone: string | null;
} {
  if (!reg?.entities) return { email: null, phone: null };
  const abuse = reg.entities.find((e) => e.roles?.includes("abuse"));
  if (!abuse) return { email: null, phone: null };
  return {
    email: vcardValue(abuse.vcardArray, "email"),
    phone: vcardValue(abuse.vcardArray, "tel"),
  };
}

function flattenEntities(entities: RdapEntity[] | undefined): RdapRecord["entities"] {
  if (!entities) return [];
  return entities.map((e) => ({
    handle: e.handle ?? null,
    roles: e.roles ?? [],
    name: vcardValue(e.vcardArray, "fn"),
    email: vcardValue(e.vcardArray, "email"),
  }));
}

function deriveAge(registration: string | null): {
  ageDays: number | null;
  ageYears: number | null;
} {
  if (!registration) return { ageDays: null, ageYears: null };
  const t = new Date(registration).getTime();
  if (Number.isNaN(t)) return { ageDays: null, ageYears: null };
  const ageDays = Math.floor((Date.now() - t) / 86_400_000);
  const ageYears = Math.round((ageDays / 365.25) * 10) / 10;
  return { ageDays, ageYears };
}

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

// ─── Single attempt ─────────────────────────────────────────────────────────

type Attempt = {
  url: string;
  source: "iana-bootstrap" | "rdap.org";
};

async function tryRdap(
  attempt: Attempt,
): Promise<{ resp: RdapResp; tookMs: number } | null> {
  const t0 = Date.now();
  const resp = await fetchJson<RdapResp>(attempt.url, {
    timeoutMs: FETCH_TIMEOUT_MS,
  });
  const tookMs = Date.now() - t0;
  if (!resp) return null;
  if (typeof resp.errorCode === "number" && resp.errorCode >= 400) return null;
  if (!resp.ldhName && !resp.handle && !resp.events && !resp.entities) return null;
  return { resp, tookMs };
}

// ─── Public ─────────────────────────────────────────────────────────────────

export type RdapInput = {
  /** Registrable domain (punycode/ASCII), e.g. "blogy.in". */
  domain: string;
  /** Effective TLD, e.g. "com" or "co.uk". */
  tld: string;
};

export async function fetchRdap(input: RdapInput): Promise<RdapRecord | null> {
  const totalStart = Date.now();

  const { value: bases, tookMs: bootstrapMs } = await timed(() =>
    rdapBaseUrlsForTld(input.tld),
  );

  const attempts: Attempt[] = [];
  for (const base of bases) {
    attempts.push({ url: `${base}/domain/${input.domain}`, source: "iana-bootstrap" });
  }
  attempts.push({ url: `${RDAP_ORG_FALLBACK}/${input.domain}`, source: "rdap.org" });

  let success: { attempt: Attempt; resp: RdapResp; tookMs: number } | null = null;
  for (const a of attempts) {
    const r = await tryRdap(a);
    if (r) {
      success = { attempt: a, ...r };
      break;
    }
  }
  if (!success) return null;

  const { resp, attempt, tookMs } = success;

  const registration = eventDate(resp.events, "registration");
  const updated = eventDate(resp.events, "last changed");
  const expiry = eventDate(resp.events, "expiration");
  const lastChanged = eventDate(resp.events, "last update of RDAP database") ?? updated;

  const registrarEntity = findRegistrarEntity(resp.entities);
  const registrarName = vcardValue(registrarEntity?.vcardArray, "fn");
  const registrarUrl = vcardValue(registrarEntity?.vcardArray, "url");
  const ianaId = ianaIdFromRegistrar(registrarEntity);
  const abuse = abuseContactFromRegistrar(registrarEntity);

  const nameservers = (resp.nameservers ?? [])
    .map((n) => (n.ldhName || n.unicodeName || "").toUpperCase())
    .filter(Boolean);

  const { ageDays, ageYears } = deriveAge(registration);

  return {
    domain: input.domain,
    normalizedDomain: resp.unicodeName ?? resp.ldhName ?? input.domain,
    tld: input.tld,
    rdapServer: new URL(attempt.url).origin,
    bootstrappedFrom: attempt.source === "iana-bootstrap" ? bases[0] ?? null : null,
    registryDomainId: resp.handle ?? null,
    registrationDate: registration,
    updatedDate: updated,
    expiryDate: expiry,
    lastChangedDate: lastChanged,
    ageDays,
    ageYears,
    daysUntilExpiry: daysUntil(expiry),
    registrar: {
      name: registrarName,
      ianaId,
      url: registrarUrl,
      abuseEmail: abuse.email,
      abusePhone: abuse.phone,
    },
    nameservers,
    status: resp.status ?? [],
    dnssec:
      typeof resp.secureDNS?.delegationSigned === "boolean"
        ? resp.secureDNS.delegationSigned
        : null,
    entities: flattenEntities(resp.entities),
    raw: resp,
    timings: {
      bootstrap: bootstrapMs || null,
      fetch: tookMs,
      total: Date.now() - totalStart,
    },
  };
}
