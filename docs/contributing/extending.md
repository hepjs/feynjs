# Extending feynjs

The common changes, step by step. Each ends with `npm test && npm run typecheck` and, for anything
visible, a look at the preview sheet ([Testing](testing.md)).

## Add a particle

One line in `src/particles/registry.ts`, using the helpers there:

```ts
"Zd": wave("Z_d"),                // a dark photon: a wave labelled Z_d
"sneutrino": susy("dash", "\\tilde\\nu"),
```

Then regenerate the [Particles](../reference/particles.md) page:
`npm run build && node scripts/gen-reference.mjs`. A particle needed by one page only can be added
at run time with [`registerParticle`](../reference/api.md#registerparticle) instead.

## Add a line style

1. Add the kind to `LineKind` in `src/model.ts`.
2. Draw it in `src/render/lines.ts` (`drawLine`), and give it a clearance in `halfWidth`.
3. Put its sizes in `LineLook` in `src/theme.ts`, each with a comment.
4. Name it in `STYLES` in `src/particles/registry.ts`.
5. Add it to `examples/lines.feyn` and to [Lines and particles](../guide/lines.md).

## Add a vertex shape

1. Add it to `VertexShape` in `src/model.ts`.
2. Add its keyword to `SHAPES` in `src/parse/parse.ts`.
3. Draw it in `src/render/vertices.ts`, with its size in `VertexLook`.
4. Add it to [Vertices and blobs](../guide/vertices.md).

## Add a switch

A `name: value` line is stored in `diagram.directives` by the parser. Read it where it matters
(drawing switches in `src/render/edge-styles.ts`, layout switches in `src/render/render.ts`), and
add it to [Panels and switches](../guide/panels.md) and the [syntax reference](../reference/index.md).

## Change the layout

**v1:** add a named step in `src/engines/rules/` and call it from `layout.ts`. Put its numbers in
`LayoutRules`, then run `node scripts/list-rules.mjs` to update the rules page.

**v2:** add a force in `src/engines/forces/forces.ts` and a weight in `ForceRules`. Prefer a few
general forces to many special cases.

Either way, add a diagram that shows the change to `examples/` and a test to `test/`.

## Extend the process syntax

`src/parse/chains.ts` turns process lines into edges. A change there needs a test in
`test/feynjs.test.ts`, and an example in [Processes](../guide/processes.md).
