# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## [1.0.100] - 2026-10-30

### Changed

- The npm package is now `@stellarshenson/jupyterlab-makefile-file-type-extension`; the labextension path and the plugin id take the same name
- The Python module and the PyPI distribution keep their names, so `pip install` does not change
- Moved to extension template v4.6.5 and Makefile 1.46; the build uses `@jupyter/builder` and lint uses ESLint 9
- Requires JupyterLab >= 4.6.0 and Python >= 3.10

### Fixed

- The plugin id no longer holds an underscore, which the URI parser of JupyterLab 4.6.5 refuses in an unscoped id

## v1.0.80 (2025-11-10)

### Features

- Add Make conditional keywords support (ifeq, ifneq, ifdef, ifndef, else, endif)
- Add trailing backslash line continuation highlighting in all contexts
- Add recipe command @ prefix support for silent commands (tab-indented only)
- Add target dependency highlighting as processingInstruction
- Add support for $$VARIABLE, $$(…), and $$((…)) constructs

### Bug Fixes

- Fix incorrect null styling for closing parentheses in nested $(…) constructs
- Fix string parsing bugs both inside and outside $(…) constructs
- Fix quote matching where double-quoted strings incorrectly closed on single quotes

### Improvements

- Simplified closing parenthesis logic to color all ) inside $(…) as property
- Modified string parsing to detect trailing backslash and exclude from string tokens
- Disabled debug console.log statements for production use

### Documentation

- Add comprehensive tab configuration instructions to README
- Clarify that all recipe commands require tab indentation (not spaces)
- Streamline features section following modus primaris principles
- Separate file recognition and icon details into distinct section

<!-- <END NEW CHANGELOG ENTRY> -->
