# Parked ideas

Things that were built, then deliberately removed from the current direction — not lost. Full working code for each is recoverable from git history at the commit noted.

---

## Curated hidden spots + human-fired notifications

**Built and fully verified at commit [`b2c2d2c`](../../commit/b2c2d2c)** ("Add gated hidden spots + subscription — the paid layer, architecturally real"), then removed when the paid-tier direction changed.

**What it was:** A small set of admin-curated "secret" breaks (`hidden_spots` table), gated behind a per-subscriber bearer token issued on `/api/subscribe` (email in, token out, payment stubbed). An operator endpoint (`X-Operator-Secret` header) let a human mark a spot as "firing," and a subscriber-side panel polled `/api/hidden-spots` every 15s and surfaced an in-app alert when something lit up.

**Why it was parked, not just replaced:** The updated build brief states the paid unit directly:

> The paid unit is not "secret spots" (weak: decays when sold, annoys locals, few exist). The paid unit is capability: point at an arbitrary coordinate and receive a real verdict there.

A fixed curated list of secret spots is a depleting asset — it decays as spots get shared, it doesn't scale past however many the operator personally knows, and it puts the product in the position of gatekeeping specific places rather than selling an analysis capability. That's a real critique, not just a preference, so this model was removed rather than kept running alongside the new one.

**What's still worth keeping from it:** The mechanics were sound and may resurface as a *component* rather than the whole product:

- The human-in-the-loop "operator marks it firing" pattern is a legitimate **ground-truth signal** — it could plug into the Step 4 conditions seam as one optional source feeding a private spot's fusion (a human on-site confirming what the projection guessed), the same way a future camera feed or edge device would.
- The bearer-token-on-subscribe entitlement pattern (issue a token immediately, payment stubbed, real boundary from day one) is a reasonable shape for public subscriber auth later, once the admin-only gate in the current private-spots feature needs to open up to real users.
- The 401-fail-closed header-secret pattern (`if not expected or header != expected: raise 401`) is reused as-is for the new admin gate (`ADMIN_SECRET` instead of `OPERATOR_SECRET`) — this part didn't get thrown away, just renamed and repurposed.

If a curated/human-observed layer comes back, it should come back as one input into the fusion engine for a spot someone already created — not as its own separate product surface.
