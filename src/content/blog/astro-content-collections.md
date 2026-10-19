---
title: "API design lessons from Astro content collections"
description: "Pain points from integrating Contentful with Astro content collections, and the API design lessons they suggest."
date: 2026-05-11
draft: false
---

I found a few pain points when integrating a headless CMS, Contentful, with the
static site generator, Astro.

One of Astro's core primitives is [content
collections](https://docs.astro.build/en/guides/content-collections/). Their
hello world will get you set up with a simple markdown content loader which
syncs from markdown files on disk into a local cache that Astro manages -- it's
used by this blog at the time of writing. It syncs everything up front,
validates against a schema, and optionally handles generating type
definitions dynamically for content collections.

It seems like a natural integration point for a headless CMS -- in the content
loader, just fetch content from the third party API using REST calls, and after
that everything works as seamlessly as if it were all coming from local
markdown.

Here are just a few of the issues you may run into along that path.

## Typegen and typedefs

### Typechecking depends on data fetching

Astro provides a script to run typechecking inside their custom-syntax `.astro`
files, along with any imported/bundled `.ts` or `.tsx` files, called `astro
check`.

Since generating type definitions and loading content are tightly coupled in
this model, `astro check` must automatically run `astro sync` at the beginning.
That means that the typecheck step now requires Contentful API keys to be
present in env vars just to see if the code compiles cleanly.

In my case, this integration was one app out of many in a monorepo with a single
CI pipeline that validates all the apps at once. Introducing API key
requirements for an irrelevant third party service just adds friction to every
developer who works in the repo, and an extra requirement to juggle on CI.

There's no way to "opt out" of syncing on a per-content-collection basis, so for
a while we used a very awkward workaround by setting an env var to skip CMS
fetching during typechecking, rather than saddling every developer in the
company with Contentful API keys in perpetuity.

### Type generation is not first class

Contentful does not offer any way to generate type definitions for their
content, especially not in a way which would be conducive to Astro's content
collection type definitions. You have to roll your own scripts to do this and
use some community-maintained third party tools. Seems like a huge miss not to
support this.

### Type definitions are not code-first

The Contentful web GUI is the source of truth for content types. It's very
possible for users to break the production build on that side, for example by
making a required prop optional.

Perhaps the most thorough solution to this would be to generate not just
typedefs but full _validation schema_, so that the remote CMS data source can be
treated as a black box, and any content which the CMS is not equipped to handle
can be caught beforehand.

In my case I chose to run typegen manually, rather than through Astro's content
collections, because having at least some artifact of "source of truth for
content shape" under source control has proved to be invaluable for
debugging issues. Generating those dynamically from content collections sweeps
just a bit too much of the distributed system under the rug.

Full schema validation would certainly be better -- but again, there's no
first-class tooling for it so you're left with what exists in the open source
community, or to roll your own.

## Image bundling

### Images cannot be bundled during the content loading phase

Astro has a really stellar API for bundling images into static sites, optimizing
them, converting, generating multiple sizes, passing `img` attributes, etc.

However, none of that is available at the content loader phase. So it may
feel very natural, if Contentful is the CDN for all your content assets, that
part of the "sync remote content" step would be to acquire the images that
you'll build into your static site.

In my case, a lot of the UI components we used were React components inside
client islands, so that we can both support realtime live preview while editing
in the CMS, and SEO-optimized static output at build time.

Within client islands, image bundling is not available either. So relying on
content collections leaves you in this awkward middle ground -- you fetch raw
data in the collection loader and pass it down through the tree as props, but at
every callsite you have to remember to call the image bundling code before
passing across that client island boundary. Very easy to forget and zero
enforcement to catch it automatically.

### Building bundling into the CMS client

This works _so_ much better if you just do the data fetching inside Astro
components themselves. You lose the automatic de-duping of Astro collections, but aside
from that, you can build behaviors like image re-bundling directly into your CMS
client wrapper. By the time images get to the UI layer, they have already been
pre-processed and bundled automatically as they pass through the client wrapper.

## Misc other gripes

### Stale content

When iterating between the CMS and the frontend, content loaders make it very
easy to get stuck viewing stale content. It gets synced once when the dev server
starts, and a page reload won't do anything to update. In practice I end up
restarting the dev server every time. Maybe you could also run `astro sync
--force` in a separate terminal window but I haven't tried that.

The "fetch fresh on every page load" behavior that comes with the
fetch-at-page-level approach actually is a much more convenient default here. At
the cost of a few extra API calls during local dev you ensure that you're always
looking at the most up-to-date version of the content.

Even as I'm editing this blog post right now, the updates I'm making are not
being picked up in hot reloads. Something seems broken about it and I'm not sure
exactly what.

## Conclusion

Contentful is a particularly opinionated system, but there are some lessons about
API design here on the Astro side, especially when it comes to data fetching or
caching layers.

My two biggest takeaways are:

1. Typegen and data fetching should be orthogonal concerns. Coupling them
   together makes the system more rigid and difficult to adapt to different
   integrations which may have their own nuances and requirements around how
   this process works.
2. Arbitrary domain knowledge like "images cannot be bundled during loader
   phase" is probably something to be avoided if at all possible, since it not
   only limits the flexibility of how you can design the integration points with
   other systems, but it's completely undocumented and invisible until you try
   it.
