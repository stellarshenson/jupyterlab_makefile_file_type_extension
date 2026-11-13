import { StreamParser } from '@codemirror/language';

export const makefileSimple: StreamParser<{
  parenDepth: number;
  continued: boolean;
}> = {
  name: 'makefile',

  startState: () => ({
    parenDepth: 0,
    continued: false
  }),

  token: (stream, state) => {
    const ch = stream.peek();
    const startPos = stream.pos;
    const lineText = stream.string;

    // A $( left open ends with its logical line: only a trailing backslash
    // carries the depth into the next line
    if (stream.sol() && !state.continued) {
      state.parenDepth = 0;
    }

    let tokenType: string | null = null;

    // Comments
    if (ch === '#') {
      stream.skipToEnd();
      tokenType = 'comment';
    }
    // Recipe commands with @ prefix (e.g., @echo, @mkdir)
    // Only accept tab (proper Makefile syntax)
    else if (
      stream.sol() &&
      stream.match(/^\t@[a-zA-Z_][a-zA-Z0-9_-]*/, false)
    ) {
      stream.match(/^\t/); // Consume tab
      stream.match(/^@/); // Consume @
      stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*/); // Consume command
      tokenType = 'builtin';
    }
    // Special targets (.PHONY, .DEFAULT_GOAL, etc.) - MUST check before regular targets
    else if (stream.sol() && stream.match(/^\.[A-Z_]+/, false)) {
      stream.match(/^\.[A-Z_]+/);
      tokenType = 'builtin';
    }
    // Make conditional keywords (ifeq, ifneq, ifdef, ifndef, else, endif)
    else if (
      stream.sol() &&
      stream.match(/^(ifeq|ifneq|ifdef|ifndef|else|endif)\b/, false)
    ) {
      stream.match(/^(ifeq|ifneq|ifdef|ifndef|else|endif)\b/);
      tokenType = 'builtin';
    }
    // Variable assignments (e.g., TEST := ...) - MUST check before targets
    else if (stream.sol() && stream.match(/^[A-Z_][A-Z0-9_]*/, false)) {
      const varName = stream.match(/^[A-Z_][A-Z0-9_]*/);
      if (varName && stream.match(/\s*[:?+]?=/, false)) {
        stream.match(/\s*[:?+]?=/);
        tokenType = 'variableName.definition strong';
      } else {
        tokenType = null;
      }
    }
    // Target definitions (e.g., build: dependencies)
    else if (stream.sol() && stream.match(/^[a-zA-Z0-9_\-.]+:(?!=)/, false)) {
      // Match target name only
      const targetMatch = stream.match(/^[a-zA-Z0-9_\-.]+/);
      if (targetMatch) {
        tokenType = 'keyword.control strong';
      } else {
        tokenType = null;
      }
    }
    // Target dependencies (everything after : on target line until EOL or #)
    else if (
      !stream.sol() &&
      lineText.match(/^[a-zA-Z0-9_\-.]+:(?!=)/) &&
      ch !== '#' &&
      !stream.eol()
    ) {
      // Check if we're past the colon on a target line
      const colonPos = lineText.indexOf(':');
      if (colonPos >= 0 && startPos > colonPos) {
        // Consume until end of line or comment
        if (ch === '#') {
          // Let comment handler take over
          tokenType = null;
        } else {
          stream.next();
          tokenType = 'processingInstruction';
        }
      } else {
        stream.next();
        tokenType = null;
      }
    }
    // Operators
    else if (stream.match(/[:?+]?=/)) {
      tokenType = 'operator';
    }
    // Colon (for targets)
    else if (stream.match(/:/)) {
      tokenType = 'operator';
    }
    // Handle $$(( - shell arithmetic expansion (must check before $$()
    else if (ch === '$' && stream.match(/\$\$\(\(/, false)) {
      stream.next();
      stream.next();
      stream.next();
      stream.next();
      state.parenDepth += 2;
      tokenType = 'property';
    }
    // Handle $$( - shell command substitution (must check before $()
    else if (ch === '$' && stream.match(/\$\$\(/, false)) {
      stream.next();
      stream.next();
      stream.next();
      state.parenDepth++;
      tokenType = 'property';
    }
    // Handle $( - MUST come before string handling
    else if (ch === '$' && stream.match(/\$\(/, false)) {
      stream.next();
      stream.next();
      state.parenDepth++;
      tokenType = 'property';
    }
    // Handle $$ variables (e.g., $$HOME, $$PATH, $$cols)
    else if (ch === '$' && stream.match(/\$\$[a-zA-Z_][a-zA-Z0-9_]*/, false)) {
      stream.match(/\$\$[a-zA-Z_][a-zA-Z0-9_]*/);
      tokenType = 'property';
    }
    // Track nested ( inside $(...)
    else if (ch === '(' && state.parenDepth > 0) {
      state.parenDepth++;
      stream.next();
      tokenType = null;
    }
    // Track ) inside $(...)
    else if (ch === ')' && state.parenDepth > 0) {
      state.parenDepth--;
      stream.next();
      // Color all closing ) inside $(...) as property
      tokenType = 'property';
    }
    // Inside $(...) - mark everything as type
    else if (state.parenDepth > 0) {
      // Inside $(...)
      if (ch === '"') {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === '"') break;
          if (n === '\\') {
            // Check if this backslash is trailing (next char is EOL)
            if (stream.eol()) {
              // Don't consume it - let it be handled as trailing backslash
              stream.backUp(1);
              break;
            }
            stream.next(); // Consume escaped character
          }
        }
        tokenType = 'property';
      } else if (ch === "'") {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === "'") break;
          if (n === '\\') {
            // Check if this backslash is trailing (next char is EOL)
            if (stream.eol()) {
              // Don't consume it - let it be handled as trailing backslash
              stream.backUp(1);
              break;
            }
            stream.next(); // Consume escaped character
          }
        }
        tokenType = 'property';
      } else {
        stream.next();
        tokenType = 'property';
      }
    }
    // Strings - double quote (outside $(...)
    else if (ch === '"') {
      stream.next();
      while (!stream.eol()) {
        const n = stream.next();
        if (n === '"') break;
        if (n === '\\') {
          // Check if this backslash is trailing (next char is EOL)
          if (stream.eol()) {
            // Don't consume it - let it be handled as trailing backslash
            stream.backUp(1);
            break;
          }
          stream.next(); // Consume escaped character
        }
      }
      tokenType = 'string';
    }
    // Strings - single quote (outside $(...)
    else if (ch === "'") {
      stream.next();
      while (!stream.eol()) {
        const n = stream.next();
        if (n === "'") break;
        if (n === '\\') {
          // Check if this backslash is trailing (next char is EOL)
          if (stream.eol()) {
            // Don't consume it - let it be handled as trailing backslash
            stream.backUp(1);
            break;
          }
          stream.next(); // Consume escaped character
        }
      }
      tokenType = 'string';
    }
    // Trailing backslash line continuation (must be last character on line)
    else if (ch === '\\') {
      stream.next();
      // Check if this is the last character (end of line)
      if (stream.eol()) {
        tokenType = 'builtin';
      } else {
        tokenType = null;
      }
    }
    // Default - consume one character
    else {
      stream.next();
      tokenType = null;
    }

    if (stream.eol()) {
      state.continued = lineText.endsWith('\\');
    }

    return tokenType;
  }
};
