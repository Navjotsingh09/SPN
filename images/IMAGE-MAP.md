# SPN Website Image Map

Source: `OneDrive_2026-06-11.zip` → `SPN WEBSITE IMAGES/` (organized by page → section).
24 photos were extracted and renamed web-safe into this `images/` folder.
3 `Screenshot ….png` files were **skipped** (placeholders/notes, not final assets).

> Status: **extracted + mapped only**. No HTML has been edited yet. The site
> still references the original images via ephemeral Figma asset URLs
> (`figma.com/api/mcp/asset/…`), which can expire — these local files are the
> permanent replacements, ready to wire in.

---

## Mapping (extracted file → destination)

Legend: **selector** = element to repoint; **line** = current line in that page;
**replaces** = the Figma asset id (or local file) currently in that slot.

### Home — `index.html`
| Local image | Section | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/home/hero.jpg` | Hero | `.hero-bg img` | 475 | `ad7b7173-…` |
| `images/home/benefits.jpg` | Benefits photo | `.benefits-photo img` | 566 | `7a7109f7-…` |
| `images/home/stats.jpg` | Stats band | `.stats-bg img` | 678 | `files/stats_bg.png` (local) |
| `images/home/footer-cta.jpg` | Join CTA band | `.join-cta-bg img` | 765 | `bf5c81f1-…` |

### About — `about.html`
| Local image | Section | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/about/who-are-we.jpg` | "Who We Are?" | `.about-wwa .about-photo img` | 487 | `9a42716f-…` |
| `images/about/our-story.jpg` | "Our Story" | `.about-story .about-photo img` | 496 | `9a42716f-…` |
| `images/about/footer-cta.jpg` | Join CTA band | `.join-cta-bg img` | 688 | `37fa89b6-…` |

### Advisors — `advisors.html`
| Local image | Section | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/advisors/community.jpg` | "A Trusted Sikh Professional Community" | `.adv-photo-frame img` | 400 | `255e7de1-…` |
| `images/advisors/what-advisors-offer.jpg` | What advisors offer | `.benefits-photo img` | 410 | `45ce1e72-…` |
| `images/advisors/footer-cta.jpg` | Dual CTA band | `.adv-dual-cta-bg img` | 612 | `b05dd474-…` |

### Network — `network.html`
| Local image | Section | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/network/community.jpg` | "A Community of Sikh Professionals" | `.about-photo img` | 521 | `9a42716f-…` |
| `images/network/footer-cta.jpg` | Join CTA band | `.join-cta-bg img` | 770 | `37fa89b6-…` |

### Events — `events.html`
Note: the live page currently reuses just **two** placeholder images across all
six cards (alternating `e0a9ec30` / `ea0fc7b1`). Each card gets its own source
image below, matched by card title.
| Local image | Card | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/events/upcoming-professional-networking-evening.jpg` | "SPN Professional Networking Evening" | `.event-card-bg img` | 448 | `e0a9ec30-…` |
| `images/events/upcoming-careers-and-identity-webinar.jpg` | "Careers and Identity Webinar" | `.event-card-bg img` | 464 | `ea0fc7b1-…` |
| `images/events/upcoming-panel-discussion.jpg` | "SPN Panel Discussion" | `.event-card-bg img` | 483 | `e0a9ec30-…` |
| `images/events/upcoming-professional-insight-day.jpg` | "Professional Insight Day" | `.event-card-bg img` | 499 | `ea0fc7b1-…` |
| `images/events/featured-parliament-day.jpg` | "Parliament Day" | `.event-card-bg img` | 532 | `e0a9ec30-…` |
| `images/events/featured-awards.jpg` | "SPN Awards" | `.event-card-bg img` | 548 | `ea0fc7b1-…` |
| `images/events/banner.jpg` | Photo banner below featured | `.photo-banner img` | 568 | `121e6939-…` |
| `images/events/footer-cta.jpg` | "Attend" CTA band | `.attend img` | 632 | `e048c9b1-…` |

### Join — `join.html`
| Local image | Section | Selector | Line | Replaces |
|---|---|---|---|---|
| `images/join/contact.jpg` | Contact | `.contact img` | 342 | `37fa89b6-…` |
| `images/join/stay-in-the-loop.jpg` | "Stay in the loop" newsletter | `.newsletter img` | 467 | `70c6210c-…` |

### Blog — `blog.html`
| Local image | Intended section | Status |
|---|---|---|
| `images/blog/benefit-section.jpg` | "Benefit" section | **No matching section** on the current blog page (it's an article-card listing only). Hold for a future benefit band, or add the section. |
| `images/blog/footer-cta.jpg` | Footer CTA band | **No matching section** on the current blog page (footer is the shared `files/footer.html`, which has no photo band). Hold for future use. |

---

## Skipped (3 screenshots)
- `ADVISORS/FOOTER/Screenshot 2026-06-11 at 11.31.09 am.png`
- `EVENTS/BANNER BELOW FEATURED EVENTS/Screenshot 2026-06-11 at 11.58.43 am.png`
- `NETWORK/FOOTER/Screenshot 2026-06-11 at 11.35.13 am.png`

## Not covered by the source folder (still Figma-only)
These slots have **no** corresponding image in the source pack, so they stay on
Figma URLs unless new assets are supplied:
- Nav logo marks (`.nav-logo-mark img`) and the shared footer logo/social icons
- Partner/affiliate logos in the `.logo-bar` strips
- All decorative icons & arrows (`.benefit-icon`, `.stat-arrow`, `.feature-arrow`, `.about-cv-arrow`, `.about-tc-icon`, `.adv-tc-arrow`)
- Home **feature-card** photos (3): `f2c75c53`, `f4ea5e67`, `38f8773f`
- About/Network **hero** backgrounds (`70c6210c`) and **stats band** (`45bb54ea`)
- About **Our Values** CV-card photos (`8763365b`, `2aefecf2`, `69d170ae`, `51de87d0`, `e092cff0`)
- Advisors **testimonial card** photos (`b57a5aee`, `091d8c00`, `9645a879`)
- Blog **article thumbnails** (`d7e9a55c`, `3abc45e3`, `cc9f99ed`)
- Blog-article hero/subscribe (`a5e2f4df`, `7895d591`)
- Offers page photos (`d7bde25e`) — no `OFFERS/` folder in the source pack

## Recommendation before wiring
The extracted JPGs are full-resolution (~207 MB total; several are 13–22 MB).
These should be downsized/compressed (e.g. ~1600–2000px wide, web-optimized
JPEG/WebP) before being referenced, or the pages will load very slowly.
