# Third-party material

feynjs itself is under the MIT licence (see `LICENSE.md`). The repository and its packages also
carry the following, each under its own licence.

| What | Where | Licence |
|---|---|---|
| New Computer Modern fonts (`NewCM10-Book.otf`, `NewCM10-BookItalic.otf`), the docs site's name and page titles | `docs/fonts/` | GUST Font License (LPPL-based) |
| Inter fonts, the docs site's text face | `docs/fonts/` | SIL Open Font License 1.1 (`docs/fonts/Inter-LICENSE.txt`) |
| Two Lucide icons (download, triangle-alert), drawn inline | `src/download.ts`, `src/render/render.ts` | ISC |
| Ports of fdlibm functions (sin, cos, tan, atan, atan2, acos, exp, log, pow, cbrt, cosh, tanh) | `src/geometry/portable-math.ts` (its notice is kept in the built files) | fdlibm: "Copyright (C) 1993 by Sun Microsystems, Inc. ... Permission to use, copy, modify, and distribute this software is freely granted, provided that this notice is preserved." |

## Acknowledgements

The edge syntax follows TikZ-Feynman (J. Ellis, Comput. Phys. Commun. 210 (2017) 103), and the
process syntax follows MadGraph5_aMC@NLO (J. Alwall et al., JHEP 07 (2014) 079). feynjs is an
independent implementation and contains no code from either.
