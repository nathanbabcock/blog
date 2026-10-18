---
title: "Building a CMS live preview with nested Astro islands"
date: 2026-10-17
draft: true
---

This story is about satisfying two opposing design goals at the same time:

1. The site should be statically rendered in production for optimal SEO and load times.
2. The site should support a dynamic live preview for editors to see their changes in real time.

A third principle, arising from the combination of these two, is:

3. Live preview and production should identical, or as similar as possible.

This third principle is essentially a non-negotiable. The entire point of live preview is visual fidelity with what content will look like once published, so any discrepancies there are sure to be problematic.

## Keeping a single source of truth

The best way to ensure that the two render paths are consistent is to ensure they're running the exact same code, as far as UI and presentation is concerned.

That means there should be a reused layer of pure UI inside both -- CMS content blocks like image + text layouts, headings, rich text paragraphs, etc. The tricky part is connecting this UI layer to the two different render paths -- static and server-rendered in production, dynamic and client-rendered in live preview.

Astro is the framework that allows us to render the same tree of content in two different modes. We can define the content blocks in React in both render paths, but in production, we render them statically (meaning no JS shipped to the client), while in live preview they can be [client islands](todo-link-to-astro-client-islands), with their props fed by the CMS live preview SDK (for example, passed in via `window.postMessage` calls if the preview is running in an `iframe` inside the CMS's editor).

## Supporting dynamic CMS blocks

Sometimes we won't know in advance exactly what CMS blocks a certain page will use, or in what order. Oftentimes editors are given a library of blocks they may mix and match in any order. At render time, we receive some tree of CMS content blocks. The idea is to traverse the same tree in two different ways. At build time we render the tree straight to static HTML; in live preview we render to hydrated React components.

While traversing that tree of nodes in either render path, the system needs to know what React component is used for each one. To answer that we create a **registry** of CMS blocks. Each render path consults this registry and renders the appriate component, according to whichever render method it uses (either static or dynamic).

This system can compose recursively, as well -- a CMS block may be populated with additional dynamic blocks inside it, all of which can be resolved by consulting the CMS registry at any level of nesting.

## Adding client-side interactivity to CMS blocks

Thus far everything we've described assumes that CMS blocks can be fully statically rendered (e.g. plain HTML with no JS) as needed. That is not always the case; sometimes a CMS block will want to bring its own client-side functionality (for example: an image carousel, a custom video player, an interactive diagram or calculator widget, or any component with interactivity).

This is one of the primary use cases that Astro's island architecture was intended to support, and in some ways it follows naturally from the architecture we are already building towards: all components in the integration already use React and support a client-side render path for the purposes of CMS live preview, so enabling that same client-side hydration to run in production too takes almost no extra work. The only change required is for the CMS registry to become aware of which components need client hydration (even in production) -- this can be as simple as a boolean `requiresClientLoad` in the registry, alongside the component mapping.

However, it introduces one extra wrinkle...

## Maintaining code splitting boundaries

There is one problem with supporting _both_ a dynamic CMS block registry _and_ client island components in production.

Suppose that there a single CMS block that needs both of those capabilities: it supports both nested dynamic components **and** has client-side functionality. (For example: a templated content section consisting of a heading, rich text intro paragraph [with optional embedded components inside it], and an interactive carousel).

Interactivity means adding the `requiresClientLoad` flag on this content block. And nested dynamic blocks means that its render method will loop back through the full CMS component registry in order to delegate to the right component for each nested block.

Unfortunately these two factors combine to mean that _at runtime_, e.g. in client-side Javascript shipped to the browser, the component must know how to render any (and every) block in the CMS registry. The end result is that the client-side JS bundle will contain the code for _every component_ used in the entire system, even if it's not used on that page. That means third party dependencies, carousel libraries, fancy WebGPU shader code to render that neat interactive visual that's used on one single page on the whole site -- every page now pays the tax of downloading and parsing that Javascript.

It's easy to make this mistake because it's essentially how the live preview render path works. It's worth noting that live preview _does_ pull in client code for the entire CMS block registry on every page, precisely _because_ it has to be able to handle anything that the editor might throw at it during an editing session, and any block is fair game. Paying the price of all that extra client runtime and bundle size is not a problem on an internal editor-facing page.

## Injecting static content into client islands

The solution is a rule of thumb:

**Never import the CMS registry in any client component**.

Anything dynamic, where the registry is consulted to map a content block type to its UI compoent, **must** be done in server-side (Astro) code, not in React.

The means, for components which need both static content and client interactivity, **the static chunks must be passed in as children**.

What we're describing here is a second level of island nesting: the top-level page is statically rendered, dotted with client-rendered islands of interactivity -- and then some of these islands themselves have a smaller chunk of static content injected inside of them: a server island within a client island.

Astro's tool for this is [slots](todo-link). It interops with React by statically rendering all the content inside the slot before passing it in; React then renders it like a chunk of static HTML.

The general principle is to push client islands as far down the tree as possible towards leaf nodes; the code-splitting problems arised from having a too-broad client island boundary which captured entire branches of descendants underneath and turned them client-rendered also, even if they didn't need to be. Instead, that same branch should render whatever static children it can in advance, and then pass them in to the client-rendered components.

## Conclusion

This solution composes nicely and it checks a lot of boxes for a CMS integration:

- [x] Server-rendered in production
- [x] Realtime live preview for editors
- [x] Single source of truth for visuals across both render paths
- [x] Dynamic embedded CMS blocks
- [x] Effective code-splitting in production so that only JS used on the page is loaded

It is only possible due to Astro's island architecture, and it is one of the rare use cases for three-level island nesting: server within client within server.
