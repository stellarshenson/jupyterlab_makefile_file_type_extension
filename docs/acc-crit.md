# Acceptance Criteria - jupyterlab_makefile_file_type_extension

Makefile file type, icon and syntax highlighting in JupyterLab.

## Authors

- `@kj` Konrad Jelen

## File recognition `FILE`

Which files get the Makefile type and icon

- log: 2026-11-13T07:13:18Z @kj category created

- [x] `ACC-FILE-1-NAMES` **Standard Makefile names** - HIGH; Makefile, makefile and GNUmakefile open with Makefile highlighting
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: file name patterns, recognises Makefile names
  - test-tags: UNIT
  - log: 2026-11-13T07:13:18Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [x] `ACC-FILE-2-EXTENSIONS` **Makefile extensions** - HIGH; *.mk, *.mak and *.make open with Makefile highlighting
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: the makefile pattern accepts rules.mk; check .mak and .make the same way
  - test-tags: UNIT
  - log: 2026-11-13T07:13:18Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [ ] `ACC-FILE-3-ICON` **Makefile icon** - MEDIUM; Makefile files show the red file-with-gears icon in the file browser
  - test: open a folder holding a Makefile; the row shows the red icon
  - test-tags: MANUAL
  - log: 2026-11-13T07:13:19Z @kj added

## Highlighting `HIGH`

What the tokenizer colours

- log: 2026-11-13T07:13:19Z @kj category created

- [x] `ACC-HIGH-4-TARGETS` **Targets and dependencies** - HIGH; a target name and its dependencies are coloured on a target line
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: makefile tokenizer, highlights targets
  - test-tags: UNIT
  - log: 2026-11-13T07:13:19Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [x] `ACC-HIGH-5-VARIABLES` **Variable references and shell constructs** - HIGH; $(VAR), $$(cmd), $$((expr)) and $$VAR are coloured as references
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: makefile tokenizer, variable references
  - test-tags: UNIT
  - log: 2026-11-13T07:13:19Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [x] `ACC-HIGH-6-CONDITIONALS` **Conditional directives** - MEDIUM; ifeq, ifneq, ifdef, ifndef, else and endif at line start are coloured
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: makefile tokenizer, conditionals
  - test-tags: UNIT
  - log: 2026-11-13T07:13:19Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [x] `ACC-HIGH-7-SPECIAL` **Special targets and silent commands** - MEDIUM; .PHONY style targets and tab-indented @command recipes are coloured
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: makefile tokenizer, special targets and silent commands
  - test-tags: UNIT
  - log: 2026-11-13T07:13:19Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [x] `ACC-HIGH-8-STRINGS` **Line continuations and quoted strings** - MEDIUM; a trailing backslash and single or double quoted strings are coloured; an open $( continues only over a trailing backslash
  - evidence: src/__tests__ Jest 7 of 7 green in build_test.py at 1.0.106
  - test: Jest: makefile tokenizer, strings and continuation
  - test-tags: UNIT
  - log: 2026-11-13T07:13:19Z @kj added
  - log: 2026-11-13T07:16:25Z @kj closed
- [ ] `ACC-HIGH-9-TAB-RECIPE` **Only tab-indented recipes are coloured** - LOW; a space-indented @command recipe gets no recipe colour, as the README states
  - test: type four spaces then @echo under a target; no builtin colour
  - test-tags: MANUAL
  - log: 2026-11-13T07:13:19Z @kj added
