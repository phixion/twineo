# Twineo

Twineo is privacy focused alternative front-end to Twitch inspired by [Invidious](https://github.com/iv-org/invidious) and [Nitter](https://github.com/zedeus/nitter).

Twineo aims to provide:

-   No trackers: all the media is requested by the server\*, no JavaScript fingerprint or IP tracking
-   Minimal JavaScript required: we only use JavaScript to provide basic functionalities such as HLS stream and parsing search content
-   Lightweight and clear: Twitch loads a bunch of unnecessary resources, Twineo on the other hand only loads what you want.
-   Open-Source: all the source code for Twineo is fully open under AGPL, so you can inspect, modify or host by your own.

> \* WebSockets are not yet proxied.

### Proxy status:

| Feature               | Initial Request | Following requests |
| --------------------- | --------------- | ------------------ |
| Live stream           | ✅              | ✅                 |
| VOD                   | ✅              | ✅                 |
| Live stream chat (WS) | ❌              | ❌                 |
| VOD chat              | ✅              | ✅                 |
| Clip                  | ✅              | ✅                 |

## Screenshots

_A little bit empty for now_

## Instances

| URL                                         | Version      |
| ------------------------------------------- | ------------ |
| [twineo.deno.dev](https://twineo.deno.dev/) | Deno - 0.3.0 |

---

## Disclaimer

All content on Twineo, and in any of its instances, is hosted by Twitch, so any complaints (such as DMCA or content removal) should be handled by them. Twineo is also not affiliated with Twitch.
