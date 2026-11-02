# Social share and message-card templates

Live URL: <https://esp046-cyber.github.io/apexgrid/>
Preview image: <https://esp046-cyber.github.io/apexgrid/social/og-image.png> (1200×630) and <https://esp046-cyber.github.io/apexgrid/social/og-square.png> (600×600)

All platforms read the tags in `social/og-meta-tags.html`. Paste those into `index.html`, deploy, then test.

## What each platform reads

| Platform | Reads | Card type | Notes |
|---|---|---|---|
| WhatsApp | Open Graph | Image, title, description | Keep image under about 300 KB (ours is about 35 KB). No official cache purge: add `?v=2` to the URL to force a fresh preview. |
| Telegram | Open Graph | Large image preview | Refresh a stale preview by messaging the link to `@WebpageBot`. |
| Messenger / Facebook | Open Graph | Large image card | Re-scrape at <https://developers.facebook.com/tools/debug/>. |
| Discord | Open Graph + `theme-color` | Embed with accent stripe | The stripe uses the `theme-color` meta value (`#0d0f12`, near-black). Set it to `#e10600` if you prefer a red stripe, but that also tints the browser UI on Android. |
| X (Twitter) | `twitter:*` tags, falls back to Open Graph | `summary_large_image` | No public card validator is offered; compose a post to preview. |
| Slack | Open Graph, falls back to Twitter tags | Unfurl | Appears automatically when a link is posted. |

## Message templates

**WhatsApp / Telegram / Messenger (text before the link)**

> ApexGrid: F1 2026 Abu Dhabi GP preview (4–6 Dec), 2026 tech specs and the monthly Top 10 drivers. Installable, works offline.

**X / Twitter (about 160 characters plus link)**

> Antonelli is already champion. Who takes P2 at Abu Dhabi? Top 10 standings, 2026 tech specs and the Yas Marina preview, in an offline-ready F1 PWA: https://esp046-cyber.github.io/apexgrid/

**Discord (paste the bare link; the embed does the rest)**

> https://esp046-cyber.github.io/apexgrid/

**Slack**

> :checkered_flag: ApexGrid is live: Abu Dhabi GP preview, the 2026 power-unit rules explained, and the monthly Top 10 standings. https://esp046-cyber.github.io/apexgrid/

## One-tap share URLs (already URL-encoded)

- WhatsApp: <https://wa.me/?text=ApexGrid%3A%20F1%202026%20Abu%20Dhabi%20GP%20preview%20%284%E2%80%936%20Dec%29%2C%202026%20tech%20specs%20and%20the%20monthly%20Top%2010%20drivers.%20Installable%2C%20works%20offline.%20https%3A%2F%2Fesp046-cyber.github.io%2Fapexgrid%2F>
- Telegram: <https://t.me/share/url?url=https%3A%2F%2Fesp046-cyber.github.io%2Fapexgrid%2F&text=ApexGrid%3A%20F1%202026%20Abu%20Dhabi%20GP%20preview%20%284%E2%80%936%20Dec%29%2C%202026%20tech%20specs%20and%20the%20monthly%20Top%2010%20drivers.%20Installable%2C%20works%20offline.>
- Facebook: <https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fesp046-cyber.github.io%2Fapexgrid%2F>
- Messenger (mobile deep link, opens the Messenger app): <fb-messenger://share/?link=https%3A%2F%2Fesp046-cyber.github.io%2Fapexgrid%2F>
- X / Twitter: <https://twitter.com/intent/tweet?text=Antonelli%20is%20already%20champion.%20Who%20takes%20P2%20at%20Abu%20Dhabi%3F%20Top%2010%20standings%2C%202026%20tech%20specs%20and%20the%20Yas%20Marina%20preview%2C%20in%20an%20offline-ready%20F1%20PWA%3A&url=https%3A%2F%2Fesp046-cyber.github.io%2Fapexgrid%2F>

Discord and Slack have no share-URL scheme; paste the link.

## Optional share button for the app

```html
<button id="share-btn" type="button">Share</button>
<script>
document.getElementById('share-btn').addEventListener('click', async () => {
  const data = {
    title: 'ApexGrid: F1 2026 Abu Dhabi GP & Top 10 Drivers Hub',
    text: 'Abu Dhabi GP preview, 2026 tech specs and the monthly Top 10 drivers.',
    url: 'https://esp046-cyber.github.io/apexgrid/'
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch (e) { /* user cancelled */ }
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(data.text + ' ' + data.url), '_blank', 'noopener');
  }
});
</script>
```

## Refreshing a stale preview

1. Confirm the image URL opens publicly in a private browser window.
2. Facebook / Messenger: re-scrape in the Sharing Debugger.
3. Telegram: send the link to `@WebpageBot`.
4. WhatsApp, Discord, X: append a version query such as `?v=2` to the URL you share.
