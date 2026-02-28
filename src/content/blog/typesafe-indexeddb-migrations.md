---
title: "Typesafe IndexedDB Migrations"
date: 2026-02-28
---

I feel a certain cognitive dissonance when working with IndexedDB in Typescript.

> Aside: let's refer to it as IDB from now on, the browser-native database, not
> to be confused with [`idb`](https://github.com/facebook/idb), a third-party
> wrapper library around it

On the one hand, when thinking in Typescript mode I have all the tools at my
disposal to model data and its transformations with incredible precision and
fidelity.

That mindset carries over to reasoning about the database after it's opened. I
have a database schema type. I know valid names of every object store and get
autocomplete for them. Within those I know not only the shape of those rows but
even the names of indexes configured on them.

The cracks start to show when I need to add a new database version.
Unfortunately that's something that happens early and often. During dev it's not
so bad, I can just update the schema and move on. Maybe I even delete the old
migration code, wipe my local DB, and just pretend it was all one version from
the get-go.

Once this database has shipped in prod it dials up the stress a notch. Now I
can't delete the old version migration code because it's already out there in
the wild. It might be cached on a CDN somewhere still being served days or weeks
later. Wiping the database is not an option now because my users' precious data
is in there. That means I need to be extra careful with the subsequent
migrations.

This is exactly the moment when I'd want Typescript to have my back, and let me
know if I'm referencing a property in v5 that was deleted back in v3. Or if a
property that I claimed was going to be there is actually missing because I
added it as non-optional without specifying any kind of fallback or migration
when it was introduced.

The core problem here (which can no longer be avoided now and must be reasoned
about) is that the entire schema I declare for my database is just one great big
`as` cast. There's a second source of truth present in the codebase, which is
the actual series of version migrations which construct the database meant to
satisfy that schema. There's absolutely nothing at compile time which will flag
if that goes awry.