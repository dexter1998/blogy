/**
 * WhoisXML API fallback. Used only when the RDAP path returns no record
 * (some legacy ccTLDs that don't yet publish RDAP). Maps WhoisXML's JSON
 * envelope into the same RdapRecord shape the rest of the system expects,
 * so the API contract stays stable regardless of which source answered.
 *
 * Docs: https://whois.whoisxmlapi.com/documentation/making-requests
 */

import { fetchJson } from "@/providers/_shared/cached-fetch";
import { env } from "@/lib/env";
import type { RdapRecord } from "./types";

const ENDPOINT = "https://www.whoisxmlapi.com/whoisserver/WhoisService";
const FETCH_TIMEOUT_MS = 8000;

type WhoisXmlNameservers = {
  hostNames?: string[];
  ips?: string[];
};

type WhoisXmlSubRecord = {
  createdDate?: string;
  createdDateNormalized?: string;
  updatedDate?: string;
  updatedDateNormalized?: string;
  expiresDate?: string;
  expiresDateNormalized?: string;
  registrarName?: string;
  registrarIANAID?: string;
  status?: string;
  whoisServer?: string;
  nameServers?: WhoisXmlNameservers;
};

type WhoisXmlEnvelope = {
  WhoisRecord?: WhoisXmlSubRecord & {
    domainName?: string;
    estimatedDomainAge?: number;
    contactEmail?: string;
    rawText?: string;
    registryData?: WhoisXmlSubRecord;
    dataError?: string;
  };
  ErrorMessage?: { errorCode?: string; msg?: string };
};

function parseDate(s: string | undefined | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() < 1985) return null;
  return d.toISOString();
}

function pickStatus(s: string | undefined | null): string[] {
  if (!s) return [];
  // WhoisXML returns space-separated EPP codes ("clientUpdateProhibited …").
  // Convert camelCase to "client update prohibited" to match RDAP convention.
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((code) =>
      code.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(),
    );
}

function pickNameservers(ns: WhoisXmlNameservers | undefined): string[] {
  if (!ns?.hostNames) return [];
  return ns.hostNames.map((h) => h.toUpperCase()).filter(Boolean);
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

export type WhoisXmlInput = {
  domain: string;
  tld: string;
};

export async function fetchWhoisXml(
  input: WhoisXmlInput,
): Promise<RdapRecord | null> {
  if (!env.whoisXmlApiKey) return null;

  const totalStart = Date.now();
  const url = `${ENDPOINT}?apiKey=${encodeURIComponent(env.whoisXmlApiKey)}&domainName=${encodeURIComponent(input.domain)}&outputFormat=JSON`;
  const resp = await fetchJson<WhoisXmlEnvelope>(url, { timeoutMs: FETCH_TIMEOUT_MS });
  if (!resp) return null;
  if (resp.ErrorMessage) return null;

  const w = resp.WhoisRecord;
  if (!w) return null;
  if (w.dataError) return null;

  // Some TLDs put the authoritative fields under registryData; merge with
  // the top-level (top-level wins where both exist).
  const merged: WhoisXmlSubRecord = { ...(w.registryData ?? {}), ...w };

  const registration =
    parseDate(merged.createdDateNormalized) ?? parseDate(merged.createdDate);
  const updated =
    parseDate(merged.updatedDateNormalized) ?? parseDate(merged.updatedDate);
  const expiry =
    parseDate(merged.expiresDateNormalized) ?? parseDate(merged.expiresDate);

  if (!registration && !merged.registrarName && !merged.nameServers?.hostNames?.length) {
    return null;
  }

  const { ageDays, ageYears } = deriveAge(registration);

  return {
    domain: input.domain,
    normalizedDomain: w.domainName ?? input.domain,
    tld: input.tld,
    rdapServer: merged.whoisServer
      ? `whois://${merged.whoisServer}`
      : "whoisxmlapi.com",
    bootstrappedFrom: null,
    registryDomainId: null,
    registrationDate: registration,
    updatedDate: updated,
    expiryDate: expiry,
    lastChangedDate: updated,
    ageDays,
    ageYears,
    daysUntilExpiry: daysUntil(expiry),
    registrar: {
      name: merged.registrarName ?? null,
      ianaId: merged.registrarIANAID ?? null,
      url: null,
      abuseEmail: w.contactEmail ?? null,
      abusePhone: null,
    },
    nameservers: pickNameservers(merged.nameServers),
    status: pickStatus(merged.status),
    dnssec: null,
    entities: [],
    raw: resp,
    timings: {
      bootstrap: null,
      fetch: Date.now() - totalStart,
      total: Date.now() - totalStart,
    },
  };
}
