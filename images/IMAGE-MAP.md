# SPN Website Image Map

Source: `OneDrive_2026-06-18.zip` → `images/SPN WEBSITE IMAGES/` (organised by page → section).
All source photos have been copied and renamed web-safe into the `images/` subfolders below.
3 `Screenshot ….png` files in the source pack are **skipped** (placeholders / notes, not final assets).

> Status: **fully mapped and wired**. All HTML pages reference local `images/` paths.
> No Figma asset URLs remain in any page.
>
> ⚠️ Many source images are full-resolution (6–21 MB).
> Run `sips -Z 1600 <file>` on any image before deploying if page-load speed is a concern.

---

## Complete Mapping

### Home — `index.html`

| Dest file | Source (in `SPN WEBSITE IMAGES/`) | Section | HTML slot |
|---|---|---|---|
| `images/home/hero.jpg` | `HOMEPAGE/hero/Sikh Professionals Network.jpg` | Hero | `index.html:469` |
| `images/home/benefits.jpg` | `HOMEPAGE/Benefits Section/Sikh Mentorship Seminar Mar 19 2026.jpg` | Benefits photo | `index.html:560` |
| `images/home/stats.jpg` | `HOMEPAGE/STATS/stats.jpg` | Stats band | `index.html:672` |
| `images/home/footer-cta.jpg` | `HOMEPAGE/FOOTER/Join the Sikh Professionals Network.jpg` | Join CTA band | `index.html:759` |

### About — `about.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/about/hero.jpg` | *(bespoke — PNG renamed .jpg, 2000×1121)* | Hero | `about.html:440` |
| `images/about/who-are-we.jpg` | `ABOUT/WHO ARE WE/Sikh Businessman Turban Jan 7 2026.jpg` | "Who We Are?" | `about.html:481` |
| `images/about/our-story.png` | `About Our Story .png` (final design) | "Our Story" | `about.html:506` |
| `images/about/stats-bg.jpg` | `ABOUT/stats/Financial Charts Data Visualizations Mar 18 2026.jpg` | Stats band | *(on disk; `about.html:636` uses `home/stats.jpg` — wire here if needed)* |
| `images/about/footer-cta.jpg` | `ABOUT/FOOTER/BE PART OF SPN .jpg` | Join CTA band | `about.html:682` |

### Advisors — `advisors.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/advisors/community.jpg` | `ADVISORS/A Trusted Sikh Professional Community/business-meeting-with-colleagues-discussing-docume-2026-03-18-13-38-30-utc.jpg` | Community photo | `advisors.html:389` |
| `images/advisors/what-advisors-offer.jpg` | `ADVISORS/WHAT ADVISOR OFFER/Sikh Businessman Discussion Jan 7 2026.jpg` | What advisors offer | `advisors.html:399` |
| `images/advisors/footer-cta.jpg` | `ADVISORS/FOOTER/Support the Next Generation.jpg` | Dual CTA band | `advisors.html:601` |

### Network — `network.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/network/community.jpg` | `NETWORK/connect with us/Sikh Businessman Meeting Photo Mar 18 2026.jpg` | "Connect with us" photo | `network.html:755` |
| `images/network/stats-bg.jpg` | `NETWORK/stats/Financial Charts Data Visualizations Mar 18 2026.jpg` | Stats band bg | `network.html:598` |
| `images/network/member-benefits.png` | `Network Above Benefits.png` (final design) | Member Benefits banner | `network.html:641` |
| `images/network/join-cta.jpg` | *(bespoke — no matching source folder)* | Join CTA band | `network.html:678` |
| `images/network/footer-cta.jpg` | `NETWORK/FOOTER/BE PART OF SPN.jpg` | Footer area | *(on disk; not currently in a `<img>` — may be used via CSS bg)* |

### Events — `events.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/events/upcoming-professional-networking-evening.jpg` | `EVENTS/UPCOMING EVENTS/Professional Networking Evening.jpg` | Upcoming card | `events.html:591` |
| `images/events/upcoming-careers-and-identity-webinar.jpg` | `EVENTS/UPCOMING EVENTS/Careers and Identity Webinar.jpg` | Upcoming card | `events.html:607` |
| `images/events/upcoming-panel-discussion.jpg` | `EVENTS/UPCOMING EVENTS/Panel Discussion.jpg` | Upcoming card | `events.html:626` |
| `images/events/upcoming-professional-insight-day.jpg` | `EVENTS/UPCOMING EVENTS/Professional Insight Day.jpg` | Upcoming card | `events.html:642` |
| `images/events/featured-grad-awards.jpg` | `EVENTS/sikh gradaute awards/South Asian business professionals meeting.jpg` | Featured event card — Sikh Graduate Awards | `events.html:554` |
| `images/events/featured-parliament-day.jpg` | *(bespoke — no matching source folder)* | Featured event card — Parliament Day | `events.html` |
| `images/events/featured-awards.jpg` | *(bespoke — no matching source folder)* | Featured event card — SPN Awards | `events.html` |
| `images/events/banner.jpg` | `EVENTS/BANNER BELOW FEATURED EVENTS/Diverse Professionals Meeting Mar 17 2026.jpg` | Photo banner below featured | `events.html:662` |
| `images/events/footer-cta.jpg` | `EVENTS/FOOTER/FOOTER .jpg` | "Attend" CTA band | `events.html:726` |

### Sikh Graduate Awards — `grad-awards.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/grad-awards/hero.jpg` | `images/Graduate Awards /Sikh Graduate Awards main card image.jpg` *(in-repo, outside SPN WEBSITE IMAGES)* | Hero | `grad-awards.html:433` |
| `images/events/footer-cta.jpg` | *(shared with Events)* | Nominate CTA band | `grad-awards.html:663` |

### Join — `join.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/join/contact.png` | `Contact Us.png` (final design) | Contact | `join.html:382` |
| `images/join/stay-in-the-loop.jpg` | `JOIN/News letter/STAY IN THE LOOP.jpg` | "Stay in the loop" newsletter | `join.html:570` |

### Blog — `blog.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/blog/thumbnail-1.jpg` | *(bespoke)* | Article card | `blog.html:147,186` |
| `images/blog/thumbnail-2.jpg` | *(bespoke)* | Article card | `blog.html:160,199` |
| `images/blog/thumbnail-3.jpg` | *(bespoke)* | Article card | `blog.html:173,212` |
| `images/blog/benefit-section.jpg` | `BLOG/BENEFIT SECTION/BENEFIT SECTION.jpg` | Benefit band | *(on disk; no matching section on current blog page — hold for future)* |
| `images/blog/footer-cta.jpg` | `BLOG/FOOTER/FOOTER .jpg` | Footer CTA | *(on disk; no photo-band CTA on current blog page — hold for future)* |

### Blog Article — `blog-article.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/blog/article-hero.jpg` | *(bespoke)* | Article hero | `blog-article.html` |
| `images/blog/article-subscribe.jpg` | *(bespoke)* | Subscribe band | `blog-article.html` |

### Offers — `offers.html`

| Dest file | Source | Section | HTML slot |
|---|---|---|---|
| `images/offers/image.jpg` | *(bespoke — no `OFFERS/` folder in source pack)* | Offer image | `offers.html:311` |

---

## Shared / Global

| File | Used by |
|---|---|
| `images/spn-logo.png` | Nav bar — all pages |
| `images/spn-logo-white.png` | Footer — all pages |
| `images/footer/logo-mark.svg` | Footer logo mark |
| `images/footer/icon-facebook.svg` | Footer social |
| `images/footer/icon-instagram.svg` | Footer social |
| `images/footer/icon-linkedin.svg` | Footer social |
| `images/footer/icon-twitter.svg` | Footer social |

---

## Skipped source files (3 screenshots)
- `ADVISORS/FOOTER/Screenshot 2026-06-11 at 11.31.09 am.png`
- `EVENTS/BANNER BELOW FEATURED EVENTS/Screenshot 2026-06-11 at 11.58.43 am.png`
- `NETWORK/FOOTER/Screenshot 2026-06-11 at 11.35.13 am.png`

## Stale / superseded files (safe to delete)
- `images/network/benefits-banner.png` — replaced by `member-benefits.jpg`
- `images/network/stats-bg.png` — replaced by `stats-bg.jpg`
- `images/Graduate Awards /` — source copy; canonical web version is `images/grad-awards/hero.jpg`

## Optimisation note
Source files range from 2–21 MB. Web-optimised targets:
- Hero / full-bleed: `sips -Z 1920 <file>` or 1600px
- Cards / thumbnails: `sips -Z 800 <file>`
