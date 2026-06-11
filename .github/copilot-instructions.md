# Copilot / AI Agent Instructions — SPN site

**Before any git or deploy command, read [`AGENTS.md`](../AGENTS.md) at the repo root. It is the source of truth for these rules.**

## Critical guardrails (summary)

This is a static site that **auto-deploys to Vercel on every push to `main`**.
`sikhpn.org` (live) and `sikhpn.vercel.app` (staging) are the **same
deployment** — one push redeploys both. The live domain only shows "Coming
Soon" because of the `redirects` block in [`vercel.json`](../vercel.json).

Do **NOT** do any of the following without the user's explicit, in-the-moment approval:

1. **`git push`** to any remote (this deploys to the live domain).
2. **Remove / disable / weaken the `redirects` block in `vercel.json`** (this
   exposes the full site on `sikhpn.org` — i.e. "goes live").
3. **Go live / launch / publish** the full site on `sikhpn.org`.
4. Trigger a deploy via Vercel CLI/dashboard/deploy hooks, or change
   domains / DNS / environment variables.

Local edits, commits, branches, local servers, and browser testing are fine.
When a push or go-live seems necessary, **stop and ask first**, clearly stating
that pushing redeploys the live `sikhpn.org` domain.

## Project notes

- Forms are wired to **Web3Forms** via [`files/forms.js`](../files/forms.js)
  (shared handler, event-delegated so it also catches the dynamically injected
  footer form). Public access key lives inline in the forms; that is expected
  and safe.
- The shared footer is fetched at runtime from
  [`files/footer.html`](../files/footer.html); pages load `files/forms.js` after
  injecting it.
