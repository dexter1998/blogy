export type DnsRecord = {
  /** A records (IPv4) */
  a: string[];
  /** AAAA records (IPv6) */
  aaaa: string[];
  /** MX hostnames */
  mx: string[];
  /** Joined TXT records */
  txt: string[];
  /** SPF TXT record present */
  hasSpf: boolean;
  /** DMARC TXT record present at _dmarc.<domain> */
  hasDmarc: boolean;
};
