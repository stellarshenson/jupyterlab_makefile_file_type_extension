# Defects - jupyterlab_makefile_file_type_extension

Bugs and regressions in the Makefile file type extension.

## Authors

- `@kj` Konrad Jelen

## Language registration `LANG`

File name patterns that pick the language and the icon

- log: 2026-11-13T07:12:58Z @kj category created

- [x] `DEF-LANG-1-ENV-NAMES` **env.py highlighted as shell** - MEDIUM; dotenv file name pattern env.* claims env.py, env.d.ts, env.yaml; findByFileName tests name patterns before extensions, so these open with shell highlighting; `src/index.ts`
  - evidence: pattern lists env.<stage> names only; Jest: leaves env.py and env.d.ts to their own languages; src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - root-cause: 2026-11-13T07:16:23Z @kj filename pattern had a bare env\..* alternative and findByFileName tests every name pattern before any extension
  - test-tags: UNIT
  - repro: open a file named env.py in the editor; Python keywords are not coloured
  - log: 2026-11-13T07:12:58Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "UNIT"
  - log: 2026-11-13T07:16:24Z @kj closed
- [x] `DEF-LANG-6-README-ICON` **README names an M icon** - MINOR; README says red M icon; the registered icon is a red file with gears; `README.md`
  - evidence: README Features line reads red Makefile icon (a file with gears)
  - root-cause: 2026-11-13T07:16:24Z @kj README text predates the gears icon
  - test-tags: MANUAL
  - repro: compare README Features with makefileIconStr in src/index.ts
  - log: 2026-11-13T07:13:18Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "MANUAL"
  - log: 2026-11-13T07:16:24Z @kj closed

## Tokenizer `TOKEN`

The Makefile stream parser

- log: 2026-11-13T07:12:58Z @kj category created

- [x] `DEF-TOKEN-2-PAREN-LEAK` **Unclosed $( colours the rest of the file** - MINOR; a $( without its ) on one line paints every later line as a variable reference, e.g. while typing; `src/makefile-mode-simple.ts`
  - evidence: depth resets at line start unless the previous line ended with a backslash; Jest: does not carry an unclosed $( into the next line, carries over a continuation; src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - root-cause: 2026-11-13T07:16:23Z @kj per-line depth reset read stream.lineStart, which StringStream does not have, so the reset never ran
  - test-tags: UNIT
  - repro: type X = $(shell ls with no closing paren above a target line; the target loses its colour
  - log: 2026-11-13T07:12:58Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "UNIT"
  - log: 2026-11-13T07:16:24Z @kj closed
- [x] `DEF-TOKEN-3-ASSIGN-TARGET` **VAR:=value read as target** - MINOR; CC:=gcc with no space before := matches the target pattern, value coloured as dependencies; `src/makefile-mode-simple.ts`
  - evidence: target pattern is :(?!=); Jest: does not read VAR:=value as a target; src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - root-cause: 2026-11-13T07:16:23Z @kj target pattern accepted any colon, including the colon of :=
  - test-tags: UNIT
  - repro: write CC:=gcc on a line; gcc gets the dependency colour
  - log: 2026-11-13T07:12:58Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "UNIT"
  - log: 2026-11-13T07:16:24Z @kj closed
- [x] `DEF-TOKEN-4-DEAD-CODE` **Unused parser and scratch scripts shipped** - MINOR; src/makefile-mode.ts is imported nowhere yet compiled into the npm package; test-parser.js and test-tokenize-lines.js hold stale copies of the parser run by no test; tokenizer keeps a per-token debug array nothing reads
  - evidence: src/makefile-mode.ts, test-parser.js, test-tokenize-lines.js and the lineTokens bookkeeping removed; build, Galata and browser check passed
  - root-cause: 2026-11-13T07:16:23Z @kj debugging leftovers from the first parser version were never removed
  - test-tags: MANUAL
  - repro: grep -rn makefile-mode\' src returns nothing
  - log: 2026-11-13T07:12:58Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "MANUAL"
  - log: 2026-11-13T07:16:24Z @kj closed
- [x] `DEF-TOKEN-5-NO-TEST` **Tokenizer has no test** - MINOR; the only Jest test asserts 1 + 1; the tokenizer and the file name patterns are untested
  - evidence: placeholder replaced by 5 tokenizer tests and 2 file name pattern tests; src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - root-cause: 2026-11-13T07:16:24Z @kj template placeholder spec was never replaced
  - test-tags: UNIT
  - repro: jlpm test runs one placeholder test
  - log: 2026-11-13T07:12:58Z @kj added
  - log: 2026-11-13T07:13:18Z @kj edited test-tags added "UNIT"
  - log: 2026-11-13T07:16:24Z @kj closed
