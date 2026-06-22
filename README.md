# Liquid Glass for macOS

A collection of desktop widgets for [Übersicht](https://tracesof.net/uebersicht/) that share one
Apple-style **Liquid Glass** look: real WebGL glass that refracts your wallpaper, rather than the flat
translucent cards you usually see. Each widget lives in its own focused repo. This page ties them
together.

## The widgets

| Repo | What it is |
|---|---|
| [**liquid-glass-weather**](https://github.com/sa1emie/liquid-glass-weather) | A weather card (NWS data) that opens a full forecast panel on click. |
| [**liquid-glass-discovery**](https://github.com/sa1emie/liquid-glass-discovery) | A discovery feed that pulls from many sources and has DeepSeek rank + summarize each item against a taste profile you write. |
| [**liquid-glass-ubersicht**](https://github.com/sa1emie/liquid-glass-ubersicht) | The reusable renderer the other two sit on. Drop it in and any widget can register for glass. |

Start with `liquid-glass-ubersicht` if you just want the glass for your own widgets. Start with
`weather` or `discovery` if you want a finished thing on your desktop.

## How the glass works

Übersicht runs in WebKit, where the usual web "liquid glass" trick (SVG displacement filters in
`backdrop-filter`) degrades to a plain blur and can't see the desktop. So the refraction is a WebGL
fragment shader instead: a signed-distance rounded rectangle, refraction concentrated at the rim,
chromatic aberration on the edge, a specular highlight, and a drop shadow. Übersicht can't read the
live desktop, so the shader samples the wallpaper image directly and lines the glass up with whatever
sits behind each card.

One shared renderer (`glass.widget`) does this for every widget at once, in a single WebGL context.
A widget opts in by pushing `{ getEl, radius }` onto `window.__glassRects`.

## Personal example: `today.widget`

`today.widget` is included here as my own example, not as a drop-in. It shows today's prayers (tap to
mark prayed), habits, tasks, and commitments, and it reads all of that from
[Sentinel](https://github.com/sa1emie/sentinel), my local academic command center. To actually run it
you'd need Sentinel's database plus the glass renderer, so treat it as a worked example of building a
real widget on top of the glass rather than something you'd install as-is.

## Related

- [**sentinel**](https://github.com/sa1emie/sentinel): the academic command center behind `today.widget`.
- [**auction-radar**](https://github.com/sa1emie/auction-radar): a salvage-auction watcher; an earlier version drove an auctions widget.

## License

MIT
