# Release v1.0.5

## Overview

Initial stable release of the JupyterLab Makefile Extension providing comprehensive syntax highlighting and file type support for Makefiles in JupyterLab 4.

## What's New

This release introduces a complete Makefile editing experience in JupyterLab with intelligent syntax highlighting and custom file type recognition.

**Custom Syntax Highlighting**:
- Purpose-built CodeMirror language mode with accurate token recognition
- Target definitions highlighted in bold with distinct keyword styling
- Variable references colored differently: Make-style `$(VAR)` vs shell-style `${VAR}`
- Automatic variables (`$@`, `$<`, `$^`) highlighted distinctly
- Make functions (`$(shell ...)`, `$(wildcard ...)`, `$(patsubst ...)`) recognized as keywords
- Line continuation backslashes (`\`) at end of lines highlighted prominently
- Quoted strings properly recognized throughout
- Tab-indented recipe lines distinguished from regular content

**File Type Support**:
- Recognizes `Makefile`, `makefile`, `GNUmakefile`, and `*.mk` files
- VS Code-style bold red "M" icon for easy identification in file browser
- Proper MIME type registration (`text/x-makefile`)

**Developer Experience**:
- Improved code readability with semantic highlighting
- Visual aids for complex Makefile constructs
- Better distinction between different syntax elements

## Requirements

- JupyterLab >= 4.0.0

## Installation

### From PyPI

```bash
pip install jupyterlab-makefile-file-type-extension
```

### From npm

```bash
npm install jupyterlab_makefile_file_type_extension
```

## Repository

https://github.com/stellarshenson/jupyterlab_makefile_file_type_extension

---

# Release Process Documentation

For maintainers: see below for instructions on creating new releases.

## Manual Release

### Python Package

Install build tools:

```bash
pip install build twine hatch
```

Bump version using hatch:

```bash
hatch version <new-version>
```

Clean development files:

```bash
jlpm clean:all
git clean -dfX
```

Build package:

```bash
python -m build
```

Upload to PyPI:

```bash
twine upload dist/*
```

### NPM Package

```bash
npm login
npm publish --access public
```

## Automated Releases

The repository is compatible with Jupyter Releaser:

1. Go to Actions panel
2. Run "Step 1: Prep Release" workflow
3. Check draft changelog
4. Run "Step 2: Publish Release" workflow

See [Jupyter Releaser documentation](https://jupyter-releaser.readthedocs.io/en/latest/get_started/making_release_from_repo.html) for details.

## Publishing to conda-forge

For initial submission: https://conda-forge.org/docs/maintainer/adding_pkgs.html

For updates: Bot automatically opens PR on feedstock when new PyPI version is detected.
