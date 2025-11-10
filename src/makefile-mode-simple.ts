import { StreamParser } from '@codemirror/language';

export const makefileSimple: StreamParser<{
  parenDepth: number;
  lastLineStart: number;
  lastLineText: string;
  lineTokens: Array<{start: number, end: number, text: string, type: string | null}>;
}> = {
  name: 'makefile',

  startState: () => ({
    parenDepth: 0,
    lastLineStart: -1,
    lastLineText: '',
    lineTokens: []
  }),

  token: (stream, state) => {
    const ch = stream.peek();
    const startPos = stream.pos;
    const lineText = (stream as any).string || '';

    // Reset paren depth only when moving to NEW line
    const currentLineStart = (stream as any).lineStart || 0;
    if (currentLineStart !== state.lastLineStart) {
      state.parenDepth = 0;
      state.lastLineStart = currentLineStart;
      state.lastLineText = lineText;
      state.lineTokens = [];
    }

    let tokenType: string | null = null;

    // Comments
    if (ch === '#') {
      stream.skipToEnd();
      tokenType = 'comment';
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
    else if (stream.sol() && stream.match(/^[a-zA-Z0-9_\-\.]+:/, false)) {
      // Match target name only
      const targetMatch = stream.match(/^[a-zA-Z0-9_\-\.]+/);
      if (targetMatch) {
        tokenType = 'keyword.control strong';
      } else {
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
    // Handle $( - MUST come before string handling
    else if (ch === '$' && stream.match(/\$\(/, false)) {
      stream.next();
      stream.next();
      state.parenDepth++;
      console.log(`  [DEPTH] pos=${startPos} $( -> depth=${state.parenDepth}`);
      tokenType = 'processingInstruction';
    }
    // Track nested ( inside $(...)
    else if (ch === '(' && state.parenDepth > 0) {
      state.parenDepth++;
      stream.next();
      console.log(`  [DEPTH] pos=${startPos} ( inside $(...) -> depth=${state.parenDepth}`);
      tokenType = null;
    }
    // Track ) inside $(...)
    else if (ch === ')' && state.parenDepth > 0) {
      state.parenDepth--;
      stream.next();
      console.log(`  [DEPTH] pos=${startPos} ) inside $(...) -> depth=${state.parenDepth}`);
      tokenType = state.parenDepth === 0 ? 'processingInstruction' : null;
    }
    // Inside $(...) - mark everything as processingInstruction
    else if (state.parenDepth > 0) {
      // Inside $(...)
      if (ch === '"') {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === '"') break;
          if (n === '\\') stream.next();
        }
        tokenType = 'processingInstruction';
      } else if (ch === "'") {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === "'") break;
          if (n === '\\') stream.next();
        }
        tokenType = 'processingInstruction';
      } else {
        stream.next();
        tokenType = 'processingInstruction';
      }
    }
    // Strings - double quote (outside $(...)
    else if (ch === '"') {
      stream.next();
      while (!stream.eol()) {
        const n = stream.next();
        if (n === '"') break;
        if (n === '\\') stream.next();
      }
      tokenType = 'string';
    }
    // Strings - single quote (outside $(...)
    else if (ch === "'") {
      stream.next();
      while (!stream.eol()) {
        const n = stream.next();
        if (n === "'") break;
        if (n === '\\') stream.next();
      }
      tokenType = 'string';
    }
    // Default - consume one character
    else {
      stream.next();
      tokenType = null;
    }

    // Record this token
    const endPos = stream.pos;
    const text = lineText.slice(startPos, endPos);
    const tokenInfo = {
      start: startPos,
      end: endPos,
      text: text,
      type: tokenType
    };
    state.lineTokens.push(tokenInfo);

    // If we reached end of line, flush the summary
    if (stream.eol()) {
      const tokenSummary = state.lineTokens
        .filter(t => t.type !== null)
        .map(t => `[${t.start}-${t.end}] ${(t.type as string).padEnd(22)} ${t.text}`)
        .join('\n  ');

      console.log(`\n${'='.repeat(80)}`);
      console.log(`LINE: ${lineText}`);
      console.log(`${'='.repeat(80)}`);
      if (tokenSummary) {
        console.log(`  ${tokenSummary}`);
      }
      console.log(`${'='.repeat(80)}\n`);

      // Clear tokens after logging
      state.lineTokens = [];
    }

    return tokenType;
  }
};
