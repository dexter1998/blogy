declare module "whois-json" {
  interface WhoisOptions {
    follow?: number;
    timeout?: number;
    server?: string;
  }
  function whois(
    domain: string,
    options?: WhoisOptions,
  ): Promise<Record<string, unknown>>;
  export default whois;
}
