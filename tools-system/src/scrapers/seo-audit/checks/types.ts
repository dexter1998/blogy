/**
 * Check authoring contract.
 *
 * A `Check` is a pure function from `Signals` to a `CheckOutcome`. The
 * runner fills in the `id`, `category`, `weight`, default `whyItMatters`,
 * and default `howToFix` from the check definition so authors only have
 * to think about logic + the one-line summary + evidence.
 *
 * Return `null` when there's no signal data to evaluate — the runner
 * marks the check as `skipped` automatically.
 */

import type { CheckEvidence, CheckStatus, Signals, CategoryId } from "../report-types";

export type CheckOutcome = {
  status: CheckStatus;
  summary: string;
  evidence: CheckEvidence[];
  /** Optional override of the default whyItMatters from the def. */
  whyItMatters?: string;
  /** Optional override of the default howToFix from the def. */
  howToFix?: string;
  affectedUrls?: string[];
};

export type CheckDef = {
  id: string;
  title: string;
  category: CategoryId;
  /** Relative weight inside the category. Default 1. */
  weight?: number;
  /** Default copy — runner uses this if the check returns one without it. */
  whyItMatters: string;
  /** Generic fix advice — overrideable per outcome. */
  howToFix: string;
  /** Evaluate the check. Return `null` when no signal data is available. */
  run: (s: Signals) => CheckOutcome | null;
};
