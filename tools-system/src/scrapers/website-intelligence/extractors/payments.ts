import type { IntelligenceContext } from "../core/engine";
import { findMatches, type Pattern } from "../core/fingerprint";
import type { PaymentSignals } from "../types";

const PATTERNS: Pattern[] = [
  {
    name: "Razorpay",
    scriptSrc: [/checkout\.razorpay\.com/i, /razorpay\.com\/v1/i],
    inline: [/razorpay/i],
    html: [/razorpay/i],
  },
  {
    name: "Stripe",
    scriptSrc: [/js\.stripe\.com/i, /checkout\.stripe\.com/i, /m\.stripe\.com/i],
    inline: [/Stripe\(['"]pk_(live|test)_/i, /stripe\.elements/i],
  },
  {
    name: "PayPal",
    scriptSrc: [/paypal\.com\/sdk\/js/i, /paypalobjects\.com/i],
    html: [/paypal\.com\/sdk/i, /paypal-button-container/i],
  },
  {
    name: "Cashfree",
    scriptSrc: [/sdk\.cashfree\.com/i, /payments\.cashfree\.com/i],
    inline: [/cashfree/i],
  },
  {
    name: "Paddle",
    scriptSrc: [/cdn\.paddle\.com/i],
    inline: [/Paddle\.Setup/i],
  },
  {
    name: "Lemon Squeezy",
    scriptSrc: [/lemonsqueezy\.com\/js/i, /lemon\.js/i],
    html: [/lemonsqueezy\.com/i],
  },
  {
    name: "PhonePe",
    scriptSrc: [/phonepe\.com/i],
    html: [/phonepe/i],
  },
  {
    name: "Paytm",
    scriptSrc: [/paytm\.com\/merchantpgpui/i, /securegw\.paytm\.in/i],
    html: [/paytm/i],
  },
  {
    name: "Square",
    scriptSrc: [/squarecdn\.com/i, /web\.squarecdn\.com/i],
  },
  {
    name: "Braintree",
    scriptSrc: [/js\.braintreegateway\.com/i],
  },
  {
    name: "Adyen",
    scriptSrc: [/checkoutshopper-live\.adyen\.com/i, /adyen\.com\/checkoutshopper/i],
  },
  {
    name: "Klarna",
    scriptSrc: [/x\.klarnacdn\.net/i, /klarna\.com\/checkout/i],
  },
  {
    name: "Mercado Pago",
    scriptSrc: [/sdk\.mercadopago\.com/i, /www\.mercadopago\.com\/v2/i],
  },
];

export function extractPayments(ctx: IntelligenceContext): PaymentSignals {
  const found = findMatches(ctx, PATTERNS);
  return {
    detected: found.map((f) => f.name),
    evidence: found.flatMap((f) =>
      f.matches.map((m) => ({ provider: f.name, via: m.via, sample: m.sample })),
    ),
  };
}
