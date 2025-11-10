import { StreamParser } from '@codemirror/language';

const variableRegex = /\$[\({][A-Za-z0-9_]+[\)}]/;

export const makefile: StreamParser<{
  inRecipe: boolean;
  inComment: boolean;
}> = {
  name: 'makefile',

  startState: () => ({
    inRecipe: false,
    inComment: false
  }),

  token: (stream, state) => {
    const ch = stream.peek();

    // Comments
    if (ch === '#') {
      stream.skipToEnd();
      return 'comment';
    }

    // Recipe lines (commands starting with tab)
    if (stream.sol() && ch === '\t') {
      state.inRecipe = true;
      stream.next();
      return 'meta';
    }

    // Reset recipe state at start of non-tab line
    if (stream.sol() && ch !== '\t') {
      state.inRecipe = false;
    }

    // Inside recipe - treat as shell commands
    if (state.inRecipe) {
      // Variables in recipes
      if (ch === '$') {
        if (stream.match(variableRegex)) {
          return 'variableName';
        }
        stream.next();
        return 'variableName';
      }
      // Shell operators and keywords
      if (stream.match(/^(if|then|else|fi|for|in|do|done|case|esac|while|until)\b/)) {
        return 'keyword';
      }
      if (stream.match(/^(echo|cd|mkdir|rm|cp|mv|grep|sed|awk|make)\b/)) {
        return 'keyword';
      }
      stream.next();
      return null;
    }

    // Variable assignments (e.g., VERSION := ...)
    if (stream.sol() || stream.match(/^\s*/)) {
      const match = stream.match(/^[A-Z_][A-Z0-9_]*\s*[:?+]?=/, false);
      if (match) {
        const varName = stream.match(/^[A-Z_][A-Z0-9_]*/);
        if (varName) {
          stream.match(/\s*[:?+]?=/);
          return 'variableName.definition strong';
        }
      }
    }

    // Target definitions (e.g., build:)
    if (stream.sol() || (stream.match(/^\s*/) && stream.sol())) {
      const targetMatch = stream.match(/^[a-zA-Z0-9_-]+(?=\s*:)/);
      if (targetMatch) {
        return 'keyword.control strong';
      }
    }

    // Special targets (.PHONY, .DEFAULT_GOAL, etc.)
    if (stream.match(/^\.[A-Z_]+/)) {
      return 'keyword.control';
    }

    // Variable references
    if (ch === '$') {
      if (stream.match(variableRegex)) {
        return 'variableName';
      }
      if (stream.match(/\$[@<^+?*%]/)) {
        return 'variableName.special';
      }
      stream.next();
      return 'variableName';
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const quote = stream.next();
      while (!stream.eol()) {
        const next = stream.next();
        if (next === quote) {
          break;
        }
        if (next === '\\') {
          stream.next();
        }
      }
      return 'string';
    }

    // Operators
    if (stream.match(/[:=]/) || stream.match(/[?+:]=/)) {
      return 'operator';
    }

    // Functions (e.g., $(shell ...), $(wildcard ...))
    if (stream.match(/\$\(shell\b|\$\(wildcard\b|\$\(patsubst\b|\$\(filter\b/)) {
      return 'keyword';
    }

    stream.next();
    return null;
  }
};
