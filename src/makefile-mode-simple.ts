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
      // Log the previous line's tokens
      if (state.lineTokens.length > 0 && state.lastLineText) {
        const tokenSummary = state.lineTokens.map(t =>
          `[${t.start}-${t.end}] ${(t.type || 'null').padEnd(22)} ${t.text}`
        ).join('\n  ');

        console.log(`\n${'='.repeat(80)}`);
        console.log(`LINE: ${state.lastLineText}`);
        console.log(`${'='.repeat(80)}`);
        console.log(`  ${tokenSummary}`);
        console.log(`${'='.repeat(80)}\n`);
      }

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
    // Handle $( - MUST come before string handling
    else if (ch === '$' && stream.match(/\$\(/, false)) {
      stream.next();
      stream.next();
      state.parenDepth++;
      tokenType = 'processingInstruction';
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
      tokenType = state.parenDepth === 0 ? 'processingInstruction' : null;
    }
    // Strings - double quote
    else if (ch === '"') {
      if (state.parenDepth === 0) {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === '"') break;
          if (n === '\\') stream.next();
        }
        tokenType = 'string';
      } else {
        stream.next();
        tokenType = 'atom';
      }
    }
    // Strings - single quote
    else if (ch === "'") {
      if (state.parenDepth === 0) {
        stream.next();
        while (!stream.eol()) {
          const n = stream.next();
          if (n === "'") break;
          if (n === '\\') stream.next();
        }
        tokenType = 'string';
      } else {
        stream.next();
        tokenType = 'atom';
      }
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

    // Log token immediately
    console.log(`[${tokenInfo.start}-${tokenInfo.end}] ${(tokenInfo.type || 'null').padEnd(22)} ${tokenInfo.text}`);

    // If we reached end of line, flush the summary
    if (stream.eol()) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`COMPLETE LINE: ${lineText}`);
      console.log(`${'='.repeat(80)}\n`);
    }

    return tokenType;
  }
};
