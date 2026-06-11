# Repository Guardrails for AI Agents

> **Read this before running any git or deployment command in this repo.**
> These rules apply to GitHub Copilot, Claude, Cursor, and any other AI agent.

## Deployment model (important)

- This repo auto-deploys to **Vercel** on every push to `main`.
- **`sikhpn.org` + `www.sikhpn.org`** = the **public / live** face.
- **`sikhpn.vercel.app`** = staging / preview.
- **Both domains are the SAME Vercel deployment.** There is no separate
  "staging push" vs "live push" — a single `git push origin main` redeploys
  BOTH at once.
- The ONLY thing keeping the live domain showing "Coming Soon" (instead of the
  full site) is the host-conditioned `redirects` block in
  [`vercel.json`](vercel.json). If that block is removed or weakened, the full
  site becomes publicly visible on `sikhpn.org` immediately on the next deploy.

## HARD RULES — do NOT do these without explicit, in-the-moment user approval

1. **Never run `git push`** (or `git push --force`, or any push to a remote)
   unless the user explicitly says to push in the current request.
   Staging changes locally and committing is fine; pushing is the gate.
2. **Never remove, comment out, disable, or loosen the `redirects` block in
   `vercel.json`** (the Coming Soon gate). Doing so "goes live."
   Treat any change that would expose the full site on `sikhpn.org` as a
   go-live action requiring explicit approval.
3. **Never "go live" / "launch" / "publish the full site" on `sikhpn.org`**
   unless the user explicitly asks for it in that request.
4. **Never trigger a Vercel deploy by other means** (Vercel CLI `vercel --prod`,
   dashboard promotion, deploy hooks) without explicit approval.
5. **Never change domain settings, DNS, or environment variables** without
   explicit approval.

## What you MAY do freely

- Edit files, create branches, run local servers, test in the browser.
- `git add` and `git commit` locally.
- Read-only git/inspection (`git status`, `git log`, `git diff`, `curl` checks).

## When you believe a push or go-live is needed

Stop and ask. State plainly: "This will push to `main`, which redeploys
**both** `sikhpn.org` (live) and `sikhpn.vercel.app`. Confirm you want me to
push?" Wait for an explicit yes.

## Going live later (for reference, only when explicitly requested)

To launch the full site on `sikhpn.org`, remove the `redirects` block from
`vercel.json` and push. It's a 307 (temporary) redirect, so there are no
hard-cached redirects to fight.
