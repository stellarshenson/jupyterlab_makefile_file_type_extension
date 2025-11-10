import { StreamParser } from '@codemirror/language';

const variableRegex = /\$[\({][A-Za-z0-9_]+[\)}]/;
const shellVariableRegex = /\$\{[A-Za-z0-9_]+\}/;
const makeVariableRegex = /\$\([A-Za-z0-9_]+\)/;

export const makefile: StreamParser<{
  inRecipe: boolean;
  inComment: boolean;
  parenDepth: number;
}> = {
  name: 'makefile',

  startState: () => {
    return {
      inRecipe: false,
      inComment: false,
      parenDepth: 0
    };
  },

  token: (stream, state) => {
    const ch = stream.peek();

    // Reset paren depth at start of line
    if (stream.sol()) {
      state.parenDepth = 0;
    }

    // Line continuation backslash at end of line (must be last char)
    if (ch === '\\') {
      const pos = stream.pos;
      stream.next();
      // Check if this is truly at end of line (no trailing whitespace)
      if (stream.eol()) {
        return 'escape';
      }
      // Not at EOL, backtrack
      stream.pos = pos;
    }

    // Comments
    if (ch === '#') {
      stream.skipToEnd();
      return 'comment';
    }

    // Handle $( constructs - check this BEFORE anything else
    if (ch === '$' && stream.match(/\$\(/, false)) {
      stream.next(); // consume $
      stream.next(); // consume (
      state.parenDepth++;
      return 'processingInstruction';
    }

    // Closing ) when inside $(...)
    if (ch === ')' && state.parenDepth > 0) {
      state.parenDepth--;
      stream.next();
      return 'processingInstruction';
    }

    // Strings - only parse when NOT inside $(...) constructs
    // When inside $(...), skip quotes without treating them as strings
    if (ch === '"') {
      if (state.parenDepth === 0) {
        stream.next(); // consume opening "
        while (!stream.eol()) {
          const next = stream.next();
          if (next === '"') {
            break; // found matching closing "
          }
          if (next === '\\') {
            stream.next(); // skip escaped character
          }
        }
        return 'string';
      } else {
        // Inside $(...)  - just consume the quote as normal text
        stream.next();
        return 'atom'; // Use atom color for quotes inside shell commands
      }
    }
    if (ch === "'") {
      if (state.parenDepth === 0) {
        stream.next(); // consume opening '
        while (!stream.eol()) {
          const next = stream.next();
          if (next === "'") {
            break; // found matching closing '
          }
          if (next === '\\') {
            stream.next(); // skip escaped character
          }
        }
        return 'string';
      } else {
        // Inside $(...) - just consume the quote as normal text
        stream.next();
        return 'atom'; // Use atom color for quotes inside shell commands
      }
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
        return 'keyword strong';
      }
    }

    // Special targets (.PHONY, .DEFAULT_GOAL, etc.)
    if (stream.match(/^\.[A-Z_]+/)) {
      return 'keyword';
    }

    // Variable references
    if (ch === '$') {
      // Make function calls like $(shell ...), $(wildcard ...)
      if (stream.match(/\$\(shell\b/)) {
        return 'keyword';
      }
      if (stream.match(/\$\(wildcard\b|\$\(patsubst\b|\$\(filter\b|\$\(subst\b|\$\(foreach\b/)) {
        return 'keyword';
      }
      // Shell-style variables ${VAR} - use member color (like Python class members)
      if (stream.match(shellVariableRegex)) {
        return 'propertyName';
      }
      // Make-style variables $(VAR) - use member color (like Python class members)
      if (stream.match(makeVariableRegex)) {
        return 'propertyName';
      }
      // Automatic variables $@, $<, etc. - use special color
      if (stream.match(/\$[@<^+?*%|]/)) {
        return 'variableName.special';
      }
      // Fallback for other $ uses
      stream.next();
      return 'variableName';
    }

    // Operators
    if (stream.match(/[:=]/) || stream.match(/[?+:]=/)) {
      return 'operator';
    }

    stream.next();
    return null;
  }
};
